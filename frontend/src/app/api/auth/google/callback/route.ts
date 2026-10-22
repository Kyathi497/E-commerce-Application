import { cookies } from "next/headers";
import { googleRedirectUri, OAUTH_COOKIE, startSession, unsign } from "@/lib/session";
import { upsertGoogleUser } from "@/lib/users";

function fail(origin: string) {
  return Response.redirect(new URL("/login?error=google", origin), 303);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const store = await cookies();
  const saved = await unsign<{ state: string; next: string; exp: number }>(store.get(OAUTH_COOKIE)?.value);
  store.delete(OAUTH_COOKIE);

  const code = url.searchParams.get("code");
  if (!saved || !code || url.searchParams.get("state") !== saved.state) return fail(url.origin);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: googleRedirectUri(request),
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    console.error("Google token exchange failed", tokenRes.status, await tokenRes.text());
    return fail(url.origin);
  }
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!infoRes.ok) return fail(url.origin);
  const info = (await infoRes.json()) as { sub: string; email?: string; email_verified?: boolean; name?: string };
  if (!info.sub || !info.email || !info.email_verified) return fail(url.origin);

  const user = await upsertGoogleUser({ googleId: info.sub, email: info.email, name: info.name ?? "" });
  await startSession(user.id);
  return Response.redirect(new URL(saved.next, url.origin), 303);
}

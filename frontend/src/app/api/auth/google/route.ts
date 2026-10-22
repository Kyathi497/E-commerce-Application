import { randomBytes } from "node:crypto";
import { googleConfigured, googleRedirectUri, OAUTH_COOKIE, safeNext, setShortCookie, sign } from "@/lib/session";

// Starts Google sign-in. Without GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET the
// store is in test mode and the login page offers a labelled simulation.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));

  if (!googleConfigured()) {
    const back = new URL("/login", url.origin);
    back.searchParams.set("google", "test");
    if (next !== "/") back.searchParams.set("next", next);
    return Response.redirect(back, 303);
  }

  const state = randomBytes(16).toString("base64url");
  await setShortCookie(OAUTH_COOKIE, await sign({ state, next, exp: Date.now() + 10 * 60 * 1000 }), 600);

  const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  auth.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: googleRedirectUri(request),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  }).toString();
  return Response.redirect(auth, 303);
}

import { clientKey, readJson, startSession, tooManyAttempts } from "@/lib/session";
import { findUserByEmail, normalizeEmail, toPublic, verifyPassword } from "@/lib/users";

const str = (v: unknown) => (typeof v === "string" ? v : "");

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return Response.json({ error: "Invalid request." }, { status: 400 });

  const email = normalizeEmail(str(body.email));
  const password = str(body.password);

  const fields: Record<string, string> = {};
  if (!email) fields.email = "Enter your email.";
  if (!password) fields.password = "Enter your password.";
  if (Object.keys(fields).length) return Response.json({ error: "Please check the highlighted fields.", fields }, { status: 422 });

  if (tooManyAttempts(`login:${clientKey(request)}:${email}`)) {
    return Response.json({ error: "Too many tries. Please wait 10 minutes and try again." }, { status: 429 });
  }

  const user = await findUserByEmail(email);
  const ok = await verifyPassword(password.slice(0, 200), user?.passwordHash);

  if (user && !user.passwordHash) {
    return Response.json(
      { error: "This email signs in with Google. Use “Continue with Google” above.", code: "use_google" },
      { status: 401 },
    );
  }
  if (!user || !ok) {
    return Response.json({ error: "That email and password don't match. Check them and try again." }, { status: 401 });
  }

  await startSession(user.id);
  return Response.json({ user: toPublic(user) });
}

import { clientKey, readJson, startSession, tooManyAttempts } from "@/lib/session";
import { createUser, EmailTakenError, hashPassword, toPublic } from "@/lib/users";

const str = (v: unknown) => (typeof v === "string" ? v : "");

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return Response.json({ error: "Invalid request." }, { status: 400 });

  const name = str(body.name).trim();
  const email = str(body.email).trim();
  const password = str(body.password);

  const fields: Record<string, string> = {};
  if (name.length < 2) fields.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.email = "Enter an email address like name@example.com.";
  if (password.length < 8) fields.password = "Use at least 8 characters.";
  else if (password.length > 200) fields.password = "Use 200 characters or fewer.";
  if (Object.keys(fields).length) return Response.json({ error: "Please check the highlighted fields.", fields }, { status: 422 });

  if (tooManyAttempts(`register:${clientKey(request)}`, 20, 60 * 60 * 1000)) {
    return Response.json({ error: "Too many sign-ups from this connection. Please try again in an hour." }, { status: 429 });
  }

  try {
    const user = await createUser({ name, email, passwordHash: await hashPassword(password) });
    await startSession(user.id);
    return Response.json({ user: toPublic(user) });
  } catch (e) {
    if (e instanceof EmailTakenError) {
      return Response.json(
        { error: "An account with this email already exists.", fields: { email: "This email already has an account. Log in instead." }, code: "email_taken" },
        { status: 409 },
      );
    }
    throw e;
  }
}

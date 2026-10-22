import { createHash } from "node:crypto";
import { googleConfigured, readJson, startSession } from "@/lib/session";
import { findUserByEmail, toPublic, upsertGoogleUser } from "@/lib/users";

// Test mode only: stands in for Google until real keys are added.
export async function POST(request: Request) {
  if (googleConfigured()) return Response.json({ error: "Google sign-in is live; use the Google button." }, { status: 404 });

  const body = await readJson(request);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter an email address like name@gmail.com." }, { status: 422 });
  }

  // Never let the simulation take over an account that has a password.
  const existing = await findUserByEmail(email);
  if (existing?.passwordHash) {
    return Response.json({ error: "That email already has a password account. Log in with your password instead." }, { status: 409 });
  }

  const googleId = "test_" + createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 16);
  const name = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const user = await upsertGoogleUser({ googleId, email, name });
  await startSession(user.id);
  return Response.json({ user: toPublic(user) });
}

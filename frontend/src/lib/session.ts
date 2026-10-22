import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { DATA_DIR, findUserById } from "./users";

const SESSION_COOKIE = "tej_session";
const SESSION_DAYS = 30;

// AUTH_SECRET signs session cookies. In test mode without one, a random secret
// is generated once and kept in .data/ so sessions survive dev-server restarts.
let secretPromise: Promise<string> | null = null;
function secret() {
  if (process.env.AUTH_SECRET) return Promise.resolve(process.env.AUTH_SECRET);
  secretPromise ??= (async () => {
    const file = path.join(DATA_DIR, "auth-secret");
    try {
      return (await readFile(file, "utf8")).trim();
    } catch {
      const s = randomBytes(32).toString("base64url");
      await mkdir(DATA_DIR, { recursive: true });
      await writeFile(file, s);
      return s;
    }
  })();
  return secretPromise;
}

// Compact signed token: base64url(JSON payload) + "." + HMAC-SHA256.
export async function sign(payload: Record<string, unknown>) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = createHmac("sha256", await secret()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export async function unsign<T extends { exp: number }>(token: string | undefined): Promise<T | null> {
  const [body, mac] = token?.split(".") ?? [];
  if (!body || !mac) return null;
  const expected = createHmac("sha256", await secret()).update(body).digest();
  const actual = Buffer.from(mac, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as T;
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function startSession(userId: string) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const token = await sign({ uid: userId, exp: Date.now() + maxAge * 1000 });
  (await cookies()).set(SESSION_COOKIE, token, { ...cookieBase, maxAge });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function currentUser() {
  const session = await unsign<{ uid: string; exp: number }>((await cookies()).get(SESSION_COOKIE)?.value);
  return session ? findUserById(session.uid) : null;
}

export async function setShortCookie(name: string, value: string, maxAge: number) {
  (await cookies()).set(name, value, { ...cookieBase, maxAge });
}

export const googleConfigured = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const OAUTH_COOKIE = "tej_oauth";

export function googleRedirectUri(request: Request) {
  return process.env.GOOGLE_REDIRECT_URI || `${new URL(request.url).origin}/api/auth/google/callback`;
}

// Only same-site paths are allowed as a post-login destination.
export function safeNext(next: unknown) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
    ? next
    : "/";
}

// Rejects cross-site form posts: our own fetch calls always send JSON.
export function isJsonRequest(request: Request) {
  return (request.headers.get("content-type") ?? "").split(";")[0].trim() === "application/json";
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  if (!isJsonRequest(request)) return null;
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

// In-memory attempt limiter (per server process): enough to slow down password
// guessing in test mode. Use your provider's limiter in production.
const attempts = new Map<string, { n: number; until: number }>();
export function tooManyAttempts(key: string, max = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const a = attempts.get(key);
  if (!a || a.until < now) {
    attempts.set(key, { n: 1, until: now + windowMs });
    return false;
  }
  a.n += 1;
  return a.n > max;
}

export function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

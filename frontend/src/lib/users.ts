import "server-only";
import { randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import type { Customer } from "./order";

// Test-mode account store: a JSON file in .data/ (gitignored).
// It works for local development and a single long-running server, but not on
// serverless hosts with a read-only disk. Swap these functions for a real
// database (Supabase, Postgres, …) before going live; nothing else changes.

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  details?: Customer;
  createdAt: string;
}

// What the browser is allowed to see.
export interface PublicUser {
  name: string;
  email: string;
  details?: Customer;
}

export const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "users.json");

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

let queue: Promise<unknown> = Promise.resolve();

async function readAll(): Promise<User[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as User[];
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

// Serialise writes so two sign-ups at once can't overwrite each other.
function mutate<T>(fn: (users: User[]) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const users = await readAll();
    const result = await fn(users);
    await mkdir(DATA_DIR, { recursive: true });
    const tmp = `${FILE}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(users, null, 2));
    await rename(tmp, FILE);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function toPublic(u: User): PublicUser {
  return { name: u.name, email: u.email, details: u.details };
}

export async function findUserById(id: string) {
  return (await readAll()).find((u) => u.id === id) ?? null;
}

export async function findUserByEmail(email: string) {
  const e = normalizeEmail(email);
  return (await readAll()).find((u) => u.email === e) ?? null;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

// A fixed hash to compare against when the email is unknown, so a miss takes
// as long as a wrong password.
const DUMMY_HASH = hashPassword(randomUUID());

export async function verifyPassword(password: string, stored: string | undefined) {
  const [scheme, salt, key] = (stored ?? (await DUMMY_HASH)).split("$");
  if (scheme !== "scrypt" || !salt || !key) return false;
  const expected = Buffer.from(key, "base64");
  const actual = await scryptAsync(password, Buffer.from(salt, "base64"), expected.length);
  return stored !== undefined && timingSafeEqual(actual, expected);
}

export class EmailTakenError extends Error {}

export function createUser(input: { name: string; email: string; passwordHash?: string; googleId?: string }) {
  return mutate((users) => {
    const email = normalizeEmail(input.email);
    if (users.some((u) => u.email === email)) throw new EmailTakenError();
    const user: User = {
      id: randomUUID(),
      name: input.name.trim(),
      email,
      passwordHash: input.passwordHash,
      googleId: input.googleId,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    return user;
  });
}

// Google sign-in: match on the Google account first, then on a verified email
// (linking it to the existing account), else create a new account.
export function upsertGoogleUser(input: { googleId: string; email: string; name: string }) {
  return mutate((users) => {
    const email = normalizeEmail(input.email);
    const existing = users.find((u) => u.googleId === input.googleId) ?? users.find((u) => u.email === email);
    if (existing) {
      existing.googleId = input.googleId;
      return existing;
    }
    const user: User = {
      id: randomUUID(),
      name: input.name.trim() || email.split("@")[0],
      email,
      googleId: input.googleId,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    return user;
  });
}

export function saveDetails(id: string, details: Customer) {
  return mutate((users) => {
    const user = users.find((u) => u.id === id);
    if (user) user.details = details;
    return user ?? null;
  });
}

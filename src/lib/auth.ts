import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type UserRole = "Patient" | "Doctor" | "Admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const SESSION_SECONDS = 60 * 60 * 24 * 7; // 7 days

function sessionSecret() {
  return process.env.AUTH_SECRET || "doctorforhome-secure-auth-secret-key-2026-phase1";
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, expectedHex] = storedHash.split(":");
  if (!salt || !expectedHex) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createSessionToken(user: AuthUser) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ ...user, iat: now, exp: now + SESSION_SECONDS }),
  ).toString("base64url");
  const unsignedToken = `${header}.${payload}`;
  const signature = createHmac("sha256", sessionSecret()).update(unsignedToken).digest("base64url");
  return `${unsignedToken}.${signature}`;
}

export function readSessionToken(token?: string): AuthUser | null {
  if (!token) return null;
  const [header, payload, signature, extra] = token.split(".");
  if (!header || !payload || !signature || extra) return null;

  const unsignedToken = `${header}.${payload}`;
  const expected = createHmac("sha256", sessionSecret()).update(unsignedToken).digest();
  let provided: Buffer;
  try {
    provided = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AuthUser & { exp?: number };
    if (!claims.id || !claims.name || !claims.email || !["Patient", "Doctor", "Admin"].includes(claims.role)) return null;
    if (!claims.exp || claims.exp <= Math.floor(Date.now() / 1000)) return null;
    return { id: claims.id, name: claims.name, email: claims.email, role: claims.role };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "doctors4home_session";
export const SESSION_MAX_AGE = SESSION_SECONDS;

/**
 * Server-side helper to read the authenticated user from cookies (for Server Components / Actions)
 */
export async function getSessionUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    return readSessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Helper to extract user from Request headers (for Route Handlers)
 */
export function getAuthFromRequest(request: Request): AuthUser | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const token = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  return readSessionToken(token ? decodeURIComponent(token) : undefined);
}

/**
 * Role-check authorization gate for Route Handlers
 */
export function checkRole(user: AuthUser | null, allowedRoles: UserRole[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

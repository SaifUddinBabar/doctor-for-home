import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createSessionToken, hashPassword, SESSION_COOKIE, SESSION_MAX_AGE, type UserRole } from "@/lib/auth";
import { getUsers, saveUsers } from "@/lib/users";

export async function POST(request: Request) {
  let body: { name?: unknown; email?: unknown; password?: unknown; role?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please provide valid signup details." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Please provide valid signup details." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = body.role;
  if (!name || name.length > 100 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254 || password.length < 8 || password.length > 128 || (role !== "Patient" && role !== "Doctor")) {
    return NextResponse.json({ error: "Enter a name, valid email, password of at least 8 characters, and role." }, { status: 400 });
  }

  const users = await getUsers();
  if (users.some((user) => user.email === email)) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const user = { id: randomUUID(), name, email, role: role as UserRole, passwordHash: hashPassword(password) };
  users.push(user);
  await saveUsers(users);

  const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
  response.cookies.set(SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}

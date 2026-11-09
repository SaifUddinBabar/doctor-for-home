import { NextResponse } from "next/server";
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);

  const authUser = readSessionToken(token ? decodeURIComponent(token) : undefined);
  if (!authUser) {
    return NextResponse.json({ user: null });
  }

  // Fetch fresh profile state from database
  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        doctorProfile: {
          select: {
            bmdcNumber: true,
            specialization: true,
            verificationStatus: true,
            consultationFee: true,
          },
        },
      },
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Session lookup error:", err);
    return NextResponse.json({ user: authUser });
  }
}

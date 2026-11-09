import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const authUser = getAuthFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    if (authUser.role === "Doctor") {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: authUser.id },
      });

      if (!doctorProfile) {
        return NextResponse.json({ appointments: [] });
      }

      const appointments = await prisma.appointment.findMany({
        where: { doctorId: doctorProfile.id },
        orderBy: [{ scheduledDate: "asc" }, { scheduledTime: "asc" }],
      });

      return NextResponse.json({ appointments });
    }

    if (authUser.role === "Patient") {
      const patientProfile = await prisma.patientProfile.findUnique({
        where: { userId: authUser.id },
      });

      if (!patientProfile) {
        return NextResponse.json({ appointments: [] });
      }

      const appointments = await prisma.appointment.findMany({
        where: { patientId: patientProfile.id },
        include: {
          doctor: {
            include: {
              user: {
                select: { name: true, email: true, phone: true },
              },
            },
          },
        },
        orderBy: [{ scheduledDate: "desc" }, { scheduledTime: "desc" }],
      });

      return NextResponse.json({ appointments });
    }

    if (authUser.role === "Admin") {
      const appointments = await prisma.appointment.findMany({
        include: {
          doctor: {
            include: {
              user: { select: { name: true } },
            },
          },
          patient: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      return NextResponse.json({ appointments });
    }

    return NextResponse.json({ appointments: [] });
  } catch (err) {
    console.error("GET /api/appointments error:", err);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getAuthFromRequest, checkRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = getAuthFromRequest(request);
  if (!user || !checkRole(user, ["Admin"])) {
    return NextResponse.json({ error: "Unauthorized: Admin privileges required." }, { status: 403 });
  }

  try {
    const [totalUsers, totalPatients, totalDoctors, pendingDoctors, approvedDoctors, totalAppointments, recentAuditLogs] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "Patient" } }),
        prisma.user.count({ where: { role: "Doctor" } }),
        prisma.doctorProfile.count({ where: { verificationStatus: "PENDING" } }),
        prisma.doctorProfile.count({ where: { verificationStatus: "APPROVED" } }),
        prisma.appointment.count(),
        prisma.auditLog.findMany({
          take: 8,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true, email: true, role: true } } },
        }),
      ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalPatients,
        totalDoctors,
        pendingDoctors,
        approvedDoctors,
        totalAppointments,
      },
      recentAuditLogs,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to load admin stats." }, { status: 500 });
  }
}

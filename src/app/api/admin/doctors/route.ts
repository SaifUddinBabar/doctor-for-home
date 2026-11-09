import { NextResponse } from "next/server";
import { getAuthFromRequest, checkRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/doctors - List all doctors with BMDC and verification status (Admin only)
 */
export async function GET(request: Request) {
  const user = getAuthFromRequest(request);
  if (!user || !checkRole(user, ["Admin"])) {
    return NextResponse.json({ error: "Unauthorized: Admin privileges required." }, { status: 403 });
  }

  try {
    const doctors = await prisma.doctorProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error("Admin doctors fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch doctors list." }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/doctors - Update doctor verification status (Admin only)
 */
export async function PATCH(request: Request) {
  const user = getAuthFromRequest(request);
  if (!user || !checkRole(user, ["Admin"])) {
    return NextResponse.json({ error: "Unauthorized: Admin privileges required." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const doctorProfileId = typeof body.doctorId === "string" ? body.doctorId : "";
  const status = typeof body.status === "string" ? body.status.toUpperCase() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";

  if (!doctorProfileId) {
    return NextResponse.json({ error: "Doctor profile ID is required." }, { status: 400 });
  }
  if (!["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid status. Allowed values: PENDING, APPROVED, REJECTED, SUSPENDED." },
      { status: 400 }
    );
  }

  try {
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorProfileId },
      include: { user: true },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found." }, { status: 404 });
    }

    const updated = await prisma.doctorProfile.update({
      where: { id: doctorProfileId },
      data: {
        verificationStatus: status,
        verificationNotes: notes || null,
      },
    });

    // Record in AuditLog
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: `DOCTOR_VERIFICATION_${status}`,
        targetResource: `DoctorProfile:${doctorProfileId} (${doctor.user.name})`,
        details: `Status set to ${status}. Notes: ${notes || "None"}`,
      },
    });

    // Send notification to doctor
    await prisma.notification.create({
      data: {
        userId: doctor.userId,
        title: `Profile Verification: ${status}`,
        message:
          status === "APPROVED"
            ? "Congratulations! Your Doctor profile and BMDC credentials have been approved. You are now eligible to accept consultations."
            : `Your verification status has been updated to ${status}. ${notes ? `Note from Admin: ${notes}` : ""}`,
        type: status === "APPROVED" ? "SUCCESS" : "WARNING",
      },
    });

    return NextResponse.json({
      message: `Doctor verification status updated to ${status}.`,
      doctor: updated,
    });
  } catch (error) {
    console.error("Admin doctor status update error:", error);
    return NextResponse.json({ error: "Failed to update doctor verification status." }, { status: 500 });
  }
}

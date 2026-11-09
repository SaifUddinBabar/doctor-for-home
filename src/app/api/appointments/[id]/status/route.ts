import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"] as const;
type AppointmentStatus = (typeof VALID_STATUSES)[number];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { id: appointmentId } = await params;
    const body = await request.json().catch(() => ({}));
    const newStatus = body?.status as AppointmentStatus;
    const reason = typeof body?.reason === "string" ? body.reason.trim() : "";

    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: {
          include: { user: true },
        },
        patient: {
          include: { user: true },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    }

    const currentStatus = appointment.status;

    // RBAC and State Transition Rules
    if (authUser.role === "Doctor") {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: authUser.id },
      });
      if (!doctorProfile || appointment.doctorId !== doctorProfile.id) {
        return NextResponse.json({ error: "You can only update appointments assigned to you." }, { status: 403 });
      }

      // Doctors can transition:
      // PENDING -> CONFIRMED | REJECTED
      // CONFIRMED -> COMPLETED | CANCELLED
      const allowedFromPending = ["CONFIRMED", "REJECTED"];
      const allowedFromConfirmed = ["COMPLETED", "CANCELLED"];

      if (currentStatus === "PENDING" && !allowedFromPending.includes(newStatus)) {
        return NextResponse.json({ error: `Cannot transition from PENDING to ${newStatus}.` }, { status: 400 });
      }
      if (currentStatus === "CONFIRMED" && !allowedFromConfirmed.includes(newStatus)) {
        return NextResponse.json({ error: `Cannot transition from CONFIRMED to ${newStatus}.` }, { status: 400 });
      }
      if (["REJECTED", "CANCELLED", "COMPLETED"].includes(currentStatus)) {
        return NextResponse.json({ error: `Appointment is already ${currentStatus} and cannot be modified.` }, { status: 400 });
      }
    } else if (authUser.role === "Patient") {
      const patientProfile = await prisma.patientProfile.findUnique({
        where: { userId: authUser.id },
      });
      if (!patientProfile || appointment.patientId !== patientProfile.id) {
        return NextResponse.json({ error: "You can only modify your own appointments." }, { status: 403 });
      }

      // Patients can only CANCEL pending or confirmed appointments
      if (newStatus !== "CANCELLED") {
        return NextResponse.json({ error: "Patients are only permitted to cancel appointments." }, { status: 403 });
      }
      if (["REJECTED", "CANCELLED", "COMPLETED"].includes(currentStatus)) {
        return NextResponse.json({ error: `Appointment is already ${currentStatus} and cannot be cancelled.` }, { status: 400 });
      }
    } else if (authUser.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized role." }, { status: 403 });
    }

    // Update appointment status
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: newStatus,
        notes: reason ? `${appointment.notes ? appointment.notes + " | " : ""}Note: ${reason}` : appointment.notes,
      },
    });

    // Send notifications to reciprocal party
    const doctorName = appointment.doctor?.user.name ? `Dr. ${appointment.doctor.user.name}` : "your doctor";
    const patientName = appointment.patientName;

    if (authUser.role === "Doctor" || authUser.role === "Admin") {
      // Notify Patient
      if (appointment.patient?.userId) {
        let notificationMsg = "";
        let notificationType = "INFO";
        if (newStatus === "CONFIRMED") {
          notificationMsg = `Your appointment with ${doctorName} on ${appointment.scheduledDate} at ${appointment.scheduledTime} has been CONFIRMED.`;
          notificationType = "SUCCESS";
        } else if (newStatus === "REJECTED") {
          notificationMsg = `Your appointment with ${doctorName} on ${appointment.scheduledDate} was not accepted.${reason ? ` Reason: ${reason}` : ""}`;
          notificationType = "WARNING";
        } else if (newStatus === "COMPLETED") {
          notificationMsg = `Your consultation with ${doctorName} on ${appointment.scheduledDate} has been marked COMPLETED.`;
          notificationType = "SUCCESS";
        }

        await prisma.notification.create({
          data: {
            userId: appointment.patient.userId,
            title: `Appointment ${newStatus}`,
            message: notificationMsg,
            type: notificationType,
            link: "/dashboard/patient",
          },
        });
      }
    }

    if (authUser.role === "Patient" || authUser.role === "Admin") {
      // Notify Doctor
      if (appointment.doctor?.userId) {
        await prisma.notification.create({
          data: {
            userId: appointment.doctor.userId,
            title: `Appointment ${newStatus}`,
            message: `${patientName} has cancelled their appointment on ${appointment.scheduledDate} at ${appointment.scheduledTime}.${reason ? ` Reason: ${reason}` : ""}`,
            type: "WARNING",
            link: "/dashboard/doctor",
          },
        });
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: `APPOINTMENT_STATUS_CHANGE_${newStatus}`,
        targetResource: `Appointment:${appointmentId}`,
        details: JSON.stringify({ previousStatus: currentStatus, newStatus, reason }),
      },
    });

    return NextResponse.json({
      message: `Appointment successfully updated to ${newStatus}.`,
      appointment: updated,
    });
  } catch (err) {
    console.error("PATCH /api/appointments/[id]/status error:", err);
    return NextResponse.json({ error: "Failed to update appointment status" }, { status: 500 });
  }
}

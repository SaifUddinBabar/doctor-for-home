import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface DoctorBooking {
  doctorId: number;
  doctorName: string;
  patientName: string;
  phone: string;
  address: string;
  date: string;
  time: string;
}

interface AppointmentRequest {
  appointmentType: "Video Consultation" | "Home Visit" | "In-Clinic" | "Diagnostic Test";
  patientName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  notes?: string;
}

const phonePattern = /^\+?[\d().\s-]{7,20}$/;
const appointmentTypes = ["Video Consultation", "Home Visit", "In-Clinic", "Diagnostic Test"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validDateTime(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return false;
  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.valueOf()) && parsedDate.toISOString().slice(0, 10) === date;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Please provide valid appointment details." }, { status: 400 });
  }

  const authUser = getAuthFromRequest(request);

  // Helper to resolve or create patient profile
  async function resolvePatientProfile(email: string, name: string, phone: string, address?: string) {
    if (authUser) {
      let profile = await prisma.patientProfile.findUnique({ where: { userId: authUser.id } });
      if (!profile) {
        profile = await prisma.patientProfile.create({
          data: {
            userId: authUser.id,
            address: address || null,
          },
        });
      }
      return profile;
    }

    // Unauthenticated guest user booking: find or create guest user
    const normalizedEmail = email.trim().toLowerCase();
    let guestUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { patientProfile: true },
    });

    if (!guestUser) {
      guestUser = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          role: "Patient",
          passwordHash: "guest_booking_placeholder",
          phone: phone.trim(),
          emailVerified: false,
          patientProfile: {
            create: { address: address || null },
          },
        },
        include: { patientProfile: true },
      });
    } else if (!guestUser.patientProfile) {
      const newProfile = await prisma.patientProfile.create({
        data: { userId: guestUser.id, address: address || null },
      });
      guestUser = { ...guestUser, patientProfile: newProfile };
    }

    return guestUser.patientProfile;
  }

  // Doctor card booking contract
  if ("doctorId" in body) {
    const booking = body as unknown as DoctorBooking;
    if (
      typeof booking.doctorId !== "number" ||
      typeof booking.doctorName !== "string" ||
      typeof booking.patientName !== "string" ||
      typeof booking.phone !== "string" ||
      typeof booking.address !== "string" ||
      typeof booking.date !== "string" ||
      typeof booking.time !== "string" ||
      !phonePattern.test(booking.phone) ||
      !booking.doctorName.trim() ||
      !booking.patientName.trim() ||
      !booking.address.trim() ||
      !validDateTime(booking.date, booking.time)
    ) {
      return NextResponse.json({ error: "Please provide valid appointment details." }, { status: 400 });
    }

    try {
      const patientEmail = authUser?.email ?? `patient-${booking.phone.replace(/\D/g, "")}@doctorforhome.local`;
      const patientProfile = await resolvePatientProfile(
        patientEmail,
        booking.patientName,
        booking.phone,
        booking.address
      );

      if (!patientProfile) {
        return NextResponse.json({ error: "Unable to associate patient profile." }, { status: 500 });
      }

      // Check if a doctorProfile matches or grab first available approved/pending doctor
      const doctorProfile = await prisma.doctorProfile.findFirst();

      const createdAppointment = await prisma.appointment.create({
        data: {
          patientId: patientProfile.id,
          doctorId: doctorProfile?.id || null,
          appointmentType: "Home Visit",
          scheduledDate: booking.date,
          scheduledTime: booking.time,
          patientName: booking.patientName.trim(),
          patientPhone: booking.phone.trim(),
          patientEmail,
          address: booking.address.trim(),
          status: "PENDING",
        },
      });

      console.log("Appointment saved to database:", createdAppointment.id);

      return NextResponse.json(
        {
          message: "Appointment request submitted successfully.",
          appointmentId: createdAppointment.id,
        },
        { status: 201 }
      );
    } catch (err) {
      console.error("Booking error:", err);
      return NextResponse.json({ error: "Failed to persist appointment. Please try again." }, { status: 500 });
    }
  }

  // Homepage consultation request contract
  const booking = body as unknown as AppointmentRequest;
  if (
    typeof booking.appointmentType !== "string" ||
    !appointmentTypes.includes(booking.appointmentType) ||
    typeof booking.patientName !== "string" ||
    typeof booking.email !== "string" ||
    typeof booking.phone !== "string" ||
    typeof booking.date !== "string" ||
    typeof booking.time !== "string" ||
    (booking.notes !== undefined && typeof booking.notes !== "string") ||
    !booking.patientName.trim() ||
    !/^\S+@\S+\.\S+$/.test(booking.email) ||
    !phonePattern.test(booking.phone) ||
    (booking.notes?.length ?? 0) > 1000 ||
    !validDateTime(booking.date, booking.time)
  ) {
    return NextResponse.json({ error: "Please provide valid appointment details." }, { status: 400 });
  }

  try {
    const patientProfile = await resolvePatientProfile(
      booking.email,
      booking.patientName,
      booking.phone
    );

    if (!patientProfile) {
      return NextResponse.json({ error: "Unable to associate patient profile." }, { status: 500 });
    }

    const doctorProfile = await prisma.doctorProfile.findFirst({
      where: { verificationStatus: "APPROVED" },
    });

    const createdAppointment = await prisma.appointment.create({
      data: {
        patientId: patientProfile.id,
        doctorId: doctorProfile?.id || null,
        appointmentType: booking.appointmentType,
        scheduledDate: booking.date,
        scheduledTime: booking.time,
        patientName: booking.patientName.trim(),
        patientPhone: booking.phone.trim(),
        patientEmail: booking.email.trim().toLowerCase(),
        notes: booking.notes?.trim() || null,
        status: "PENDING",
      },
    });

    console.log("Homepage appointment saved to database:", createdAppointment.id);

    return NextResponse.json(
      {
        message: "Appointment request submitted successfully.",
        appointmentId: createdAppointment.id,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Homepage booking error:", err);
    return NextResponse.json({ error: "Failed to persist appointment. Please try again." }, { status: 500 });
  }
}

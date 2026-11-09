import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const phonePattern = /^\+?[\d().\s-]{7,20}$/;
const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

  // Doctor ID lookup helper (supports UUID or legacy numeric index)
  async function findDoctor(doctorIdInput: unknown) {
    if (typeof doctorIdInput === "string" && doctorIdInput.trim()) {
      const doc = await prisma.doctorProfile.findUnique({
        where: { id: doctorIdInput.trim() },
        include: { user: true },
      });
      if (doc) return doc;
    }

    // Fallback if integer id passed from legacy mock
    if (typeof doctorIdInput === "number" || (typeof doctorIdInput === "string" && /^\d+$/.test(doctorIdInput))) {
      const numericId = Number(doctorIdInput);
      const allApproved = await prisma.doctorProfile.findMany({
        where: { verificationStatus: "APPROVED" },
        include: { user: true },
        orderBy: { createdAt: "asc" },
      });
      const index = (numericId - 1) % (allApproved.length || 1);
      return allApproved[index] || allApproved[0] || null;
    }

    // Fallback: first approved doctor
    return prisma.doctorProfile.findFirst({
      where: { verificationStatus: "APPROVED" },
      include: { user: true },
    });
  }

  // Contract: Doctor Booking (from Doctor Card, Doctor Profile Page, or Home Page)
  const patientName = String(body.patientName || "").trim();
  const phone = String(body.phone || "").trim();
  const email = String(body.email || authUser?.email || "").trim().toLowerCase();
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const date = String(body.date || "").trim();
  const time = String(body.time || "").trim();
  const appointmentType = (body.appointmentType as string) || "Online Consultation";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";

  if (!patientName || !phone || !phonePattern.test(phone) || !validDateTime(date, time)) {
    return NextResponse.json(
      { error: "Invalid booking details. Please provide patient name, phone, valid date (YYYY-MM-DD), and time (HH:MM)." },
      { status: 400 }
    );
  }

  // Check date not in the past
  const today = new Date().toISOString().slice(0, 10);
  if (date < today) {
    return NextResponse.json({ error: "Cannot book an appointment for a past date." }, { status: 400 });
  }

  // Resolve doctor
  const doctor = await findDoctor(body.doctorId);
  if (!doctor) {
    return NextResponse.json({ error: "No available doctor found for this appointment." }, { status: 404 });
  }

  if (doctor.verificationStatus !== "APPROVED") {
    return NextResponse.json(
      { error: "This doctor is currently not approved for consultations." },
      { status: 400 }
    );
  }

  // Check doctor availability days
  if (doctor.availableDays) {
    try {
      const availableDays: string[] = JSON.parse(doctor.availableDays);
      if (Array.isArray(availableDays) && availableDays.length > 0) {
        const bookingDate = new Date(`${date}T00:00:00.000Z`);
        const dayName = DAYS_OF_WEEK[bookingDate.getUTCDay()];
        if (!availableDays.includes(dayName)) {
          return NextResponse.json(
            { error: `Dr. ${doctor.user.name} is not available on ${dayName}s. Available days: ${availableDays.join(", ")}.` },
            { status: 400 }
          );
        }
      }
    } catch {}
  }

  // Check doctor blocked dates / holidays
  if (doctor.blockedDates) {
    try {
      const blockedDates: string[] = JSON.parse(doctor.blockedDates);
      if (Array.isArray(blockedDates) && blockedDates.includes(date)) {
        return NextResponse.json(
          { error: `Dr. ${doctor.user.name} is unavailable on ${date} (holiday or leave). Please select another date.` },
          { status: 400 }
        );
      }
    } catch {}
  }

  // Check doctor time slots
  if (doctor.availableTimeSlots) {
    try {
      const slots: string[] = JSON.parse(doctor.availableTimeSlots);
      if (Array.isArray(slots) && slots.length > 0 && !slots.includes(time)) {
        return NextResponse.json(
          { error: `Time slot ${time} is not in Dr. ${doctor.user.name}'s schedule. Available slots: ${slots.join(", ")}.` },
          { status: 400 }
        );
      }
    } catch {}
  }

  // DOUBLE BOOKING PREVENTION
  const existingBooking = await prisma.appointment.findFirst({
    where: {
      doctorId: doctor.id,
      scheduledDate: date,
      scheduledTime: time,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });

  if (existingBooking) {
    return NextResponse.json(
      { error: `This time slot (${time} on ${date}) is already booked with Dr. ${doctor.user.name}. Please select a different time slot.` },
      { status: 409 }
    );
  }

  try {
    const patientEmail = email || authUser?.email || `patient-${phone.replace(/\D/g, "")}@doctorforhome.local`;
    const patientProfile = await resolvePatientProfile(
      patientEmail,
      patientName,
      phone,
      address
    );

    if (!patientProfile) {
      return NextResponse.json({ error: "Unable to associate patient profile." }, { status: 500 });
    }

    const createdAppointment = await prisma.appointment.create({
      data: {
        patientId: patientProfile.id,
        doctorId: doctor.id,
        appointmentType,
        scheduledDate: date,
        scheduledTime: time,
        patientName,
        patientPhone: phone,
        patientEmail,
        address: address || null,
        notes: notes || null,
        status: "PENDING",
      },
    });

    // Send notification to Doctor
    await prisma.notification.create({
      data: {
        userId: doctor.userId,
        title: "New Appointment Request",
        message: `${patientName} requested an appointment for ${date} at ${time} (${appointmentType}).`,
        type: "INFO",
        link: "/dashboard/doctor",
      },
    });

    // Send notification to Patient (if registered user)
    if (patientProfile.userId) {
      await prisma.notification.create({
        data: {
          userId: patientProfile.userId,
          title: "Appointment Request Submitted",
          message: `Your appointment request with Dr. ${doctor.user.name} for ${date} at ${time} has been submitted and is pending confirmation.`,
          type: "INFO",
          link: "/dashboard/patient",
        },
      });
    }

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: authUser?.id || null,
        action: "APPOINTMENT_CREATED",
        targetResource: `Appointment:${createdAppointment.id}`,
        details: JSON.stringify({ doctorId: doctor.id, date, time, appointmentType }),
      },
    });

    return NextResponse.json(
      {
        message: "Appointment request submitted successfully.",
        appointmentId: createdAppointment.id,
        doctorName: doctor.user.name,
        scheduledDate: date,
        scheduledTime: time,
        status: "PENDING",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: "Failed to persist appointment. Please try again." }, { status: 500 });
  }
}

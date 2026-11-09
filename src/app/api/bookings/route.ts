import { NextResponse } from "next/server";

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

  // Keep the existing doctor-card booking contract intact.
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

    const cleanBooking = {
      ...booking,
      doctorName: booking.doctorName.trim(),
      patientName: booking.patientName.trim(),
      phone: booking.phone.trim(),
      address: booking.address.trim(),
    };
    console.log("New doctor appointment request:", cleanBooking);
    return NextResponse.json({ message: "Appointment request submitted successfully." }, { status: 201 });
  }

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

  const cleanRequest: AppointmentRequest = {
    appointmentType: booking.appointmentType,
    patientName: booking.patientName.trim(),
    email: booking.email.trim().toLowerCase(),
    phone: booking.phone.trim(),
    date: booking.date,
    time: booking.time,
    notes: booking.notes?.trim() ?? "",
  };

  console.log("New homepage appointment request:", cleanRequest);
  return NextResponse.json({ message: "Appointment request submitted successfully." }, { status: 201 });
}

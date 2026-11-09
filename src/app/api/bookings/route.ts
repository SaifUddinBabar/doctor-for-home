import { NextResponse } from "next/server";

interface BookingRequest {
  doctorId: number;
  doctorName: string;
  patientName: string;
  phone: string;
  address: string;
  date: string;
  time: string;
}

export async function POST(request: Request) {
  let booking: BookingRequest;

  try {
    booking = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!booking || typeof booking !== "object") {
    return NextResponse.json({ error: "Please provide valid appointment details." }, { status: 400 });
  }

  const requiredFields: (keyof BookingRequest)[] = [
    "doctorId",
    "doctorName",
    "patientName",
    "phone",
    "address",
    "date",
    "time",
  ];

  if (
    requiredFields.some((field) => booking[field] === undefined || booking[field] === null || booking[field] === "") ||
    typeof booking.doctorId !== "number" ||
    typeof booking.doctorName !== "string" ||
    typeof booking.patientName !== "string" ||
    typeof booking.phone !== "string" ||
    typeof booking.address !== "string" ||
    typeof booking.date !== "string" ||
    typeof booking.time !== "string" ||
    !/^\+?[\d().\s-]{7,20}$/.test(booking.phone)
  ) {
    return NextResponse.json({ error: "Please provide valid appointment details." }, { status: 400 });
  }

  const cleanBooking = {
    doctorId: booking.doctorId,
    doctorName: String(booking.doctorName).trim(),
    patientName: String(booking.patientName).trim(),
    phone: booking.phone.trim(),
    address: String(booking.address).trim(),
    date: booking.date,
    time: booking.time,
  };

  if (
    !cleanBooking.doctorName ||
    !cleanBooking.patientName ||
    !cleanBooking.address ||
    !/^\d{4}-\d{2}-\d{2}$/.test(cleanBooking.date) ||
    !/^\d{2}:\d{2}$/.test(cleanBooking.time)
  ) {
    return NextResponse.json({ error: "Please provide valid appointment details." }, { status: 400 });
  }

  console.log("New appointment booking:", cleanBooking);

  return NextResponse.json({ message: "Appointment booked successfully." }, { status: 201 });
}

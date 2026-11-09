import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const authUser = getAuthFromRequest(request);
    if (!authUser || authUser.role !== "Doctor") {
      return NextResponse.json({ error: "Unauthorized. Doctor access required." }, { status: 403 });
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: authUser.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    if (!doctorProfile) {
      return NextResponse.json({ error: "Doctor profile not found." }, { status: 404 });
    }

    let parsedDays: string[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    let parsedSlots: string[] = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
    let parsedBlocked: string[] = [];

    try {
      if (doctorProfile.availableDays) parsedDays = JSON.parse(doctorProfile.availableDays);
    } catch {}
    try {
      if (doctorProfile.availableTimeSlots) parsedSlots = JSON.parse(doctorProfile.availableTimeSlots);
    } catch {}
    try {
      if (doctorProfile.blockedDates) parsedBlocked = JSON.parse(doctorProfile.blockedDates);
    } catch {}

    return NextResponse.json({
      profile: {
        id: doctorProfile.id,
        userId: doctorProfile.userId,
        name: doctorProfile.user.name,
        email: doctorProfile.user.email,
        phone: doctorProfile.user.phone,
        specialization: doctorProfile.specialization,
        qualifications: doctorProfile.qualifications,
        bmdcNumber: doctorProfile.bmdcNumber,
        experienceYears: doctorProfile.experienceYears,
        consultationFee: doctorProfile.consultationFee,
        homeVisitFee: doctorProfile.homeVisitFee,
        bio: doctorProfile.bio,
        hospitalAffiliation: doctorProfile.hospitalAffiliation,
        location: doctorProfile.location,
        avatar: doctorProfile.avatar || doctorProfile.user.avatar,
        verificationStatus: doctorProfile.verificationStatus,
        verificationNotes: doctorProfile.verificationNotes,
        availableDays: parsedDays,
        availableTimeSlots: parsedSlots,
        slotDurationMinutes: doctorProfile.slotDurationMinutes,
        blockedDates: parsedBlocked,
      },
    });
  } catch (err) {
    console.error("GET /api/doctor/profile error:", err);
    return NextResponse.json({ error: "Failed to retrieve doctor profile" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authUser = getAuthFromRequest(request);
    if (!authUser || authUser.role !== "Doctor") {
      return NextResponse.json({ error: "Unauthorized. Doctor access required." }, { status: 403 });
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: authUser.id },
    });

    if (!doctorProfile) {
      return NextResponse.json({ error: "Doctor profile not found." }, { status: 404 });
    }

    const body = await request.json();

    // Security check: doctors must NOT modify their own verification status or BMDC number
    if (body.verificationStatus !== undefined || body.verificationNotes !== undefined) {
      return NextResponse.json(
        { error: "Doctors are not permitted to alter their own verification status or notes." },
        { status: 403 }
      );
    }

    if (body.bmdcNumber !== undefined && body.bmdcNumber !== doctorProfile.bmdcNumber) {
      return NextResponse.json(
        { error: "BMDC number cannot be modified directly once registered. Please contact administration." },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (typeof body.specialization === "string" && body.specialization.trim()) {
      updateData.specialization = body.specialization.trim();
    }
    if (typeof body.qualifications === "string") {
      updateData.qualifications = body.qualifications.trim();
    }
    if (typeof body.experienceYears === "number" && body.experienceYears >= 0) {
      updateData.experienceYears = Math.floor(body.experienceYears);
    }
    if (typeof body.consultationFee === "number" && body.consultationFee >= 0) {
      updateData.consultationFee = body.consultationFee;
    }
    if (typeof body.homeVisitFee === "number" && body.homeVisitFee >= 0) {
      updateData.homeVisitFee = body.homeVisitFee;
    }
    if (typeof body.bio === "string") {
      updateData.bio = body.bio.trim();
    }
    if (typeof body.hospitalAffiliation === "string") {
      updateData.hospitalAffiliation = body.hospitalAffiliation.trim();
    }
    if (typeof body.location === "string") {
      updateData.location = body.location.trim();
    }
    if (typeof body.avatar === "string") {
      updateData.avatar = body.avatar.trim();
    }
    if (typeof body.slotDurationMinutes === "number" && body.slotDurationMinutes > 0) {
      updateData.slotDurationMinutes = Math.floor(body.slotDurationMinutes);
    }

    // Availability days validation
    if (Array.isArray(body.availableDays)) {
      const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const filteredDays = body.availableDays.filter((d: unknown) => typeof d === "string" && validDays.includes(d));
      updateData.availableDays = JSON.stringify(filteredDays);
    }

    // Time slots validation
    if (Array.isArray(body.availableTimeSlots)) {
      const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
      const filteredSlots = body.availableTimeSlots.filter((t: unknown) => typeof t === "string" && timeRegex.test(t));
      filteredSlots.sort();
      updateData.availableTimeSlots = JSON.stringify(filteredSlots);
    }

    // Blocked dates validation
    if (Array.isArray(body.blockedDates)) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const filteredBlocked = body.blockedDates.filter((d: unknown) => typeof d === "string" && dateRegex.test(d));
      updateData.blockedDates = JSON.stringify(filteredBlocked);
    }

    const updated = await prisma.doctorProfile.update({
      where: { id: doctorProfile.id },
      data: updateData,
    });

    // Also update phone/name on user if provided
    if (typeof body.phone === "string" && body.phone.trim()) {
      await prisma.user.update({
        where: { id: authUser.id },
        data: { phone: body.phone.trim() },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: "DOCTOR_PROFILE_UPDATED",
        targetResource: `DoctorProfile:${doctorProfile.id}`,
        details: JSON.stringify(Object.keys(updateData)),
      },
    });

    return NextResponse.json({
      message: "Doctor profile and availability updated successfully.",
      profile: updated,
    });
  } catch (err) {
    console.error("PATCH /api/doctor/profile error:", err);
    return NextResponse.json({ error: "Failed to update doctor profile" }, { status: 500 });
  }
}

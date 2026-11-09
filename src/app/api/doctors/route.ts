import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const specialty = searchParams.get("specialty")?.trim() || "";
    const location = searchParams.get("location")?.trim() || "";
    const sort = searchParams.get("sort") || "rating";

    // Only APPROVED doctors are publicly accessible
    const doctors = await prisma.doctorProfile.findMany({
      where: {
        verificationStatus: "APPROVED",
        ...(specialty && specialty !== "All"
          ? { specialization: { equals: specialty } }
          : {}),
        ...(location && location !== "All"
          ? { location: { equals: location } }
          : {}),
      },
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
      orderBy:
        sort === "fee_asc"
          ? { consultationFee: "asc" }
          : sort === "fee_desc"
          ? { consultationFee: "desc" }
          : sort === "experience"
          ? { experienceYears: "desc" }
          : { createdAt: "desc" },
    });

    // In-memory filter for text search (name, specialization, bio, location, hospital)
    let filtered = doctors.map((doc) => {
      let parsedDays: string[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      let parsedSlots: string[] = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
      try {
        if (doc.availableDays) parsedDays = JSON.parse(doc.availableDays);
      } catch {}
      try {
        if (doc.availableTimeSlots) parsedSlots = JSON.parse(doc.availableTimeSlots);
      } catch {}

      return {
        id: doc.id,
        userId: doc.user.id,
        name: doc.user.name,
        specialty: doc.specialization,
        qualifications: doc.qualifications || "MBBS",
        bmdcNumber: doc.bmdcNumber,
        experience: doc.experienceYears,
        fee: doc.consultationFee,
        homeVisitFee: doc.homeVisitFee || doc.consultationFee + 300,
        bio: doc.bio || `${doc.user.name} is a dedicated healthcare specialist.`,
        hospital: doc.hospitalAffiliation || "DoctorForHome Medical Network",
        location: doc.location || "Dhaka",
        avatar: doc.avatar || doc.user.avatar || doc.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
        verificationStatus: doc.verificationStatus,
        availableDays: parsedDays,
        availableTimeSlots: parsedSlots,
        slotDurationMinutes: doc.slotDurationMinutes,
        rating: 4.8 + ((doc.experienceYears % 3) * 0.1),
        reviewCount: 50 + (doc.experienceYears * 12),
      };
    });

    if (search) {
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(search) ||
          d.specialty.toLowerCase().includes(search) ||
          d.location.toLowerCase().includes(search) ||
          d.hospital.toLowerCase().includes(search) ||
          d.bmdcNumber.toLowerCase().includes(search) ||
          d.bio.toLowerCase().includes(search)
      );
    }

    // Get all available specialties and locations for filters
    const allApproved = await prisma.doctorProfile.findMany({
      where: { verificationStatus: "APPROVED" },
      select: { specialization: true, location: true },
    });

    const specialties = [...new Set(allApproved.map((d) => d.specialization))].sort();
    const locations = [...new Set(allApproved.map((d) => d.location).filter(Boolean) as string[])].sort();

    return NextResponse.json({
      doctors: filtered,
      total: filtered.length,
      filterOptions: {
        specialties,
        locations,
      },
    });
  } catch (err) {
    console.error("GET /api/doctors error:", err);
    return NextResponse.json({ error: "Failed to fetch doctors list" }, { status: 500 });
  }
}

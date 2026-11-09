import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DoctorAppointmentManager from "@/components/doctor/DoctorAppointmentManager";
import DoctorAvailabilityManager from "@/components/doctor/DoctorAvailabilityManager";

export default async function DoctorDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/doctor");
  if (user.role !== "Doctor" && user.role !== "Admin") {
    redirect("/dashboard/patient");
  }

  // Fetch real doctor profile and stats from Prisma
  const doctor = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      doctorProfile: {
        include: {
          appointments: {
            orderBy: [{ scheduledDate: "asc" }, { scheduledTime: "asc" }],
            include: { patient: { include: { user: true } } },
          },
          prescriptions: { take: 5, orderBy: { createdAt: "desc" } },
        },
      },
      notifications: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const profile = doctor?.doctorProfile;
  const isApproved = profile?.verificationStatus === "APPROVED";
  const isPending = profile?.verificationStatus === "PENDING";
  const appointmentsCount = profile?.appointments?.length ?? 0;
  const prescriptionsCount = profile?.prescriptions?.length ?? 0;

  let parsedDays: string[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  let parsedSlots: string[] = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
  let parsedBlocked: string[] = [];

  try {
    if (profile?.availableDays) parsedDays = JSON.parse(profile.availableDays);
  } catch {}
  try {
    if (profile?.availableTimeSlots) parsedSlots = JSON.parse(profile.availableTimeSlots);
  } catch {}
  try {
    if (profile?.blockedDates) parsedBlocked = JSON.parse(profile.blockedDates);
  } catch {}

  const initialProfile = {
    id: profile?.id || "",
    specialization: profile?.specialization || "General Physician",
    qualifications: profile?.qualifications || "MBBS",
    experienceYears: profile?.experienceYears || 0,
    consultationFee: profile?.consultationFee || 500,
    homeVisitFee: profile?.homeVisitFee || 800,
    bio: profile?.bio || "",
    hospitalAffiliation: profile?.hospitalAffiliation || "",
    location: profile?.location || "Dhaka",
    availableDays: parsedDays,
    availableTimeSlots: parsedSlots,
    slotDurationMinutes: profile?.slotDurationMinutes || 30,
    blockedDates: parsedBlocked,
  };

  const initialAppointments = (profile?.appointments || []).map((apt) => ({
    id: apt.id,
    patientId: apt.patientId,
    appointmentType: apt.appointmentType,
    scheduledDate: apt.scheduledDate,
    scheduledTime: apt.scheduledTime,
    status: apt.status,
    patientName: apt.patientName,
    patientPhone: apt.patientPhone,
    patientEmail: apt.patientEmail,
    address: apt.address,
    notes: apt.notes,
    patient: apt.patient
      ? {
          user: apt.patient.user
            ? {
                name: apt.patient.user.name,
                email: apt.patient.user.email,
              }
            : undefined,
        }
      : null,
  }));

  return (
    <div className="min-h-screen bg-[#080D23] text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Verification Status Banner */}
        {isPending && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-xl">
                ⏳
              </span>
              <div>
                <h3 className="text-base font-bold text-amber-400">BMDC Verification In Progress</h3>
                <p className="mt-1 text-xs text-amber-200/90 leading-relaxed">
                  Your registration with BMDC Number <strong className="text-white font-mono">{profile?.bmdcNumber}</strong> is currently pending administrative review.
                  Once verified by the clinical administrator, your profile will be published on the &quot;Find a Doctor&quot; directory, and you can accept home visits and remote consultations.
                </p>
              </div>
            </div>
          </div>
        )}

        {isApproved && (
          <div className="mb-6 rounded-2xl border border-[#24D6A0]/30 bg-[#24D6A0]/10 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#24D6A0]/20 text-lg">
                ✓
              </span>
              <div>
                <p className="text-sm font-bold text-[#24D6A0]">BMDC Verified Practitioner</p>
                <p className="text-xs text-[#CBD5E5]">
                  Registration <span className="font-mono text-white font-bold">{profile?.bmdcNumber}</span> is verified. You are authorized to accept patient consultations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Doctor Header */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#0F1B3B] via-[#121E42] to-[#1C1645] p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#16C9E8]/30 bg-[#16C9E8]/10 px-3 py-1 text-xs font-bold text-[#65DFF0]">
                <span>🩺</span> DOCTOR PORTAL
              </div>
              <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl text-white">
                Dr. {doctor?.name ?? user.name}
              </h1>
              <p className="mt-1 text-sm text-[#A2AEC3]">
                {profile?.specialization ?? "General Physician"} · {profile?.qualifications ?? "MBBS"} · {profile?.experienceYears ?? 0} Years Experience
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-right">
                <p className="text-[10px] uppercase font-bold text-[#8794AD]">Online Fee</p>
                <p className="text-lg font-extrabold text-[#65DFF0]">৳{profile?.consultationFee ?? 500}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-right">
                <p className="text-[10px] uppercase font-bold text-[#8794AD]">Home Visit Fee</p>
                <p className="text-lg font-extrabold text-[#24D6A0]">৳{profile?.homeVisitFee ?? 800}</p>
              </div>
              {profile && (
                <Link
                  href={`/find-a-doctor/${profile.id}`}
                  className="rounded-xl bg-gradient-to-r from-[#16C9E8] to-[#398BF2] px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-95 transition"
                >
                  View Public Profile
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#8794AD]">Active Appointments</p>
            <p className="mt-2 text-3xl font-extrabold text-[#65DFF0]">{appointmentsCount}</p>
            <span className="mt-1 block text-[11px] text-[#A2AEC3]">Scheduled bookings</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#8794AD]">Verification</p>
            <p className={`mt-2 text-2xl font-extrabold ${isApproved ? "text-[#24D6A0]" : "text-amber-400"}`}>
              {profile?.verificationStatus ?? "PENDING"}
            </p>
            <span className="mt-1 block text-[11px] text-[#A2AEC3]">BMDC License</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#8794AD]">Working Days</p>
            <p className="mt-2 text-2xl font-extrabold text-[#9560F5]">{parsedDays.length} Days</p>
            <span className="mt-1 block text-[11px] text-[#A2AEC3]">Per week</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#8794AD]">Daily Time Slots</p>
            <p className="mt-2 text-2xl font-extrabold text-[#DF48C7]">{parsedSlots.length} Slots</p>
            <span className="mt-1 block text-[11px] text-[#A2AEC3]">Configured</span>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="mt-8 space-y-8">
          {/* Appointment Manager */}
          <DoctorAppointmentManager
            initialAppointments={initialAppointments}
            isApproved={isApproved}
          />

          {/* Availability Schedule & Profile Manager */}
          {profile && (
            <DoctorAvailabilityManager initialProfile={initialProfile} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

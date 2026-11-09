import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
            orderBy: { createdAt: "desc" },
            take: 6,
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
                  Registration <span className="font-mono text-white">{profile?.bmdcNumber}</span> is verified. You are authorized to accept patient consultations.
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
                <p className="text-[10px] uppercase font-bold text-[#8794AD]">Consultation Fee</p>
                <p className="text-lg font-extrabold text-[#65DFF0]">{profile?.consultationFee ?? 500} BDT</p>
              </div>
              <button
                disabled={!isApproved}
                className="rounded-xl bg-gradient-to-r from-[#16C9E8] to-[#398BF2] px-4 py-2.5 text-xs font-bold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Set Availability
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#8794AD]">Assigned Patients</p>
            <p className="mt-2 text-3xl font-extrabold text-[#65DFF0]">{appointmentsCount}</p>
            <span className="mt-1 block text-[11px] text-[#A2AEC3]">Total consultations</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#8794AD]">Verification</p>
            <p className={`mt-2 text-2xl font-extrabold ${isApproved ? "text-[#24D6A0]" : "text-amber-400"}`}>
              {profile?.verificationStatus ?? "PENDING"}
            </p>
            <span className="mt-1 block text-[11px] text-[#A2AEC3]">BMDC License</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#8794AD]">Digital Prescriptions</p>
            <p className="mt-2 text-3xl font-extrabold text-[#9560F5]">{prescriptionsCount}</p>
            <span className="mt-1 block text-[11px] text-[#A2AEC3]">Created by you</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#8794AD]">Specialization</p>
            <p className="mt-2 text-lg font-bold text-white truncate">{profile?.specialization}</p>
            <span className="mt-1 block text-[11px] text-[#A2AEC3]">Primary field</span>
          </div>
        </div>

        {/* Content Section: Patient Appointments & Doctor Profile Details */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main Column: Appointment Requests */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#24D6A0]" />
                  Patient Consultation Requests
                </h2>
                <span className="text-xs text-[#8794AD]">Real-time Database Sync</span>
              </div>

              {profile?.appointments && profile.appointments.length > 0 ? (
                <div className="mt-4 divide-y divide-white/5">
                  {profile.appointments.map((apt) => (
                    <div key={apt.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-bold text-white">
                            {apt.appointmentType}
                          </span>
                          <span className="text-xs font-semibold text-[#65DFF0]">{apt.status}</span>
                        </div>
                        <p className="mt-1.5 text-sm font-semibold text-white">
                          Patient: {apt.patient?.user?.name ?? apt.patientName}
                        </p>
                        <p className="text-xs text-[#8794AD]">
                          Phone: {apt.patientPhone} · Date: {apt.scheduledDate} at {apt.scheduledTime}
                        </p>
                        {apt.address && <p className="text-xs text-[#8794AD]">Location: {apt.address}</p>}
                      </div>

                      <div className="flex items-center gap-2">
                        {apt.appointmentType === "Video Consultation" && isApproved && (
                          <button className="rounded-lg bg-[#398BF2]/20 border border-[#398BF2]/40 px-3 py-1.5 text-xs font-bold text-[#65DFF0] hover:bg-[#398BF2]/30 transition">
                            Start Video Room
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-2xl">
                    📅
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-white">No incoming patient bookings yet</h3>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-[#8794AD]">
                    {isApproved
                      ? "Your profile is active and ready. Consultation requests booked by patients will appear directly here."
                      : "Once your BMDC credentials are approved by administration, patients will be able to book visits with you."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Credentials & Notifications */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-6 shadow-sm">
              <h2 className="text-base font-bold text-white border-b border-white/10 pb-3">
                Professional Credentials
              </h2>
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#8794AD]">BMDC Number</span>
                  <span className="font-mono font-bold text-[#65DFF0]">{profile?.bmdcNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#8794AD]">Specialization</span>
                  <span className="font-semibold text-white">{profile?.specialization}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#8794AD]">Qualifications</span>
                  <span className="font-semibold text-white">{profile?.qualifications}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#8794AD]">Experience</span>
                  <span className="font-semibold text-white">{profile?.experienceYears} Years</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#8794AD]">Standard Fee</span>
                  <span className="font-bold text-[#24D6A0]">{profile?.consultationFee} BDT</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-6 shadow-sm">
              <h2 className="text-base font-bold text-white border-b border-white/10 pb-3">
                Clinical Alerts
              </h2>
              {doctor?.notifications && doctor.notifications.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {doctor.notifications.map((n) => (
                    <div key={n.id} className="rounded-lg bg-white/5 p-3 text-xs">
                      <p className="font-bold text-white">{n.title}</p>
                      <p className="mt-1 text-[#A2AEC3]">{n.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-xs text-[#8794AD] text-center py-4">No unread alerts</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

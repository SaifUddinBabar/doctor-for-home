import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PatientDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/patient");
  if (user.role !== "Patient" && user.role !== "Admin") {
    redirect("/dashboard/doctor");
  }

  // Fetch real database records for this patient
  const patient = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      patientProfile: {
        include: {
          appointments: {
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { doctor: { include: { user: true } } },
          },
          medicalReports: { take: 5, orderBy: { createdAt: "desc" } },
          prescriptions: { take: 5, orderBy: { createdAt: "desc" } },
          homeVisits: { take: 5, orderBy: { createdAt: "desc" } },
        },
      },
      notifications: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const profile = patient?.patientProfile;
  const appointmentsCount = profile?.appointments?.length ?? 0;
  const reportsCount = profile?.medicalReports?.length ?? 0;
  const prescriptionsCount = profile?.prescriptions?.length ?? 0;
  const homeVisitsCount = profile?.homeVisits?.length ?? 0;

  return (
    <div className="min-h-screen bg-[#080D23] text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0F1B3B] via-[#121E42] to-[#1C1645] p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#24D6A0]/30 bg-[#24D6A0]/10 px-3 py-1 text-xs font-bold text-[#24D6A0]">
                <span className="h-2 w-2 rounded-full bg-[#24D6A0] animate-pulse" />
                PATIENT PORTAL
              </div>
              <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl text-white">
                Welcome back, {patient?.name ?? user.name}
              </h1>
              <p className="mt-1 text-sm text-[#A2AEC3]">
                Signed in as <span className="text-[#65DFF0]">{patient?.email ?? user.email}</span> · Manage your home visits, consultations, and digital health records.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/find-a-doctor"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#16C9E8] to-[#398BF2] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
              >
                <span>🔍</span> Find a Doctor
              </Link>
              <Link
                href="/#appointment"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <span>🗓️</span> Book Visit
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#8794AD]">Active Appointments</p>
            <p className="mt-2 text-3xl font-extrabold text-[#65DFF0]">{appointmentsCount}</p>
            <span className="mt-1 block text-[11px] text-[#A2AEC3]">Live in database</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#8794AD]">Medical Reports</p>
            <p className="mt-2 text-3xl font-extrabold text-[#24D6A0]">{reportsCount}</p>
            <span className="mt-1 block text-[11px] text-[#A2AEC3]">Uploaded documents</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#8794AD]">Prescriptions</p>
            <p className="mt-2 text-3xl font-extrabold text-[#9560F5]">{prescriptionsCount}</p>
            <span className="mt-1 block text-[11px] text-[#A2AEC3]">Issued by doctors</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#8794AD]">Home Care Visits</p>
            <p className="mt-2 text-3xl font-extrabold text-[#DF48C7]">{homeVisitsCount}</p>
            <span className="mt-1 block text-[11px] text-[#A2AEC3]">Doorstep requests</span>
          </div>
        </div>

        {/* Content Section: Appointments & Health Profile */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main: Upcoming Appointments List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#16C9E8]" />
                  Your Appointments & Consultations
                </h2>
                <Link href="/find-a-doctor" className="text-xs font-semibold text-[#16C9E8] hover:underline">
                  + Book New
                </Link>
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
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            apt.status === "CONFIRMED" ? "bg-green-500/20 text-green-400" :
                            apt.status === "PENDING" ? "bg-amber-500/20 text-amber-300" :
                            "bg-slate-500/20 text-slate-300"
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-white">
                          Doctor: {apt.doctor?.user?.name ? `Dr. ${apt.doctor.user.name}` : "Pending Assignment"}
                        </p>
                        <p className="text-xs text-[#8794AD]">
                          Scheduled: {apt.scheduledDate} at {apt.scheduledTime}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {apt.appointmentType === "Video Consultation" && (
                          <button className="rounded-lg bg-[#398BF2]/20 border border-[#398BF2]/40 px-3 py-1.5 text-xs font-bold text-[#65DFF0] hover:bg-[#398BF2]/30 transition">
                            Join Room
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-2xl">
                    🩺
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-white">No active appointments yet</h3>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-[#8794AD]">
                    You have not scheduled any doctor home visits or consultations yet. Browse verified doctors to get started.
                  </p>
                  <Link
                    href="/find-a-doctor"
                    className="mt-4 inline-block rounded-xl bg-[#16C9E8]/20 border border-[#16C9E8]/40 px-4 py-2 text-xs font-bold text-[#65DFF0] hover:bg-[#16C9E8]/30"
                  >
                    Browse Available Doctors
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Service Launchpad */}
            <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-6 shadow-sm">
              <h2 className="text-lg font-bold text-white border-b border-white/10 pb-4">
                Healthcare Services At Home
              </h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  href="/find-a-doctor"
                  className="rounded-xl border border-white/10 bg-[#121B3A] p-4 hover:border-[#16C9E8]/50 transition group"
                >
                  <div className="text-2xl mb-2">👨‍⚕️</div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#65DFF0]">Doctor Home Visit</h3>
                  <p className="mt-1 text-xs text-[#8794AD]">Certified physicians visit your doorstep</p>
                </Link>
                <Link
                  href="/#appointment"
                  className="rounded-xl border border-white/10 bg-[#121B3A] p-4 hover:border-[#DF48C7]/50 transition group"
                >
                  <div className="text-2xl mb-2">📹</div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#DF48C7]">Video Consultation</h3>
                  <p className="mt-1 text-xs text-[#8794AD]">Instant remote consultation with specialist</p>
                </Link>
                <Link
                  href="/#appointment"
                  className="rounded-xl border border-white/10 bg-[#121B3A] p-4 hover:border-[#24D6A0]/50 transition group"
                >
                  <div className="text-2xl mb-2">🧪</div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#24D6A0]">Diagnostic Lab Tests</h3>
                  <p className="mt-1 text-xs text-[#8794AD]">Sample collection at home with digital reports</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar: Health Profile & Notifications */}
          <div className="space-y-6">
            {/* Patient Profile Card */}
            <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-6 shadow-sm">
              <h2 className="text-base font-bold text-white border-b border-white/10 pb-3 flex items-center justify-between">
                <span>Personal Health Profile</span>
                <span className="text-xs text-[#24D6A0] font-semibold">Active</span>
              </h2>
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#8794AD]">Blood Group</span>
                  <span className="font-semibold text-white">{profile?.bloodGroup ?? "Not recorded"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#8794AD]">Gender</span>
                  <span className="font-semibold text-white">{profile?.gender ?? "Not specified"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#8794AD]">Phone</span>
                  <span className="font-semibold text-white">{patient?.phone ?? "Not provided"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#8794AD]">Address</span>
                  <span className="font-semibold text-white">{profile?.address ?? "Not recorded"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#8794AD]">Emergency Contact</span>
                  <span className="font-semibold text-white">{profile?.emergencyContact ?? "None"}</span>
                </div>
              </div>
            </div>

            {/* In-App Notifications */}
            <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-6 shadow-sm">
              <h2 className="text-base font-bold text-white border-b border-white/10 pb-3">
                Recent Notifications
              </h2>
              {patient?.notifications && patient.notifications.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {patient.notifications.map((notif) => (
                    <div key={notif.id} className="rounded-lg bg-white/5 p-3 text-xs">
                      <p className="font-bold text-white">{notif.title}</p>
                      <p className="mt-1 text-[#A2AEC3]">{notif.message}</p>
                      <span className="mt-2 block text-[10px] text-[#8794AD]">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-xs text-[#8794AD] text-center py-4">No new notifications</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PatientAppointmentManager from "@/components/patient/PatientAppointmentManager";

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
            orderBy: [{ scheduledDate: "desc" }, { scheduledTime: "desc" }],
            include: { doctor: { include: { user: true } } },
          },
          medicalReports: { take: 5, orderBy: { createdAt: "desc" } },
          prescriptions: { take: 5, orderBy: { createdAt: "desc" } },
          homeVisits: { take: 5, orderBy: { createdAt: "desc" } },
        },
      },
    },
  });

  const profile = patient?.patientProfile;
  const initialAppointments = (profile?.appointments || []).map((apt) => ({
    id: apt.id,
    appointmentType: apt.appointmentType,
    scheduledDate: apt.scheduledDate,
    scheduledTime: apt.scheduledTime,
    status: apt.status,
    patientName: apt.patientName,
    doctor: apt.doctor
      ? {
          user: {
            name: apt.doctor.user.name,
            email: apt.doctor.user.email,
            phone: apt.doctor.user.phone || undefined,
          },
        }
      : null,
  }));

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
                Signed in as <span className="text-[#65DFF0]">{patient?.email ?? user.email}</span> · Real-time telemedicine consultations & home visit tracker.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/find-a-doctor"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#16C9E8] to-[#398BF2] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
              >
                <span>🔍</span> Find a Doctor
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#8794AD]">Total Appointments</p>
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

        {/* Content Section */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main Column: Live Appointments & Notifications Manager */}
          <div className="lg:col-span-2 space-y-6">
            <PatientAppointmentManager initialAppointments={initialAppointments} />
          </div>

          {/* Sidebar Column: Profile details & Fast Actions */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-6 shadow-sm">
              <h2 className="text-base font-bold text-white border-b border-white/10 pb-3 flex items-center justify-between">
                <span>Personal Health Profile</span>
                <span className="text-xs text-[#24D6A0] font-semibold">Verified</span>
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
                  <span className="font-semibold text-white">{profile?.address ?? "Dhaka, Bangladesh"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-6 shadow-sm">
              <h2 className="text-base font-bold text-white border-b border-white/10 pb-3">
                Need Medical Care?
              </h2>
              <p className="mt-3 text-xs text-[#8794AD] leading-relaxed">
                Our network of licensed general physicians and specialists are ready for video consultations or direct home visits.
              </p>
              <Link
                href="/find-a-doctor"
                className="mt-4 block w-full py-2.5 text-center text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl hover:opacity-90 transition shadow"
              >
                Browse All Doctors
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

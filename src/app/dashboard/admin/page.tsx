import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminDoctorVerificationTable from "@/components/admin/AdminDoctorVerificationTable";

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/admin");
  if (user.role !== "Admin") {
    redirect("/dashboard");
  }

  // Load real database metrics
  const [
    totalUsers,
    totalPatients,
    totalDoctors,
    pendingVerifications,
    approvedDoctors,
    totalAppointments,
    doctorsList,
    recentPatients,
    auditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "Patient" } }),
    prisma.user.count({ where: { role: "Doctor" } }),
    prisma.doctorProfile.count({ where: { verificationStatus: "PENDING" } }),
    prisma.doctorProfile.count({ where: { verificationStatus: "APPROVED" } }),
    prisma.appointment.count(),
    prisma.doctorProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "Patient" },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { patientProfile: true },
    }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true, role: true } } },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#080D23] text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#170E3A] via-[#111936] to-[#0E2042] p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#DF48C7]/30 bg-[#DF48C7]/10 px-3 py-1 text-xs font-bold text-[#DF48C7]">
                <span>🛡️</span> SYSTEM ADMINISTRATION
              </div>
              <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl text-white">
                Admin Control Center
              </h1>
              <p className="mt-1 text-sm text-[#A2AEC3]">
                Logged in as <strong className="text-white">{user.name}</strong> ({user.email}) · Complete clinical governance, doctor approvals, and user records.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Database Connected
              </span>
            </div>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-[#8794AD]">Total Accounts</p>
            <p className="mt-1 text-2xl font-extrabold text-white">{totalUsers}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-[#8794AD]">Patients</p>
            <p className="mt-1 text-2xl font-extrabold text-[#65DFF0]">{totalPatients}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-[#8794AD]">Total Doctors</p>
            <p className="mt-1 text-2xl font-extrabold text-[#9560F5]">{totalDoctors}</p>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-amber-400">Pending Review</p>
            <p className="mt-1 text-2xl font-extrabold text-amber-300">{pendingVerifications}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-emerald-400">Verified Doctors</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-300">{approvedDoctors}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-[#8794AD]">Appointments</p>
            <p className="mt-1 text-2xl font-extrabold text-[#DF48C7]">{totalAppointments}</p>
          </div>
        </div>

        {/* Doctor BMDC Verification Workflow Table (Interactive Component) */}
        <div className="mt-8">
          <AdminDoctorVerificationTable initialDoctors={doctorsList} />
        </div>

        {/* Secondary Grid: Recent Patients & Audit Trail */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Registered Patients */}
          <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-6 shadow-sm">
            <h2 className="text-base font-bold text-white border-b border-white/10 pb-3 flex items-center justify-between">
              <span>Recently Registered Patients</span>
              <span className="text-xs text-[#65DFF0] font-semibold">{totalPatients} total</span>
            </h2>
            <div className="mt-4 divide-y divide-white/5">
              {recentPatients.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{p.name}</p>
                    <p className="text-[#8794AD]">{p.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                      Patient
                    </span>
                    <p className="mt-1 text-[10px] text-[#8794AD]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Audit Logs */}
          <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-6 shadow-sm">
            <h2 className="text-base font-bold text-white border-b border-white/10 pb-3 flex items-center justify-between">
              <span>System Audit Logs</span>
              <span className="text-xs text-[#24D6A0] font-semibold">Security Trail</span>
            </h2>
            {auditLogs.length > 0 ? (
              <div className="mt-4 space-y-2.5">
                {auditLogs.map((log) => (
                  <div key={log.id} className="rounded-lg bg-white/5 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#65DFF0]">{log.action}</span>
                      <span className="text-[10px] text-[#8794AD]">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    {log.targetResource && (
                      <p className="mt-1 font-semibold text-white">{log.targetResource}</p>
                    )}
                    {log.details && <p className="mt-0.5 text-[11px] text-[#A2AEC3]">{log.details}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#8794AD]">
                Audit log trail will populate as actions occur.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const user = readSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!user) redirect("/login?callbackUrl=/dashboard");

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-slate-50 px-6 py-14">
        <section className="mx-auto max-w-5xl rounded-3xl border border-slate-100 bg-white p-8 shadow-sm sm:p-12">
          <p className="text-sm font-bold uppercase tracking-wider text-green-600">{user.role} dashboard</p>
          <h1 className="mt-2 text-3xl font-extrabold text-blue-950">Welcome, {user.name}</h1>
          <p className="mt-3 text-slate-600">You’re signed in as {user.email}.</p>
          <div className="mt-8 rounded-2xl bg-blue-50 p-6">
            <h2 className="font-bold text-blue-900">Your account</h2>
            <p className="mt-2 text-sm text-blue-800">Your {user.role.toLowerCase()} account is ready. Appointment management will appear here.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

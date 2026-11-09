"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/lib/auth";

const NAV_LINKS = [
  { label: "Services",        href: "/#services"       },
  { label: "Find a Doctor",   href: "/find-a-doctor"   },
  { label: "How It Works",    href: "/#how-it-works"   },
  { label: "About",           href: "/#about"          },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data: { user: AuthUser | null }) => setUser(data.user))
      .catch(() => setUser(null));
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="white" strokeWidth={2.5}>
              <path d="M12 7v10M7 12h10" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-extrabold text-xl text-blue-900">
            Doctors<span className="text-green-500">4Home</span>
          </span>
        </Link>

        {/* ── Desktop nav links ── */}
        <div className="hidden md:flex items-center gap-1 text-sm font-medium">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = href === "/find-a-doctor"
              ? pathname === "/find-a-doctor"
              : false;
            return (
              <Link
                key={label}
                href={href}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                }`}
              >
                {label}
                {label === "Find a Doctor" && (
                  <span className="ml-1.5 inline-block bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none align-middle">
                    NEW
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* ── CTA buttons ── */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-semibold text-blue-700 hover:text-blue-900">{user.name}</Link>
              <button type="button" onClick={logout} className="text-sm font-semibold text-slate-500 hover:text-slate-800">Logout</button>
            </>
          ) : (
            <Link href="/login" className="text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors">Login</Link>
          )}
          <Link
            href="#book"
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md"
          >
            Book Now
          </Link>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="md:hidden text-slate-700 p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-1 shadow-lg">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = href === "/find-a-doctor" ? pathname === "/find-a-doctor" : false;
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium px-4 py-3 rounded-xl transition-colors flex items-center gap-2 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                }`}
              >
                {label}
                {label === "Find a Doctor" && (
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    NEW
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-100 mt-2">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-blue-700">{user.name} · Dashboard</Link>
                <button type="button" onClick={logout} className="w-full px-4 py-3 text-left text-sm font-semibold text-slate-600">Logout</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="mb-2 block rounded-xl border border-blue-100 py-3 text-center text-sm font-bold text-blue-700">Login / Sign up</Link>
            )}
            <Link
              href="/find-a-doctor"
              className="block bg-green-500 text-white font-bold py-3 rounded-xl text-center text-sm"
              onClick={() => setMenuOpen(false)}
            >
              Book a Home Visit
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AuthUser } from "@/lib/auth";

const services = [
  { title: "Video Consultation", description: "Connect with a doctor online", icon: "video" },
  { title: "Home Visit", description: "Doctor at your doorstep", icon: "home" },
  { title: "Lab Tests", description: "Request diagnostic services", icon: "lab" },
  { title: "Health Checkup", description: "Plan a wellness visit", icon: "health" },
];

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#16C9E8] via-[#398BF2] to-[#9560F5] shadow-[0_8px_28px_rgba(57,139,242,.28)]">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white" stroke="currentColor" strokeWidth={1.9} aria-hidden="true">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          <path d="M19.5 12a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[17px] font-bold tracking-tight text-white">Doctor<span className="text-[#65DFF0]">For</span>Home</span>
        {!compact && <span className="mt-1.5 text-[9px] font-semibold tracking-[.2em] text-[#8794AD]">HEALTHCARE REIMAGINED</span>}
      </span>
    </span>
  );
}

function ServiceIcon({ kind }: { kind: string }) {
  const common = { className: "h-5 w-5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (kind === "video") return <svg {...common}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3z" /></svg>;
  if (kind === "home") return <svg {...common}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z" /></svg>;
  if (kind === "lab") return <svg {...common}><path d="M8 3h8M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M8 15h8" /></svg>;
  return <svg {...common}><path d="M8 4h8v4a4 4 0 0 1-8 0zM12 12v3a4 4 0 0 0 4 4h1M17 19h3" /><path d="M8 6H5v2a4 4 0 0 0 4 4M16 6h3v2a4 4 0 0 1-4 4" /></svg>;
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const servicesRef = useRef<HTMLDivElement>(null);
  const servicesButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data: { user: AuthUser | null }) => {
        if (!isMounted) return;
        setUser((prev) => {
          const next = data.user;
          if (!prev && !next) return null;
          if (prev && next && prev.id === next.id && prev.role === next.role) {
            return prev;
          }
          return next;
        });
      })
      .catch(() => {
        if (isMounted) setUser(null);
      });
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) setServicesOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && servicesOpen) {
        setServicesOpen(false);
        servicesButtonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [servicesOpen]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  function closeMenus() {
    setMenuOpen(false);
    setServicesOpen(false);
  }

  const navLinkClass = "rounded-full px-3.5 py-2 text-[13px] font-medium text-[#B9C4D7] transition-colors hover:bg-white/[.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C9E8]";

  return (
    <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#080D23]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 sm:px-8 xl:px-10">
        <Link href="/" aria-label="DoctorForHome home" className="shrink-0"><BrandMark /></Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          <Link href="/" className={navLinkClass}>Home</Link>
          <div ref={servicesRef} className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
            <button
              ref={servicesButtonRef}
              type="button"
              aria-haspopup="true"
              aria-expanded={servicesOpen}
              onClick={() => setServicesOpen((value) => !value)}
              onFocus={() => setServicesOpen(true)}
              className={`${navLinkClass} inline-flex items-center gap-1.5`}
            >
              Services
              <svg className={`h-3.5 w-3.5 transition-transform ${servicesOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
            </button>
            {servicesOpen && (
              <div className="services-menu absolute left-1/2 top-[calc(100%+17px)] w-[390px] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#0B142A]/[.98] p-2 shadow-[0_24px_70px_rgba(0,0,0,.55)] animate-menu-in">
                <div className="grid grid-cols-2 gap-1">
                  {services.map((service) => (
                    <Link
                      key={service.title}
                      href="/#appointment"
                      onClick={closeMenus}
                      className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/[.06] focus-visible:bg-white/[.06] focus-visible:outline-none"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#398BF2]/15 bg-gradient-to-br from-[#14274D] to-[#21183F] text-[#34D7EC] transition-colors group-hover:text-white"><ServiceIcon kind={service.icon} /></span>
                      <span className="min-w-0">
                        <span className="block text-[12px] font-semibold text-white">{service.title}</span>
                        <span className="mt-1 block text-[10px] text-[#8794AD]">{service.description}</span>
                      </span>
                    </Link>
                  ))}
                </div>
                <div className="mt-2 h-[2px] rounded-full bg-gradient-to-r from-[#16C9E8] via-[#9560F5] to-[#DF48C7]" />
              </div>
            )}
          </div>
          <Link href="/find-a-doctor" className={navLinkClass}>Doctors</Link>
          <Link href="/#about" className={navLinkClass}>About Us</Link>
          <Link href="/#contact" className={navLinkClass}>Contact</Link>
          <Link href="/#emergency" className="ml-1 rounded-full border border-[#24D6A0]/20 bg-[#24D6A0]/[.08] px-3.5 py-2 text-[12px] font-semibold text-[#5FE7B9] transition hover:bg-[#24D6A0]/[.16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24D6A0]">Emergency contact</Link>
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-[#B9C4D7] hover:border-white/20 hover:text-white transition">
                <span className={`inline-block h-2 w-2 rounded-full ${user.role === "Admin" ? "bg-[#DF48C7]" : user.role === "Doctor" ? "bg-[#16C9E8]" : "bg-[#24D6A0]"}`} />
                <span className="max-w-28 truncate">{user.name}</span>
                <span className="text-[10px] uppercase font-bold text-[#8794AD]">({user.role})</span>
              </Link>
              <button type="button" onClick={logout} className="text-[13px] font-medium text-[#B9C4D7] hover:text-white transition">Logout</button>
            </div>
          ) : <Link href="/login" className="text-[13px] font-medium text-[#B9C4D7] transition hover:text-white">Login</Link>}
          <Link href="/#appointment" className="rounded-full bg-gradient-to-r from-[#16C9E8] via-[#398BF2] to-[#9560F5] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_28px_rgba(57,139,242,.25)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(57,139,242,.35)]">Book Now</Link>
        </div>

        <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-white hover:bg-white/[.06] lg:hidden" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen}>
          {menuOpen ? <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg> : <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>}
        </button>
      </div>

      {menuOpen && (
        <nav aria-label="Mobile navigation" className="border-t border-white/[.07] bg-[#0B142A] px-5 pb-5 pt-3 shadow-xl lg:hidden">
          <Link href="/" onClick={closeMenus} className="mobile-nav-link">Home</Link>
          <button type="button" onClick={() => setServicesOpen((value) => !value)} aria-expanded={servicesOpen} className="mobile-nav-link flex w-full items-center justify-between">Services<span className="text-[#8995AA]">{servicesOpen ? "−" : "+"}</span></button>
          {servicesOpen && <div className="mb-2 grid grid-cols-2 gap-2 px-2 pb-2">{services.map((service) => <Link key={service.title} href="/#appointment" onClick={closeMenus} className="rounded-xl border border-white/[.07] bg-white/[.03] p-3 text-xs font-semibold text-[#C4D0E2]">{service.title}<span className="mt-1 block text-[10px] font-normal text-[#8492AA]">{service.description}</span></Link>)}</div>}
          <Link href="/find-a-doctor" onClick={closeMenus} className="mobile-nav-link">Doctors</Link>
          <Link href="/#about" onClick={closeMenus} className="mobile-nav-link">About Us</Link>
          <Link href="/#contact" onClick={closeMenus} className="mobile-nav-link">Contact</Link>
          <Link href="/#emergency" onClick={closeMenus} className="mobile-nav-link text-[#5FE7B9]">Emergency contact</Link>
          <div className="mt-3 flex gap-3 border-t border-white/[.07] pt-4">
            {user ? <><Link href="/dashboard" onClick={closeMenus} className="mobile-nav-link flex-1">{user.name}</Link><button type="button" onClick={logout} className="rounded-xl border border-white/10 px-4 text-sm text-[#C4D0E2]">Logout</button></> : <Link href="/login" onClick={closeMenus} className="mobile-nav-link flex-1 text-center">Login</Link>}
            <Link href="/#appointment" onClick={closeMenus} className="flex-1 rounded-xl bg-gradient-to-r from-[#16C9E8] to-[#9560F5] px-4 py-3 text-center text-sm font-bold text-white">Book Now</Link>
          </div>
        </nav>
      )}
    </header>
  );
}

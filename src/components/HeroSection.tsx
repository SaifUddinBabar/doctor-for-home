import Image from "next/image";
import Link from "next/link";
import StatsStrip from "@/components/StatsStrip";

export default function HeroSection() {
  return (
    <section id="home" className="hero-ambient relative isolate overflow-hidden border-b border-white/[.06]">
      <div aria-hidden="true" className="hero-glow hero-glow-cyan" />
      <div aria-hidden="true" className="hero-glow hero-glow-purple" />
      <div aria-hidden="true" className="hero-grid" />
      <div className="relative mx-auto grid min-h-[680px] max-w-[1320px] items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[.95fr_1.05fr] lg:gap-12 lg:py-20 xl:px-10">
        <div className="relative z-10 max-w-[620px] animate-fade-in-up">
          <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-[#24D6A0]/20 bg-[#24D6A0]/[.08] px-4 py-2 text-[11px] font-semibold tracking-wide text-[#8AF0C8] sm:text-xs">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#24D6A0] opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[#24D6A0]" /></span>
            Available 24/7 <span className="text-[#24D6A0]/50">•</span> Care, wherever you are
          </div>

          <h1 className="max-w-[620px] text-[clamp(3.35rem,8vw,6.35rem)] font-black leading-[.91] tracking-[-.065em] text-white">
            <span className="block">CARE.</span>
            <span className="hero-text-blue block">EXCELLENCE.</span>
            <span className="hero-text-purple block">FUTURE.</span>
          </h1>
          <p className="mt-7 max-w-[500px] text-base leading-7 text-[#A2AEC3] sm:text-lg sm:leading-8">
            Advanced healthcare that combines compassion and technology for a healthier tomorrow.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#appointment" className="inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#16C9E8] via-[#398BF2] to-[#9560F5] px-7 text-sm font-bold text-white shadow-[0_10px_34px_rgba(57,139,242,.22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(149,96,245,.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C9E8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D23]">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>
              Book Appointment
              <span aria-hidden="true">↗</span>
            </Link>
            <Link href="#appointment" className="inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/[.035] px-7 text-sm font-semibold text-[#D8E0EE] transition hover:border-[#9560F5]/50 hover:bg-white/[.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C9E8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D23]">
              <svg className="h-4 w-4 text-[#BB91FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path d="M8 3h8M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M8 15h8" /></svg>
              Book Diagnostic Test
            </Link>
          </div>

          <StatsStrip />
        </div>

        <div className="relative mx-auto w-full max-w-[650px] animate-fade-in-up animate-delay-200 lg:ml-auto">
          <div aria-hidden="true" className="absolute -inset-6 rounded-[42px] bg-gradient-to-br from-[#16C9E8]/20 via-[#398BF2]/15 to-[#DF48C7]/20 blur-3xl" />
          <div className="hero-image-frame relative rounded-[30px] p-[1px]">
            <div className="relative aspect-[1.08/1] overflow-hidden rounded-[29px] bg-[#111B32] sm:aspect-[1.12/1] lg:aspect-[.97/1]">
              <Image
                src="/home-consultation.png"
                alt="A physician speaking with a patient in the comfort of his home"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 48vw, 620px"
                className="object-cover object-[67%_center]"
                preload
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#080D23]/55 via-transparent to-[#080D23]/5" />
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-[#0B142A]/75 p-4 backdrop-blur-xl sm:bottom-7 sm:left-7 sm:right-7 sm:p-5">
                <div>
                  <p className="text-xs font-semibold text-white sm:text-sm">Care that feels closer</p>
                  <p className="mt-1 text-[10px] text-[#B7C3D7] sm:text-xs">Find a doctor and request a visit at home.</p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#24D6A0]/10 text-[#5FE7B9] ring-1 ring-[#24D6A0]/20">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path d="M12 21s-8-4.4-8-11a4.5 4.5 0 0 1 8-2.9A4.5 4.5 0 0 1 20 10c0 6.6-8 11-8 11Z" /><path d="M8.5 12h2l1.2-2.5 2 5 1.2-2.5h1.6" /></svg>
                </span>
              </div>
            </div>
          </div>

          <div className="absolute -left-3 top-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111B32]/95 px-4 py-3 shadow-[0_15px_40px_rgba(0,0,0,.3)] backdrop-blur sm:-left-8 sm:top-12 sm:px-5 sm:py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#16C9E8]/20 to-[#398BF2]/20 text-[#43D6EB]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path d="m9 12 2 2 4-4" /><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>
            </span>
            <span><span className="block text-xs font-bold text-white">Doctor profiles</span><span className="mt-1 block text-[10px] text-[#93A0B5]">Specialties & availability</span></span>
          </div>

          <div className="absolute -bottom-5 right-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111B32]/95 px-4 py-3 shadow-[0_15px_40px_rgba(0,0,0,.3)] backdrop-blur sm:-bottom-7 sm:right-7 sm:px-5 sm:py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#9560F5]/20 to-[#DF48C7]/20 text-[#C69AFF]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            </span>
            <span><span className="block text-xs font-bold text-white">Choose a time</span><span className="mt-1 block text-[10px] text-[#93A0B5]">Request a convenient visit</span></span>
          </div>
        </div>
      </div>
    </section>
  );
}

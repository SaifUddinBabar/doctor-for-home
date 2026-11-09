import Link from "next/link";

const features = [
  {
    title: "Consultation Requests",
    description: "Choose a consultation type and send a request for a time that works for you.",
    icon: <><path d="M8 3h8l4 4v14H4V3z" /><path d="M8 12h8m-8 4h5M15 3v5h5" /></>,
    gradient: "from-[#16C9E8] to-[#398BF2]",
    glow: "group-hover:shadow-[0_12px_30px_rgba(22,201,232,.12)]",
  },
  {
    title: "Home Healthcare",
    description: "Browse doctor profiles and request a home visit from a listed physician.",
    icon: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z" /></>,
    gradient: "from-[#398BF2] to-[#9560F5]",
    glow: "group-hover:shadow-[0_12px_30px_rgba(57,139,242,.12)]",
  },
  {
    title: "Doctor Discovery",
    description: "Search and filter doctor profiles by specialty, location, rating, and availability.",
    icon: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4M11 8v6m-3-3h6" /></>,
    gradient: "from-[#9560F5] to-[#DF48C7]",
    glow: "group-hover:shadow-[0_12px_30px_rgba(149,96,245,.12)]",
  },
  {
    title: "Doctor Availability",
    description: "Review profile availability and the next listed appointment slot before requesting a visit.",
    icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    gradient: "from-[#24D6A0] to-[#16C9E8]",
    glow: "group-hover:shadow-[0_12px_30px_rgba(36,214,160,.12)]",
  },
  {
    title: "AI Health Assistant",
    description: "Ask general health questions and get informational guidance with a clear medical disclaimer.",
    icon: <><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1" /><circle cx="12" cy="12" r="4" /></>,
    gradient: "from-[#DF48C7] to-[#9560F5]",
    glow: "group-hover:shadow-[0_12px_30px_rgba(223,72,199,.12)]",
  },
  {
    title: "Patient & Doctor Accounts",
    description: "Create an account as a patient or doctor and access your account dashboard.",
    icon: <><circle cx="9" cy="8" r="4" /><path d="M2 21v-2a7 7 0 0 1 14 0v2M19 8v6m3-3h-6" /></>,
    gradient: "from-[#16C9E8] to-[#9560F5]",
    glow: "group-hover:shadow-[0_12px_30px_rgba(149,96,245,.12)]",
  },
];

export default function ServicesSection() {
  return (
    <section id="platform-features" className="relative overflow-hidden bg-[#080D23] py-20 sm:py-28">
      <div aria-hidden="true" className="absolute right-[-180px] top-10 h-[420px] w-[420px] rounded-full bg-[#398BF2]/[.07] blur-[110px]" />
      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8 xl:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow"><span className="h-1.5 w-1.5 rounded-full bg-[#9560F5]" /> PLATFORM FEATURES</span>
          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-[-.04em] text-white sm:text-4xl lg:text-[48px]">Healthcare reimagined<br className="hidden sm:block" /> for the digital age</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#A2AEC3] sm:text-base">A simpler way to explore care, discover doctors, and request an appointment from home.</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:mt-16 xl:grid-cols-3">
          {features.map((feature, index) => (
            <article key={feature.title} className={`feature-card group relative overflow-hidden rounded-[22px] border border-white/[.08] bg-[#111B32]/75 p-6 transition duration-300 hover:-translate-y-1 hover:border-white/[.16] hover:bg-[#14203A] ${feature.glow} sm:p-7`}>
              <div aria-hidden="true" className={`absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${feature.gradient} opacity-[.055] blur-2xl transition-opacity group-hover:opacity-[.12]`} />
              <div className="relative flex items-start justify-between">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-white`}>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{feature.icon}</svg>
                </span>
                <span className="text-[11px] font-semibold tracking-[.12em] text-[#64728C]">0{index + 1}</span>
              </div>
              <h3 className="relative mt-6 text-[16px] font-semibold text-white">{feature.title}</h3>
              <p className="relative mt-3 text-[13px] leading-6 text-[#98A5BA]">{feature.description}</p>
              <span className={`relative mt-6 block h-px w-9 bg-gradient-to-r ${feature.gradient} opacity-75 transition-all duration-300 group-hover:w-16`} />
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-5 rounded-2xl border border-white/[.08] bg-[#111B32]/65 px-6 py-6 text-center sm:flex-row sm:px-8 sm:text-left">
          <p className="text-base font-semibold text-white sm:text-lg">Ready to experience the future of healthcare?</p>
          <Link href="#appointment" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#16C9E8] via-[#398BF2] to-[#9560F5] px-6 text-xs font-bold text-white transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C9E8]">Start Your Journey <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}

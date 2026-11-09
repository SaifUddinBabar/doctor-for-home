import Link from "next/link";

const values = [
  {
    number: "01",
    title: "Experienced Care Team",
    description: "Our care team brings expertise and compassion to every doctor profile and appointment request.",
    color: "from-[#16C9E8] to-[#398BF2]",
    icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 8v6m3-3h-6" /></>,
  },
  {
    number: "02",
    title: "Personalized Care Plans",
    description: "Choose a doctor and appointment type that fits your needs, then share the details that matter to you.",
    color: "from-[#398BF2] to-[#9560F5]",
    icon: <><path d="M9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>,
  },
  {
    number: "03",
    title: "Holistic Well-Being",
    description: "Explore a range of specialties and find the right starting point for your health questions.",
    color: "from-[#9560F5] to-[#DF48C7]",
    icon: <><path d="M12 21s-8-4.4-8-11a4.5 4.5 0 0 1 8-2.9A4.5 4.5 0 0 1 20 10c0 6.6-8 11-8 11Z" /><path d="M8.5 12h2l1.2-2.5 2 5 1.2-2.5h1.6" /></>,
  },
  {
    number: "04",
    title: "Safe & Comfortable Care",
    description: "Request a home visit from the comfort of your space and review doctor availability before you book.",
    color: "from-[#24D6A0] to-[#16C9E8]",
    icon: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z" /><path d="M12 10v4m-2-2h4" /></>,
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="relative overflow-hidden bg-[#0B142A] py-20 sm:py-28">
      <div aria-hidden="true" className="absolute -left-40 top-24 h-80 w-80 rounded-full bg-[#398BF2]/[.08] blur-[100px]" />
      <div aria-hidden="true" className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#9560F5]/[.08] blur-[110px]" />
      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8 xl:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow"><span className="h-1.5 w-1.5 rounded-full bg-[#16C9E8]" /> WHO WE ARE</span>
          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-[-.04em] text-white sm:text-4xl lg:text-[48px]">Care that respects,<br className="hidden sm:block" /> comforts, and supports</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#A2AEC3] sm:text-base">We believe in more than treatment — we deliver comfort, confidence, and care that truly matters.</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:mt-16 xl:grid-cols-4">
          {values.map((value) => (
            <article key={value.number} className="feature-card group rounded-[22px] border border-white/[.08] bg-[#111B32]/75 p-6 transition duration-300 hover:-translate-y-1 hover:border-white/[.16] hover:bg-[#14203A] sm:p-7">
              <div className="flex items-center justify-between">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${value.color} bg-opacity-15 text-white shadow-[0_8px_24px_rgba(0,0,0,.2)]`}>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{value.icon}</svg>
                </span>
                <span className="text-[11px] font-bold tracking-[.16em] text-[#64728C]">{value.number}</span>
              </div>
              <h3 className="mt-6 text-[16px] font-semibold text-white">{value.title}</h3>
              <p className="mt-3 text-[13px] leading-6 text-[#98A5BA]">{value.description}</p>
              <div className={`mt-6 h-px w-10 bg-gradient-to-r ${value.color} opacity-70 transition-all duration-300 group-hover:w-16`} />
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="#platform-features" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-xs font-semibold text-[#C7D2E5] transition hover:border-[#16C9E8]/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C9E8]">
            Know More <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

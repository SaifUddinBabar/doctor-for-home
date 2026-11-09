import Link from "next/link";

const quickLinks = [
  { label: "About Us", href: "/#about" },
  { label: "Services", href: "/#platform-features" },
  { label: "Doctors", href: "/find-a-doctor" },
  { label: "Book Appointment", href: "/#appointment" },
];

const serviceLinks = [
  { label: "Video Consultation", href: "/#appointment" },
  { label: "Home Visit", href: "/#appointment" },
  { label: "Lab Tests", href: "/#appointment" },
  { label: "Health Checkup", href: "/#appointment" },
];

function BrandMark() {
  return (
    <span className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#16C9E8] via-[#398BF2] to-[#9560F5]">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" stroke="currentColor" strokeWidth={1.9} aria-hidden="true"><path d="M12 5v14M5 12h14" strokeLinecap="round" /><circle cx="12" cy="12" r="9" /></svg>
      </span>
      <span><span className="block text-[16px] font-bold text-white">Doctor<span className="text-[#65DFF0]">For</span>Home</span><span className="mt-1 block text-[8px] font-semibold tracking-[.18em] text-[#7C8AA2]">HEALTHCARE REIMAGINED</span></span>
    </span>
  );
}

export default function Footer() {
  return (
    <footer id="contact" className="relative bg-[#060A1A]">
      <div className="h-[2px] bg-gradient-to-r from-[#16C9E8] via-[#9560F5] to-[#DF48C7]" />
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-8 lg:py-16 xl:px-10">
        <div>
          <Link href="/" aria-label="DoctorForHome home"><BrandMark /></Link>
          <p className="mt-5 max-w-xs text-xs leading-6 text-[#8996AB]">Revolutionizing healthcare with technology and compassion for a healthier tomorrow.</p>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[.13em] text-white">Quick Links</h2>
          <ul className="mt-5 space-y-3">
            {quickLinks.map((link) => <li key={link.label}><Link className="text-xs text-[#8996AB] transition hover:text-[#50D8EA]" href={link.href}>{link.label}</Link></li>)}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[.13em] text-white">Services</h2>
          <ul className="mt-5 space-y-3">
            {serviceLinks.map((link) => <li key={link.label}><Link className="text-xs text-[#8996AB] transition hover:text-[#50D8EA]" href={link.href}>{link.label}</Link></li>)}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[.13em] text-white">Contact Us</h2>
          <p className="mt-5 text-xs leading-6 text-[#8996AB]">For appointments, browse available doctors or send a request using the booking form.</p>
          <div className="mt-4 flex flex-col items-start gap-3">
            <Link href="/find-a-doctor" className="inline-flex items-center gap-2 text-xs font-semibold text-[#50D8EA] transition hover:text-white">Find a Doctor <span aria-hidden="true">→</span></Link>
            <Link href="/#appointment" className="inline-flex items-center gap-2 text-xs font-semibold text-[#50D8EA] transition hover:text-white">Request an Appointment <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[.07]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 px-5 py-5 text-center sm:px-8 md:flex-row md:text-left xl:px-10">
          <p className="text-[10px] text-[#738098]">© 2026 DoctorForHome. All rights reserved.</p>
          <p className="text-[10px] text-[#65728A]">DoctorForHome provides general health information and appointment requests. It does not replace emergency or professional care.</p>
        </div>
      </div>
    </footer>
  );
}

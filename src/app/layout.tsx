import type { Metadata } from "next";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "Doctors for Home | Healthcare at Your Doorstep",
  description:
    "Book a certified doctor for a home visit — same-day appointments in General Physician, Pediatrics, Cardiology and more.",
  keywords: ["home doctor", "doctor home visit", "medical care at home", "telemedicine"],
  openGraph: {
    title: "Doctors for Home",
    description: "Expert doctors, right at home.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-white text-slate-800">
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}

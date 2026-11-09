import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import CtaBanner from "@/components/CtaBanner";
import AboutSection from "@/components/AboutSection";
import AppointmentSection from "@/components/AppointmentSection";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080D23] text-white">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <AppointmentSection />
      <FaqSection />
      <CtaBanner />
      <Footer />
    </main>
  );
}

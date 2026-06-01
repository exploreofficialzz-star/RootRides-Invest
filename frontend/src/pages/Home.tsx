import { lazy, Suspense } from "react";
import Header from "@/sections/Header";
import HeroSection from "@/sections/HeroSection";
import StatsBar from "@/sections/StatsBar";
import TickerSection from "@/sections/TickerSection";
import WhyRootRides from "@/sections/WhyRootRides";
import TestimonialsSection from "@/sections/TestimonialsSection";
import FAQSection from "@/sections/FAQSection";
import DownloadCTA from "@/sections/DownloadCTA";
import Footer from "@/sections/Footer";

const CinematicRadialWipe = lazy(() => import("@/components/CinematicRadialWipe"));

export default function Home() {
  return (
    <>
      <Suspense fallback={null}><CinematicRadialWipe /></Suspense>
      <Header />
      <main>
        <HeroSection />
        <StatsBar />
        <TickerSection />
        <WhyRootRides />
        <TestimonialsSection />
        <FAQSection />
        <DownloadCTA />
      </main>
      <Footer />
    </>
  );
}

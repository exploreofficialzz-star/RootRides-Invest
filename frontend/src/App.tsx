import { lazy, Suspense } from "react";
import Header from "@/sections/Header";
import HeroSection from "@/sections/HeroSection";
import StatsBar from "@/sections/StatsBar";
import InvestmentPlans from "@/sections/InvestmentPlans";
import TickerSection from "@/sections/TickerSection";
import WhyRootRides from "@/sections/WhyRootRides";
import ReferralProgram from "@/sections/ReferralProgram";
import TestimonialsSection from "@/sections/TestimonialsSection";
import FAQSection from "@/sections/FAQSection";
import DownloadCTA from "@/sections/DownloadCTA";
import Footer from "@/sections/Footer";

const CinematicRadialWipe = lazy(
  () => import("@/components/CinematicRadialWipe")
);

export default function App() {
  return (
    <>
      <Suspense fallback={null}>
        <CinematicRadialWipe />
      </Suspense>
      <Header />
      <main>
        <HeroSection />
        <StatsBar />
        <InvestmentPlans />
        <TickerSection />
        <WhyRootRides />
        <ReferralProgram />
        <TestimonialsSection />
        <FAQSection />
        <DownloadCTA />
      </main>
      <Footer />
    </>
  );
}

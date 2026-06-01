import { lazy, Suspense } from "react";
import Header from "@/sections/Header";
import HeroSection from "@/sections/HeroSection";
import WhyRootRides from "@/sections/WhyRootRides";
import Footer from "@/sections/Footer";

const CinematicRadialWipe = lazy(() => import("@/components/CinematicRadialWipe"));

export default function Home() {
  return (
    <>
      <Suspense fallback={null}><CinematicRadialWipe /></Suspense>
      <Header />
      <main>
        <HeroSection />
        <WhyRootRides />
      </main>
      <Footer />
    </>
  );
}

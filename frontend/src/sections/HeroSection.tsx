import { motion } from "framer-motion";
import { Link } from "react-router";
import WebGLWaveSurface from "@/components/WebGLWaveSurface";
import { auth } from "@/lib/api";

export default function HeroSection() {
  const isLoggedIn = auth.isLoggedIn();

  return (
    <section className="relative w-full min-h-[100dvh] overflow-hidden" data-section-bg="dark">
      <WebGLWaveSurface />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="text-center max-w-[600px] mx-auto"
          style={{
            backdropFilter: "blur(12px)",
            background: "rgba(2, 35, 28, 0.6)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "48px 40px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
          }}
        >
          <h1 className="font-display text-white leading-[0.95] mb-6"
            style={{ fontSize: "clamp(36px,6vw,72px)", letterSpacing: "-0.03em" }}>
            Grow Your Wealth Daily
          </h1>
          <p className="text-white/70 text-lg mb-8 leading-relaxed">
            Invest in real assets — Rice, Cement, Farm, Machinery &amp; Cars.
            Earn daily returns, withdraw monthly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to={isLoggedIn ? "/dashboard" : "/auth"}
              className="px-8 py-3.5 bg-[#02231c] text-white font-medium rounded-2xl border border-white/20 hover:bg-[#02231c]/80 hover:-translate-y-px transition-all duration-200 text-base"
            >
              {isLoggedIn ? "Go to Dashboard" : "Start Investing"}
            </Link>
            <a href="#download"
              className="px-8 py-3.5 border border-white/30 text-white font-medium rounded-2xl hover:bg-white/10 transition-all duration-200 text-base">
              Download App
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

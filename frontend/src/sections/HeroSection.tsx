import { motion } from "framer-motion";
import { Link } from "react-router";
import WebGLWaveSurface from "@/components/WebGLWaveSurface";

export default function HeroSection() {
  return (
    <section
      className="relative w-full min-h-[100dvh] overflow-hidden"
      data-section-bg="dark"
    >
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
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: "48px 56px",
            boxShadow: "0 32px 80px rgba(0, 0, 0, 0.4)",
          }}
        >
          <h1
            className="font-display text-white leading-[0.95] mb-6"
            style={{
              fontSize: "clamp(36px, 6vw, 72px)",
              letterSpacing: "-0.03em",
              textShadow: "0 2px 40px rgba(0, 0, 0, 0.5)",
            }}
          >
            Grow Your Wealth Daily
          </h1>
          <p
            className="text-white/70 text-lg mb-8 mx-auto"
            style={{ maxWidth: "520px", lineHeight: 1.7 }}
          >
            Invest in real assets — Rice, Cement, Farm, Machinery & Cars. Earn
            daily returns, withdraw monthly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/auth"
              className="px-8 py-3.5 bg-primary text-white font-medium rounded-2xl hover:opacity-90 hover:-translate-y-px transition-all duration-200 text-base"
            >
              Start Investing
            </Link>
            <a
              href="#download"
              className="px-8 py-3.5 border border-white/30 text-white font-medium rounded-2xl hover:bg-white/10 transition-all duration-200 text-base"
            >
              Download App
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-6 md:left-12"
        >
          <span
            className="text-xs font-body font-medium uppercase tracking-[0.08em]"
            style={{ color: "#4a635e" }}
          >
            Trusted by 10,000+ Investors
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 right-6 md:right-12"
        >
          <span
            className="text-xs font-body font-medium uppercase tracking-[0.08em]"
            style={{ color: "#4a635e" }}
          >
            Nigeria&apos;s Premier Investment Platform
          </span>
        </motion.div>
      </div>
    </section>
  );
}

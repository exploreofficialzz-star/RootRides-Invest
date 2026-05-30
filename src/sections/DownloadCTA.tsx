import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function DownloadCTA() {
  const { ref, isInView } = useScrollReveal();

  // Generate random float-up particles
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 8 + 4,
    duration: Math.random() * 4 + 8,
    delay: Math.random() * 5,
  }));

  return (
    <section
      id="download"
      className="relative py-[120px] overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #004d40 0%, #02231c 100%)",
      }}
      data-section-bg="dark"
    >
      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: p.left,
            bottom: "10%",
            width: p.size,
            height: p.size,
            background: "rgba(245, 158, 11, 0.15)",
            animation: `float-up ${p.duration}s ease-in ${p.delay}s infinite`,
          }}
        />
      ))}

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 max-w-[480px] mx-auto px-6 text-center"
      >
        <h2 className="text-h2 text-white mb-6">
          Start Your Investment Journey Today
        </h2>
        <p className="text-white/70 text-lg mb-8 leading-relaxed">
          Download the RootRides app and begin earning daily returns on real
          assets.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="#"
            className="px-8 py-3.5 bg-accent text-dark-green font-medium rounded-pill hover:opacity-90 hover:-translate-y-px transition-all duration-200 text-base"
          >
            Download APK
          </a>
          <a
            href="#plans"
            className="px-8 py-3.5 border border-white/30 text-white font-medium rounded-pill hover:bg-white/10 transition-all duration-200 text-base"
          >
            Learn More
          </a>
        </div>
      </motion.div>
    </section>
  );
}

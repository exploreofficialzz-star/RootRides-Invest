import { useState } from "react";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { api } from "@/lib/api";

const particles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${(i * 13.7 + 5) % 100}%`,
  size: (i % 3) + 5,
  duration: (i % 4) + 8,
  delay: (i % 5) * 1.2,
}));

export default function DownloadCTA() {
  const { ref, isInView } = useScrollReveal();
  const [email, setEmail]     = useState("");
  const [status, setStatus]   = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await api.joinWaitlist(email.trim());
      setStatus(res.message === "already_registered" ? "duplicate" : "success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="download"
      className="relative py-[120px] overflow-hidden"
      style={{ background: "linear-gradient(180deg, #004d40 0%, #02231c 100%)" }}
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
            background: "rgba(245,158,11,0.15)",
            animation: `float-up ${p.duration}s ease-in ${p.delay}s infinite`,
          }}
        />
      ))}

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 max-w-[520px] mx-auto px-6 text-center"
      >
        <h2 className="text-h2 text-white mb-6">
          Start Your Investment Journey Today
        </h2>
        <p className="text-white/70 text-lg mb-8 leading-relaxed">
          Download the RootRides app and begin earning daily returns on real assets.
        </p>

        {/* App download buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
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

        {/* Waitlist / notify form */}
        <div className="border-t border-white/10 pt-8">
          <p className="text-white/50 text-sm mb-4 uppercase tracking-widest font-medium">
            Get early access &amp; updates
          </p>

          {status === "success" ? (
            <p className="text-accent font-medium text-base">
              ✓ You're on the list! We'll be in touch.
            </p>
          ) : status === "duplicate" ? (
            <p className="text-white/60 text-base">
              You're already registered — we'll reach out soon.
            </p>
          ) : (
            <div className="flex gap-2 max-w-[380px] mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="flex-1 px-4 py-3 rounded-pill bg-white/10 border border-white/20 text-white placeholder:text-white/30 text-sm outline-none focus:border-accent/60 transition-colors"
              />
              <button
                onClick={handleSubmit}
                disabled={status === "loading"}
                className="px-5 py-3 bg-accent text-dark-green font-medium rounded-pill text-sm hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
              >
                {status === "loading" ? "..." : "Notify Me"}
              </button>
            </div>
          )}

          {status === "error" && (
            <p className="text-red-400 text-xs mt-2">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </motion.div>
    </section>
  );
}

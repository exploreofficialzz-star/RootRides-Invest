import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function ReferralProgram() {
  const { ref: titleRef, isInView: titleInView } = useScrollReveal();

  return (
    <section
      id="referrals"
      className="section-padding relative"
      style={{
        background:
          "radial-gradient(ellipse 90% 80% at 50% 0%, rgba(245, 158, 11, 0.25) 0%, transparent 60%), #ffffff",
      }}
      data-section-bg="light"
    >
      <div className="max-w-[960px] mx-auto px-6">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-h2 text-dark-green mb-4">Refer & Earn</h2>
          <p className="text-[#4a635e] text-lg max-w-lg mx-auto">
            Share your unique code, build your network, earn ₦3,000 per referral
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Referral Code Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-[20px] p-8 shadow-referral animate-card-glow-amber md:-translate-y-2"
          >
            <h4 className="text-h4 text-dark-green mb-4">
              Your Referral Code
            </h4>
            <div className="border-2 border-dashed border-secondary rounded-xl p-6 text-center mb-6">
              <span
                className="font-body text-primary tracking-[0.12em]"
                style={{ fontSize: "28px" }}
              >
                RR123456
              </span>
            </div>
            <button className="w-full px-6 py-3 bg-secondary text-white font-medium rounded-pill hover:opacity-90 hover:-translate-y-px transition-all duration-200">
              Copy Code
            </button>
          </motion.div>

          {/* How It Works Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-[20px] p-8 animate-card-glow-amber"
          >
            <h4 className="text-h4 text-dark-green mb-6">How It Works</h4>
            <div className="space-y-6">
              {[
                "Share your code",
                "Friend deposits",
                "You earn ₦3,000",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-accent/10 text-accent font-body font-semibold text-sm flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-dark-green font-body text-base">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

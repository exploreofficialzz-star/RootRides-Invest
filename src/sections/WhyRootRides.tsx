import { motion } from "framer-motion";
import { TrendingUp, CalendarCheck, Users, ShieldCheck } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Daily Earnings",
    text: "Claim your earnings every 24 hours. Watch your wealth grow in real time.",
  },
  {
    icon: CalendarCheck,
    title: "Monthly Withdrawals",
    text: "Withdraw your accumulated earnings every month directly to your bank account.",
  },
  {
    icon: Users,
    title: "Referral Rewards",
    text: "Earn \u20A63,000 for every friend you refer who makes their first deposit.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-Grade Security",
    text: "Your funds and data are protected with enterprise-level encryption and security protocols.",
  },
];

export default function WhyRootRides() {
  const { ref: titleRef, isInView: titleInView } = useScrollReveal();

  return (
    <section
      id="why"
      className="section-padding bg-paper"
      data-section-bg="light"
    >
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-h2 text-dark-green mb-4">
            Why Smart Investors Choose RootRides
          </h2>
          <p className="text-[#4a635e] text-lg max-w-xl mx-auto">
            A platform built on transparency, security, and consistent returns
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[0];
  index: number;
}) {
  const { ref, isInView } = useScrollReveal();
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className="bg-white rounded-card p-8 animate-card-glow hover:-translate-y-1 transition-transform duration-300"
    >
      <Icon className="w-8 h-8 text-primary mb-4" strokeWidth={1.5} />
      <h4 className="text-h4 text-dark-green mb-3">{feature.title}</h4>
      <p className="text-[#4a635e] text-base leading-relaxed">{feature.text}</p>
    </motion.div>
  );
}

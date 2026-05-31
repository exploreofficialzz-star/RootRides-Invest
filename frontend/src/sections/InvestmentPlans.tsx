import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import FloatingIconParticles from "@/components/FloatingIconParticles";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { api, type Plan } from "@/lib/api";

// ── Fallback while loading ──────────────────────────────────────────────────
const DEFAULT_PLANS: Plan[] = [
  { id:"1", name:"Rice Plan",      amount_naira:5000,  daily_return_naira:835,  image_path:"/assets/rice.jpg",      gradient:"linear-gradient(135deg,#f8f6f1 0%,#e8f5e9 100%)", is_dark:false, grid_span:"row-span-2",    display_order:1 },
  { id:"2", name:"Cement Plan",    amount_naira:10000, daily_return_naira:1835, image_path:"/assets/cement.jpg",    gradient:"linear-gradient(135deg,#f8f6f1 0%,#eceff1 100%)", is_dark:false, grid_span:"",              display_order:2 },
  { id:"3", name:"Farm Plan",      amount_naira:20000, daily_return_naira:2500, image_path:"/assets/farm.jpg",      gradient:"linear-gradient(135deg,#f8f6f1 0%,#e8f5e9 100%)", is_dark:false, grid_span:"",              display_order:3 },
  { id:"4", name:"Farm Machinery", amount_naira:30000, daily_return_naira:3500, image_path:"/assets/machinery.jpg", gradient:"linear-gradient(135deg,#f8f6f1 0%,#fff3e0 100%)", is_dark:false, grid_span:"",              display_order:4 },
  { id:"5", name:"Cars Plan",      amount_naira:50000, daily_return_naira:4835, image_path:"/assets/cars.jpg",      gradient:"linear-gradient(135deg,#02231c 0%,#004d40 100%)", is_dark:true,  grid_span:"md:col-span-2", display_order:5 },
];

function fmt(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const { ref, isInView } = useScrollReveal();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
      className={`rounded-card p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col ${plan.grid_span} ${
        plan.is_dark ? "text-white" : ""
      }`}
      style={{ background: plan.gradient }}
    >
      <div className="relative overflow-hidden rounded-xl mb-4 flex-shrink-0">
        <img
          src={plan.image_path}
          alt={plan.name}
          className="w-full h-40 object-cover"
        />
      </div>
      <div className="flex flex-col flex-grow">
        <h4 className="text-h4 mb-1">{plan.name}</h4>
        <div className={`text-h3 mb-1 ${plan.is_dark ? "shimmer-gold" : "text-primary"}`}>
          {fmt(plan.amount_naira)}
        </div>
        <div className={`text-sm font-body font-medium mb-4 ${plan.is_dark ? "text-white/70" : "text-accent"}`}>
          Earn {fmt(plan.daily_return_naira)} daily
        </div>
        <div className="mt-auto">
          <a
            href="#download"
            className={`inline-block px-6 py-2.5 rounded-pill text-sm font-medium transition-all duration-200 hover:opacity-90 hover:-translate-y-px ${
              plan.is_dark
                ? "bg-accent text-dark-green"
                : "bg-primary text-white"
            }`}
          >
            Invest Now
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function InvestmentPlans() {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const { ref: titleRef, isInView: titleInView } = useScrollReveal();

  useEffect(() => {
    api.getPlans().then(setPlans).catch(() => {/* keep defaults */});
  }, []);

  return (
    <section
      id="plans"
      className="relative section-padding bg-white"
      data-section-bg="light"
    >
      <FloatingIconParticles />
      <div className="relative z-[2] max-w-[1280px] mx-auto px-6">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-h2 text-dark-green mb-4">
            Choose Your Investment Plan
          </h2>
          <p className="text-[#4a635e] text-lg max-w-lg mx-auto">
            From rice fields to car fleets — invest in what matters
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto">
          {plans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

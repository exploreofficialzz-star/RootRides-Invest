import { motion } from "framer-motion";
import FloatingIconParticles from "@/components/FloatingIconParticles";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const PLANS = [
  {
    name: "Rice Plan",
    amount: "\u20A65,000",
    daily: "\u20A6835",
    image: "/assets/rice.jpg",
    gradient: "linear-gradient(135deg, #f8f6f1 0%, #e8f5e9 100%)",
    span: "row-span-2",
  },
  {
    name: "Cement Plan",
    amount: "\u20A610,000",
    daily: "\u20A61,835",
    image: "/assets/cement.jpg",
    gradient: "linear-gradient(135deg, #f8f6f1 0%, #eceff1 100%)",
    span: "",
  },
  {
    name: "Farm Plan",
    amount: "\u20A620,000",
    daily: "\u20A62,500",
    image: "/assets/farm.jpg",
    gradient: "linear-gradient(135deg, #f8f6f1 0%, #e8f5e9 100%)",
    span: "",
  },
  {
    name: "Farm Machinery",
    amount: "\u20A630,000",
    daily: "\u20A63,500",
    image: "/assets/machinery.jpg",
    gradient: "linear-gradient(135deg, #f8f6f1 0%, #fff3e0 100%)",
    span: "",
  },
  {
    name: "Cars Plan",
    amount: "\u20A650,000",
    daily: "\u20A64,835",
    image: "/assets/cars.jpg",
    gradient: "linear-gradient(135deg, #02231c 0%, #004d40 100%)",
    span: "md:col-span-2",
    dark: true,
  },
];

function PlanCard({
  plan,
  index,
}: {
  plan: (typeof PLANS)[0];
  index: number;
}) {
  const { ref, isInView } = useScrollReveal();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
      className={`rounded-card p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col ${plan.span} ${
        plan.dark ? "text-white" : ""
      }`}
      style={{ background: plan.gradient }}
    >
      <div className="relative overflow-hidden rounded-xl mb-4 flex-shrink-0">
        <img
          src={plan.image}
          alt={plan.name}
          className="w-full h-40 object-cover"
        />
      </div>
      <div className="flex flex-col flex-grow">
        <h4 className="text-h4 mb-1">{plan.name}</h4>
        <div
          className={`text-h3 mb-1 ${plan.dark ? "shimmer-gold" : "text-primary"}`}
        >
          {plan.amount}
        </div>
        <div
          className={`text-sm font-body font-medium mb-4 ${
            plan.dark ? "text-white/70" : "text-accent"
          }`}
        >
          Earn {plan.daily} daily
        </div>
        <div className="mt-auto">
          <a
            href="#download"
            className={`inline-block px-6 py-2.5 rounded-pill text-sm font-medium transition-all duration-200 hover:opacity-90 hover:-translate-y-px ${
              plan.dark
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
  const { ref: titleRef, isInView: titleInView } = useScrollReveal();

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
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

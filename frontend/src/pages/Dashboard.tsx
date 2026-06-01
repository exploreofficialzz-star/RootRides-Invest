import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { LogOut, ChevronRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { api, auth, type Plan } from "@/lib/api";

// ── Fallback plans ─────────────────────────────────────────────────────────────
const DEFAULT_PLANS: Plan[] = [
  { id:"1", name:"Rice Plan",      amount_naira:5000,  daily_return_naira:835,  image_path:"/assets/rice.jpg",      gradient:"linear-gradient(135deg,#f8f6f1 0%,#e8f5e9 100%)", is_dark:false, grid_span:"", display_order:1 },
  { id:"2", name:"Cement Plan",    amount_naira:10000, daily_return_naira:1835, image_path:"/assets/cement.jpg",    gradient:"linear-gradient(135deg,#f8f6f1 0%,#eceff1 100%)", is_dark:false, grid_span:"", display_order:2 },
  { id:"3", name:"Farm Plan",      amount_naira:20000, daily_return_naira:2500, image_path:"/assets/farm.jpg",      gradient:"linear-gradient(135deg,#f8f6f1 0%,#e8f5e9 100%)", is_dark:false, grid_span:"", display_order:3 },
  { id:"4", name:"Farm Machinery", amount_naira:30000, daily_return_naira:3500, image_path:"/assets/machinery.jpg", gradient:"linear-gradient(135deg,#f8f6f1 0%,#fff3e0 100%)", is_dark:false, grid_span:"", display_order:4 },
  { id:"5", name:"Cars Plan",      amount_naira:50000, daily_return_naira:4835, image_path:"/assets/cars.jpg",      gradient:"linear-gradient(135deg,#02231c 0%,#004d40 100%)", is_dark:true,  grid_span:"", display_order:5 },
];

function fmt(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
      className={`rounded-2xl overflow-hidden shadow-md active:scale-[0.98] transition-transform cursor-pointer`}
      style={{ background: plan.gradient }}
    >
      <div className="relative">
        <img
          src={plan.image_path}
          alt={plan.name}
          className="w-full h-44 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="p-5">
        <h3 className={`font-semibold text-lg mb-1 ${plan.is_dark ? "text-white" : "text-[#02231c]"}`}>
          {plan.name}
        </h3>
        <div className={`text-2xl font-bold mb-1 ${plan.is_dark ? "text-[#f59e0b]" : "text-[#02231c]"}`}>
          {fmt(plan.amount_naira)}
        </div>
        <div className={`flex items-center gap-1.5 text-sm mb-5 ${plan.is_dark ? "text-white/60" : "text-[#4a635e]"}`}>
          <TrendingUp size={14} />
          Earn {fmt(plan.daily_return_naira)} daily
        </div>
        <button
          className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 ${
            plan.is_dark
              ? "bg-[#f59e0b] text-[#02231c]"
              : "bg-[#02231c] text-white"
          }`}
        >
          Invest Now <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const navigate  = useNavigate();
  const user      = auth.getUser();
  const [plans, setPlans]     = useState<Plan[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState(true);

  // Guard: redirect to /auth if not logged in
  useEffect(() => {
    if (!auth.isLoggedIn()) {
      navigate("/auth");
    }
  }, [navigate]);

  useEffect(() => {
    api.getPlans()
      .then(setPlans)
      .catch(() => {/* keep defaults */})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  if (!user) return null;

  const firstName = user.full_name.split(" ")[0];

  return (
    <div className="min-h-screen" style={{ background: "#f5f3ee" }}>

      {/* Top bar */}
      <div
        className="sticky top-0 z-50 px-5 py-4 flex items-center justify-between"
        style={{
          background: "#02231c",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
            <span className="text-white font-semibold text-base">RootRides Invest</span>
          </div>
          <p className="text-white/40 text-xs pl-3.5">Welcome back, {firstName} 👋</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-white/40 text-xs hover:text-white/70 transition-colors">
            Home
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-xs"
          >
            <LogOut size={13} />
            Log out
          </button>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-[480px] mx-auto px-4 py-6">

        {/* Greeting card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl p-5 mb-6 text-white"
          style={{ background: "linear-gradient(135deg,#02231c 0%,#004d40 100%)" }}
        >
          <p className="text-white/60 text-sm mb-1">Good day, {firstName}</p>
          <h1 className="text-xl font-bold mb-3">Choose Your Investment Plan</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Invest in real Nigerian assets. Earn daily. Withdraw monthly.
          </p>
        </motion.div>

        {/* Plans */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-2xl bg-white/60 h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} index={i} />
            ))}
          </div>
        )}

        <p className="text-center text-[#4a635e]/50 text-xs mt-8 pb-4">
          RootRides Invest · Secure · Nigerian Regulated
        </p>
      </div>
    </div>
  );
}

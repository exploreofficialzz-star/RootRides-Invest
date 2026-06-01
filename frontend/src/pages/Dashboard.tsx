import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router";
import { LogOut, TrendingUp, CheckCircle, Lock, Copy, ChevronRight, Wallet, ClipboardList, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api, auth, type Plan, type Investment, type UserStats } from "@/lib/api";

function fmt(n: number) { return "₦" + n.toLocaleString("en-NG"); }

function timeUntilMidnight(): string {
  const now = new Date(); const next = new Date(); next.setHours(24, 0, 0, 0);
  const diff = Math.floor((next.getTime() - now.getTime()) / 1000);
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar({ stats }: { stats: UserStats | null }) {
  const items = [
    { label: "Invested",       value: stats ? fmt(stats.total_invested)  : "—" },
    { label: "Today's Profit", value: stats ? fmt(stats.today_potential) : "—" },
    { label: "Total Earned",   value: stats ? fmt(stats.total_earned)    : "—" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2 px-4 mb-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl p-3 text-center bg-white border border-[#02231c]/08">
          <div className="font-bold text-[#02231c] text-sm truncate">{item.value}</div>
          <div className="text-[#4a635e] text-[10px] mt-0.5">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Invest Tab ────────────────────────────────────────────────────────────────
function PlanCard({ plan, onInvest, investing }: { plan: Plan; onInvest: (p: Plan) => void; investing: string | null }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden shadow-sm" style={{ background: plan.gradient }}>
      <img src={plan.image_path} alt={plan.name} className="w-full h-40 object-cover" />
      <div className="p-4">
        <h3 className={`font-semibold text-base mb-0.5 ${plan.is_dark ? "text-white" : "text-[#02231c]"}`}>{plan.name}</h3>
        <div className={`text-xl font-bold mb-0.5 ${plan.is_dark ? "text-[#f59e0b]" : "text-[#02231c]"}`}>{fmt(plan.amount_naira)}</div>
        <div className={`flex items-center gap-1 text-xs mb-4 ${plan.is_dark ? "text-white/60" : "text-[#4a635e]"}`}>
          <TrendingUp size={12} /> Earn {fmt(plan.daily_return_naira)} daily
        </div>
        <button onClick={() => onInvest(plan)} disabled={investing === plan.id}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 ${plan.is_dark ? "bg-[#f59e0b] text-[#02231c]" : "bg-[#02231c] text-white"}`}>
          {investing === plan.id ? "Processing…" : <><span>Invest Now</span><ChevronRight size={15} /></>}
        </button>
      </div>
    </motion.div>
  );
}

function InvestTab({ plans, onInvested }: { plans: Plan[]; onInvested: () => void }) {
  const [investing, setInvesting] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const handleInvest = async (plan: Plan) => {
    setInvesting(plan.id); setSuccessMsg(""); setErrorMsg("");
    try {
      await api.createInvestment(plan.id, plan.name, plan.amount_naira, plan.daily_return_naira);
      setSuccessMsg(`✓ Invested in ${plan.name}! Your first claim is ready.`);
      onInvested();
    } catch (e: unknown) { setErrorMsg(e instanceof Error ? e.message : "Failed"); }
    finally { setInvesting(null); }
  };
  return (
    <div className="px-4 pb-28">
      {successMsg && <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm">{successMsg}</div>}
      {errorMsg   && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{errorMsg}</div>}
      <div className="space-y-4">{plans.map(p => <PlanCard key={p.id} plan={p} onInvest={handleInvest} investing={investing} />)}</div>
    </div>
  );
}

// ── Tasks Tab ─────────────────────────────────────────────────────────────────
function TasksTab({ investments, claimedIds, onClaim }: { investments: Investment[]; claimedIds: string[]; onClaim: (id: string) => void }) {
  const [claiming, setClaiming] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const today = new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });
  const totalClaimed = investments.filter(i => claimedIds.includes(i.id)).reduce((s, i) => s + i.daily_return_naira, 0);

  const handleClaim = async (inv: Investment) => {
    setClaiming(inv.id); setErrors(p => ({ ...p, [inv.id]: "" }));
    try { await api.claimDailyProfit(inv.id); onClaim(inv.id); }
    catch (e: unknown) { setErrors(p => ({ ...p, [inv.id]: e instanceof Error ? e.message : "Failed" })); }
    finally { setClaiming(null); }
  };

  if (!investments.length) return (
    <div className="flex flex-col items-center justify-center px-8 py-20 text-center pb-28">
      <Wallet size={40} className="text-[#4a635e]/30 mb-4" />
      <p className="text-[#4a635e] font-medium mb-1">No active investments</p>
      <p className="text-[#4a635e]/60 text-sm">Go to Invest tab to get started</p>
    </div>
  );

  return (
    <div className="px-4 pb-28">
      <div className="mb-4">
        <p className="text-[#4a635e] text-sm">{today}</p>
        <h2 className="text-[#02231c] font-bold text-lg">Daily Claims</h2>
        {totalClaimed > 0 && <p className="text-green-600 text-sm font-medium">Claimed today: {fmt(totalClaimed)} ✓</p>}
      </div>
      <div className="space-y-3">
        {investments.map(inv => {
          const claimed = claimedIds.includes(inv.id);
          return (
            <motion.div key={inv.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 bg-white border" style={{ borderColor: claimed ? "#bbf7d0" : "rgba(2,35,28,0.08)" }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-[#02231c]">{inv.plan_name}</p>
                  <p className="text-[#4a635e] text-xs">Invested: {fmt(inv.amount_naira)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#02231c] font-bold">{fmt(inv.daily_return_naira)}</p>
                  <p className="text-[#4a635e] text-xs">daily return</p>
                </div>
              </div>
              {errors[inv.id] && <p className="text-red-500 text-xs mb-2">{errors[inv.id]}</p>}
              {claimed ? (
                <div className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2 text-green-700 font-medium text-sm"><CheckCircle size={16} /> Claimed for today</div>
                  <span className="text-green-600 text-xs">Next in {timeUntilMidnight()}</span>
                </div>
              ) : (
                <button onClick={() => handleClaim(inv)} disabled={claiming === inv.id}
                  className="w-full py-2.5 bg-[#02231c] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                  {claiming === inv.id ? "Claiming…" : `Claim ${fmt(inv.daily_return_naira)}`}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
      <p className="text-center text-[#4a635e]/40 text-xs mt-6">Claims reset every day at midnight</p>
    </div>
  );
}

// ── Referral Tab ──────────────────────────────────────────────────────────────
function ReferralTab({ stats }: { stats: UserStats | null }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!stats?.referral_code) return;
    navigator.clipboard.writeText(stats.referral_code);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  if (!stats?.has_investments) return (
    <div className="flex flex-col items-center justify-center px-8 py-20 text-center pb-28">
      <div className="w-16 h-16 rounded-full bg-[#02231c]/08 flex items-center justify-center mb-4">
        <Lock size={28} className="text-[#4a635e]/40" />
      </div>
      <p className="text-[#02231c] font-bold text-lg mb-2">Referral Locked</p>
      <p className="text-[#4a635e] text-sm leading-relaxed">Make your first investment to unlock your unique referral code and earn ₦3,000 per referral.</p>
    </div>
  );
  return (
    <div className="px-4 pb-28">
      {(stats.referral_earnings || 0) > 0 && (
        <div className="rounded-2xl p-4 mb-4 text-white" style={{ background: "linear-gradient(135deg,#02231c,#004d40)" }}>
          <p className="text-white/60 text-xs mb-1">Referral Earnings</p>
          <p className="text-2xl font-bold text-[#f59e0b]">{fmt(stats.referral_earnings)}</p>
        </div>
      )}
      <div className="rounded-2xl p-5 mb-4 bg-white border border-[#02231c]/10">
        <p className="text-[#4a635e] text-sm mb-3 font-medium">Your Referral Code</p>
        <div className="rounded-xl border-2 border-dashed border-[#02231c]/20 px-4 py-4 text-center mb-3">
          <span className="text-[#02231c] font-bold text-2xl tracking-widest">{stats.referral_code}</span>
        </div>
        <button onClick={handleCopy}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 text-white transition-colors"
          style={{ background: copied ? "#16a34a" : "#02231c" }}>
          <Copy size={15} />{copied ? "Copied!" : "Copy Code"}
        </button>
      </div>
      <div className="rounded-2xl p-5 bg-white border border-[#02231c]/10">
        <p className="text-[#02231c] font-semibold mb-4">How It Works</p>
        {["Share your code", "Friend deposits", "You earn ₦3,000"].map((step, i) => (
          <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-[#02231c]" style={{ background: "#f59e0b33" }}>{i + 1}</div>
            <span className="text-[#02231c] text-sm">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
type Tab = "invest" | "tasks" | "referral";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = auth.getUser();
  const [tab, setTab]                   = useState<Tab>("invest");
  const [plans, setPlans]               = useState<Plan[]>([]);
  const [investments, setInvestments]   = useState<Investment[]>([]);
  const [claimedIds, setClaimedIds]     = useState<string[]>([]);
  const [stats, setStats]               = useState<UserStats | null>(null);

  useEffect(() => {
    if (!auth.isLoggedIn()) { navigate("/auth"); return; }
    api.getPlans().then(setPlans).catch(() => {});
  }, [navigate]);

  const loadUserData = useCallback(async () => {
    try {
      const [s, inv, claims] = await Promise.all([api.getUserStats(), api.getUserInvestments(), api.getTodayClaims()]);
      setStats(s); setInvestments(inv); setClaimedIds(claims);
    } catch { /* fail silently */ }
  }, []);

  useEffect(() => { loadUserData(); }, [loadUserData]);

  const handleLogout = () => { auth.logout(); navigate("/"); };
  if (!user) return null;

  const tabs = [
    { id: "invest"   as Tab, label: "Invest",   icon: <Wallet size={20} /> },
    { id: "tasks"    as Tab, label: "Tasks",    icon: <ClipboardList size={20} /> },
    { id: "referral" as Tab, label: "Referral", icon: <Users size={20} /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#f5f3ee" }}>
      {/* Top bar */}
      <div className="sticky top-0 z-50 px-5 py-3.5 flex items-center justify-between" style={{ background: "#02231c", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /><span className="text-white font-semibold">RootRides Invest</span></div>
          <p className="text-white/40 text-[11px] pl-3.5">Hey {user.full_name.split(" ")[0]} 👋</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-white/40 text-xs hover:text-white/70">Home</Link>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-white/40 text-xs hover:text-white/70"><LogOut size={13} /> Log out</button>
        </div>
      </div>

      <div className="pt-4"><StatsBar stats={stats} /></div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {tab === "invest"   && <InvestTab   plans={plans} onInvested={loadUserData} />}
          {tab === "tasks"    && <TasksTab    investments={investments} claimedIds={claimedIds} onClaim={(id) => { setClaimedIds(p => [...p, id]); loadUserData(); }} />}
          {tab === "referral" && <ReferralTab stats={stats} />}
        </motion.div>
      </AnimatePresence>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex border-t bg-white" style={{ borderColor: "rgba(2,35,28,0.08)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${tab === t.id ? "text-[#02231c]" : "text-[#4a635e]/40"}`}>
            {t.icon}
            <span className="text-[10px] font-medium">{t.label}</span>
            {tab === t.id && <div className="w-4 h-0.5 rounded-full bg-[#f59e0b]" />}
          </button>
        ))}
      </div>
    </div>
  );
}

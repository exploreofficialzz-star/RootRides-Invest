import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router";
import { LogOut, TrendingUp, CheckCircle, Lock, Copy, ChevronRight, Wallet, ClipboardList, Users, ArrowDownToLine, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api, auth, type Plan, type Investment, type UserStats } from "@/lib/api";

const SITE_URL = "https://root-rides-invest.vercel.app";

function fmt(n: number) { return "₦" + n.toLocaleString("en-NG"); }
function timeUntilMidnight() {
  const now = new Date(), next = new Date(); next.setHours(24,0,0,0);
  const d = Math.floor((next.getTime()-now.getTime())/1000);
  return `${Math.floor(d/3600)}h ${Math.floor((d%3600)/60)}m`;
}
function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

declare global { interface Window { FlutterwaveCheckout: (c: Record<string,unknown>) => void; } }
const FLW_PUBLIC_KEY = (import.meta.env.VITE_FLW_PUBLIC_KEY as string) || "";

// ── Stats Card ────────────────────────────────────────────────────────────────
function StatsCard({ stats }: { stats: UserStats | null }) {
  return (
    <div className="mx-4 mb-5 rounded-2xl p-5 text-white"
      style={{ background: "linear-gradient(135deg,#02231c 0%,#004d40 100%)", boxShadow: "0 8px 32px rgba(2,35,28,0.25)" }}>
      <p className="text-white/40 text-[11px] font-medium uppercase tracking-widest mb-4">Portfolio Overview</p>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-white/50 text-[11px] mb-1">Total Invested</p>
          <p className="text-[#f59e0b] font-bold text-xl leading-tight">{stats ? fmt(stats.total_invested) : "—"}</p>
        </div>
        <div className="border-x border-white/10 px-3">
          <p className="text-white/50 text-[11px] mb-1">Today's Profit</p>
          <p className="text-white font-bold text-xl leading-tight">{stats ? fmt(stats.today_potential) : "—"}</p>
        </div>
        <div>
          <p className="text-white/50 text-[11px] mb-1">Total Earned</p>
          <p className="text-green-400 font-bold text-xl leading-tight">{stats ? fmt(stats.total_earned) : "—"}</p>
        </div>
      </div>
    </div>
  );
}

// ── Invest Tab ────────────────────────────────────────────────────────────────
function PlanCard({ plan, onInvest, investing }: { plan: Plan; onInvest:(p:Plan)=>void; investing:string|null }) {
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="rounded-2xl overflow-hidden shadow-sm" style={{ background: plan.gradient }}>
      <img src={plan.image_path} alt={plan.name} className="w-full h-40 object-cover" />
      <div className="p-4">
        <h3 className={`font-semibold text-base mb-0.5 ${plan.is_dark?"text-white":"text-[#02231c]"}`}>{plan.name}</h3>
        <div className={`text-xl font-bold mb-0.5 ${plan.is_dark?"text-[#f59e0b]":"text-[#02231c]"}`}>{fmt(plan.amount_naira)}</div>
        <div className={`flex items-center gap-1 text-xs mb-4 ${plan.is_dark?"text-white/60":"text-[#4a635e]"}`}><TrendingUp size={12}/> Earn {fmt(plan.daily_return_naira)} daily</div>
        <button onClick={() => onInvest(plan)} disabled={investing === plan.id}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 ${plan.is_dark?"bg-[#f59e0b] text-[#02231c]":"bg-[#02231c] text-white"}`}>
          {investing===plan.id?"Processing…":<><span>Invest Now</span><ChevronRight size={15}/></>}
        </button>
      </div>
    </motion.div>
  );
}

function InvestTab({ plans, onInvested }: { plans:Plan[]; onInvested:()=>void }) {
  const [investing, setInvesting] = useState<string|null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleInvest = (plan: Plan) => {
    const user = auth.getUser(); if (!user) return;
    setSuccessMsg(""); setErrorMsg("");
    const txRef = `RR-${user.id.slice(0,8)}-${plan.id.slice(0,8)}-${Date.now()}`;
    setInvesting(plan.id);
    window.FlutterwaveCheckout({
      public_key: FLW_PUBLIC_KEY, tx_ref: txRef, amount: plan.amount_naira, currency: "NGN",
      payment_options: "card, banktransfer, ussd",
      customer: { email:`${user.phone.replace(/\D/g,"")}@rootrides.invest`, phone_number:user.phone, name:user.full_name },
      customizations: { title:"RootRides Invest", description:`Investment: ${plan.name}` },
      callback: async (response: { status:string; transaction_id:number }) => {
        if (response.status === "successful") {
          try {
            await api.verifyPayment({ transaction_id:response.transaction_id, tx_ref:txRef, plan_id:plan.id, plan_name:plan.name, amount_naira:plan.amount_naira, daily_return_naira:plan.daily_return_naira });
            setSuccessMsg(`✓ Payment confirmed! You're invested in ${plan.name}. Go to Tasks to claim daily.`);
            onInvested();
          } catch (e: unknown) { setErrorMsg(e instanceof Error ? e.message : "Verification failed. Contact support."); }
        } else { setErrorMsg("Payment not completed. Please try again."); }
        setInvesting(null);
      },
      onclose: () => setInvesting(null),
    });
  };

  return (
    <div className="px-4 pb-28">
      {successMsg && <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm">{successMsg}</div>}
      {errorMsg   && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{errorMsg}</div>}
      <div className="space-y-4">{plans.map(p => <PlanCard key={p.id} plan={p} onInvest={handleInvest} investing={investing}/>)}</div>
    </div>
  );
}

// ── Tasks Tab ─────────────────────────────────────────────────────────────────
function TasksTab({ investments, claimedIds, onClaim }: { investments:Investment[]; claimedIds:string[]; onClaim:(id:string)=>void }) {
  const [claiming, setClaiming] = useState<string|null>(null);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const totalClaimed = investments.filter(i=>claimedIds.includes(i.id)).reduce((s,i)=>s+i.daily_return_naira,0);
  const today = new Date().toLocaleDateString("en-NG",{weekday:"long",day:"numeric",month:"long"});

  const handleClaim = async (inv: Investment) => {
    setClaiming(inv.id); setErrors(p=>({...p,[inv.id]:""}));
    try { await api.claimDailyProfit(inv.id); onClaim(inv.id); }
    catch (e: unknown) { setErrors(p=>({...p,[inv.id]:e instanceof Error?e.message:"Failed"})); }
    finally { setClaiming(null); }
  };

  if (!investments.length) return (
    <div className="flex flex-col items-center justify-center px-8 py-20 text-center pb-28">
      <Wallet size={40} className="text-[#4a635e]/30 mb-4"/>
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
            <motion.div key={inv.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
              className="rounded-2xl p-4 bg-white border" style={{borderColor:claimed?"#bbf7d0":"rgba(2,35,28,0.08)"}}>
              <div className="flex items-start justify-between mb-3">
                <div><p className="font-semibold text-[#02231c]">{inv.plan_name}</p><p className="text-[#4a635e] text-xs">Invested: {fmt(inv.amount_naira)}</p></div>
                <div className="text-right"><p className="text-[#02231c] font-bold">{fmt(inv.daily_return_naira)}</p><p className="text-[#4a635e] text-xs">daily</p></div>
              </div>
              {errors[inv.id] && <p className="text-red-500 text-xs mb-2">{errors[inv.id]}</p>}
              {claimed ? (
                <div className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2 text-green-700 font-medium text-sm"><CheckCircle size={16}/> Claimed</div>
                  <span className="text-green-600 text-xs">Next in {timeUntilMidnight()}</span>
                </div>
              ) : (
                <button onClick={()=>handleClaim(inv)} disabled={claiming===inv.id}
                  className="w-full py-2.5 bg-[#02231c] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                  {claiming===inv.id?"Claiming…":`Claim ${fmt(inv.daily_return_naira)}`}
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

// ── Withdraw Tab ──────────────────────────────────────────────────────────────
function WithdrawTab({ investments }: { investments: Investment[] }) {
  if (!investments.length) return (
    <div className="flex flex-col items-center justify-center px-8 py-20 text-center pb-28">
      <ArrowDownToLine size={40} className="text-[#4a635e]/30 mb-4"/>
      <p className="text-[#4a635e] font-medium mb-1">No active investments</p>
      <p className="text-[#4a635e]/60 text-sm">Invest first to unlock withdrawals</p>
    </div>
  );

  return (
    <div className="px-4 pb-28">
      <div className="mb-4">
        <h2 className="text-[#02231c] font-bold text-lg">Withdrawals</h2>
        <p className="text-[#4a635e] text-sm">Earnings are withdrawable after 31 days</p>
      </div>

      <div className="space-y-4">
        {investments.map(inv => {
          const elapsed  = daysSince(inv.started_at);
          const remaining = Math.max(0, 31 - elapsed);
          const eligible  = remaining === 0;
          const progress  = Math.min(100, Math.round((elapsed / 31) * 100));
          const totalEarnable = inv.daily_return_naira * 31;

          return (
            <motion.div key={inv.id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
              className="rounded-2xl p-5 bg-white border border-[#02231c]/10">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-[#02231c] text-base">{inv.plan_name}</p>
                  <p className="text-[#4a635e] text-sm">Principal: {fmt(inv.amount_naira)}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${eligible ? "bg-green-100 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                    {eligible ? "Ready" : `${remaining}d left`}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-[#4a635e] mb-1.5">
                  <span>Day {Math.min(elapsed, 31)} of 31</span>
                  <span>{progress}% complete</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    style={{ background: eligible ? "#16a34a" : "linear-gradient(90deg,#f59e0b,#02231c)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              <p className="text-[#4a635e] text-xs mb-4">
                Max earnable over 31 days: <span className="font-semibold text-[#02231c]">{fmt(totalEarnable)}</span>
              </p>

              {eligible ? (
                <button className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2">
                  <ArrowDownToLine size={16}/> Request Withdrawal
                </button>
              ) : (
                <div className="text-center py-3 bg-[#f5f3ee] rounded-xl">
                  <p className="text-[#02231c] font-semibold text-sm">Available in {remaining} days</p>
                  <p className="text-[#4a635e] text-xs mt-0.5">
                    {new Date(new Date(inv.started_at).getTime() + 31*86400000).toLocaleDateString("en-NG",{day:"numeric",month:"long",year:"numeric"})}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mx-0 mt-4 rounded-2xl p-4 bg-white border border-[#02231c]/10">
        <p className="text-[#02231c] font-semibold text-sm mb-1">Withdrawal Policy</p>
        <ul className="text-[#4a635e] text-xs space-y-1">
          <li>• Withdrawals available after 31 days of investment</li>
          <li>• Processed within 24–48 hours to your bank account</li>
          <li>• Add your bank details in the app before requesting</li>
        </ul>
      </div>
    </div>
  );
}

// ── Referral Tab ──────────────────────────────────────────────────────────────
function ReferralTab({ stats }: { stats: UserStats | null }) {
  const [copied, setCopied] = useState<"code"|"link"|null>(null);

  const referralLink = stats?.referral_code ? `${SITE_URL}/auth?ref=${stats.referral_code}` : "";

  const handleCopy = (type: "code"|"link") => {
    const text = type === "code" ? stats?.referral_code : referralLink;
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(type); setTimeout(()=>setCopied(null), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title:"Join RootRides Invest", text:`Use my referral code ${stats?.referral_code} to sign up and start earning daily on RootRides Invest!`, url: referralLink });
    } else { handleCopy("link"); }
  };

  if (!stats?.has_investments) return (
    <div className="flex flex-col items-center justify-center px-8 py-20 text-center pb-28">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{background:"rgba(2,35,28,0.06)"}}>
        <Lock size={28} className="text-[#4a635e]/40"/>
      </div>
      <p className="text-[#02231c] font-bold text-lg mb-2">Referral Locked</p>
      <p className="text-[#4a635e] text-sm leading-relaxed">Make your first investment to unlock your unique referral link and earn ₦3,000 per friend who invests.</p>
    </div>
  );

  return (
    <div className="px-4 pb-28">
      {/* Earnings */}
      {(stats.referral_earnings || 0) > 0 && (
        <div className="rounded-2xl p-4 mb-4 text-white" style={{background:"linear-gradient(135deg,#02231c,#004d40)"}}>
          <p className="text-white/60 text-xs mb-1">Total Referral Earnings</p>
          <p className="text-2xl font-bold text-[#f59e0b]">{fmt(stats.referral_earnings)}</p>
          <p className="text-white/40 text-xs mt-1">₦3,000 per friend who invests</p>
        </div>
      )}

      {/* Referral code */}
      <div className="rounded-2xl p-5 mb-3 bg-white border border-[#02231c]/10">
        <p className="text-[#4a635e] text-sm font-medium mb-3">Your Referral Code</p>
        <div className="rounded-xl border-2 border-dashed border-[#02231c]/20 px-4 py-4 text-center mb-3">
          <span className="text-[#02231c] font-bold text-2xl tracking-widest">{stats.referral_code}</span>
        </div>
        <button onClick={()=>handleCopy("code")}
          className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 text-white mb-2 transition-colors"
          style={{background: copied==="code"?"#16a34a":"#02231c"}}>
          <Copy size={15}/>{copied==="code"?"Copied!":"Copy Code"}
        </button>
      </div>

      {/* Referral link */}
      <div className="rounded-2xl p-5 mb-3 bg-white border border-[#02231c]/10">
        <p className="text-[#4a635e] text-sm font-medium mb-3">Your Referral Link</p>
        <div className="rounded-xl bg-[#f5f3ee] px-3 py-3 mb-3 text-xs text-[#4a635e] break-all">{referralLink}</div>
        <div className="flex gap-2">
          <button onClick={()=>handleCopy("link")}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 text-white transition-colors"
            style={{background: copied==="link"?"#16a34a":"#02231c"}}>
            <Copy size={14}/>{copied==="link"?"Copied!":"Copy Link"}
          </button>
          <button onClick={handleShare}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-[#f59e0b] text-[#02231c]">
            <Share2 size={14}/>Share
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl p-5 bg-white border border-[#02231c]/10">
        <p className="text-[#02231c] font-semibold mb-4">How It Works</p>
        {[
          ["Share your link",          "Send your referral link to friends"],
          ["Friend signs up",           "They register using your link"],
          ["Friend invests",            "They make their first deposit"],
          ["You earn ₦3,000",          "Instantly added to your account"],
        ].map(([title, sub], i) => (
          <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-[#02231c] mt-0.5" style={{background:"#f59e0b33"}}>{i+1}</div>
            <div><p className="text-[#02231c] text-sm font-medium">{title}</p><p className="text-[#4a635e] text-xs">{sub}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
type Tab = "invest"|"tasks"|"withdraw"|"referral";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = auth.getUser();
  const [tab, setTab]                 = useState<Tab>("invest");
  const [plans, setPlans]             = useState<Plan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [claimedIds, setClaimedIds]   = useState<string[]>([]);
  const [stats, setStats]             = useState<UserStats|null>(null);

  useEffect(() => { if (!auth.isLoggedIn()) { navigate("/auth"); return; } api.getPlans().then(setPlans).catch(()=>{}); }, [navigate]);

  const loadUserData = useCallback(async () => {
    try {
      const [s,inv,claims] = await Promise.all([api.getUserStats(), api.getUserInvestments(), api.getTodayClaims()]);
      setStats(s); setInvestments(inv); setClaimedIds(claims);
    } catch { /* fail silently */ }
  }, []);

  useEffect(() => { loadUserData(); }, [loadUserData]);

  const handleLogout = () => { auth.logout(); navigate("/"); };
  if (!user) return null;

  const tabs = [
    { id:"invest"   as Tab, label:"Invest",   icon:<Wallet size={18}/>       },
    { id:"tasks"    as Tab, label:"Tasks",    icon:<ClipboardList size={18}/> },
    { id:"withdraw" as Tab, label:"Withdraw", icon:<ArrowDownToLine size={18}/>},
    { id:"referral" as Tab, label:"Referral", icon:<Users size={18}/>         },
  ];

  return (
    <div className="min-h-screen" style={{background:"#f5f3ee"}}>
      {/* Top bar */}
      <div className="sticky top-0 z-50 px-5 py-3.5 flex items-center justify-between"
        style={{background:"#02231c",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div>
          <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"/><span className="text-white font-semibold">RootRides Invest</span></div>
          <p className="text-white/40 text-[11px] pl-3.5">Hey {user.full_name.split(" ")[0]} 👋</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-white/40 text-xs hover:text-white/70">Home</Link>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-white/40 text-xs hover:text-white/70"><LogOut size={13}/> Log out</button>
        </div>
      </div>

      <div className="pt-4"><StatsCard stats={stats}/></div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.2}}>
          {tab==="invest"   && <InvestTab   plans={plans} onInvested={loadUserData}/>}
          {tab==="tasks"    && <TasksTab    investments={investments} claimedIds={claimedIds} onClaim={(id)=>{setClaimedIds(p=>[...p,id]); loadUserData();}}/>}
          {tab==="withdraw" && <WithdrawTab investments={investments}/>}
          {tab==="referral" && <ReferralTab stats={stats}/>}
        </motion.div>
      </AnimatePresence>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex border-t bg-white" style={{borderColor:"rgba(2,35,28,0.08)"}}>
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors ${tab===t.id?"text-[#02231c]":"text-[#4a635e]/40"}`}>
            {t.icon}
            <span className="text-[9px] font-medium">{t.label}</span>
            {tab===t.id && <div className="w-3 h-0.5 rounded-full bg-[#f59e0b]"/>}
          </button>
        ))}
      </div>
    </div>
  );
}

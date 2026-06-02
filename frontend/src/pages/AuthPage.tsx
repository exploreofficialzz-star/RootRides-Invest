import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router";
import { Eye, EyeOff, ArrowLeft, Phone, Lock, User, Wifi, WifiOff, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";

// ── Nigerian phone validation ──────────────────────────────────
function validateNigerianPhone(phone: string): { valid: boolean; message: string } {
  const cleaned = phone.replace(/[\s-]/g, "");
  if (!cleaned) return { valid: false, message: "Phone number is required" };
  const local = /^0[789]\d{9}$/;
  const intl  = /^\+234[789]\d{9}$/;
  if (local.test(cleaned) || intl.test(cleaned)) return { valid: true, message: "" };
  if (cleaned.startsWith("0") && cleaned.length !== 11)
    return { valid: false, message: `Must be 11 digits starting with 0 (you have ${cleaned.length})` };
  if (cleaned.startsWith("+234") && cleaned.length !== 13)
    return { valid: false, message: `Must be 13 characters starting with +234 (you have ${cleaned.length})` };
  if (!cleaned.match(/^(0|\+234)/))
    return { valid: false, message: "Must start with 0 or +234" };
  if (!cleaned.match(/^(0|\+234)[789]/))
    return { valid: false, message: "Network prefix must be 070, 080, or 090 series" };
  return { valid: false, message: "Invalid Nigerian phone number" };
}

type Tab = "login" | "signup";
type ServerStatus = "checking" | "online" | "offline" | "waking";

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  suffix?: React.ReactNode;
}

function Field({ label, icon, type = "text", value, onChange, placeholder, error, suffix }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-white/60 text-xs font-medium uppercase tracking-wider">{label}</label>
      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-colors ${
        error ? "border-red-500/60 bg-red-500/5" : "border-white/10 bg-white/5 focus-within:border-[#f59e0b]/40"
      }`}>
        <span className="text-white/30 flex-shrink-0">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder:text-white/20 text-sm outline-none"
        />
        {suffix}
      </div>
      {error && <p className="text-red-400 text-xs mt-0.5">{error}</p>}
    </div>
  );
}

// ── Health check helpers ───────────────────────────────────────
// Render free tier goes to sleep after 15 min of inactivity.
// Cold boot takes 30–90 seconds. We ping with retries and
// show a friendly "Server is waking up…" state instead of blocking.

const HEALTH_TIMEOUT_MS = 20_000;   // 20s per individual ping
const WAKE_POLL_INTERVAL = 6_000;   // poll every 6s while waking
const WAKE_MAX_ATTEMPTS  = 15;       // up to 90 seconds total wake time

async function pingHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`, {
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
    const data = await res.json();
    return data.status === "healthy";
  } catch {
    return false;
  }
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referredBy = searchParams.get("ref") || "";

  const [tab, setTab]               = useState<Tab>("login");
  const [phone, setPhone]           = useState("");
  const [fullName, setFullName]     = useState("");
  const [password, setPassword]     = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [showConf, setShowConf]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passError, setPassError]   = useState("");
  const [serverStatus, setServerStatus] = useState<ServerStatus>("checking");
  const [statusMsg, setStatusMsg]   = useState("Connecting to server…");

  // Track mount so we don't set state after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── Initial health check with retry ───────────────────────
  useEffect(() => {
    let cancelled = false;
    let retries = 0;
    const MAX_INITIAL_RETRIES = 3;

    const check = async () => {
      if (cancelled) return;
      const ok = await pingHealth();
      if (cancelled) return;
      if (ok) {
        setServerStatus("online");
        setStatusMsg("");
      } else {
        retries++;
        if (retries < MAX_INITIAL_RETRIES) {
          setStatusMsg(`Connecting… (attempt ${retries + 1}/${MAX_INITIAL_RETRIES})`);
          setTimeout(check, 8_000);
        } else {
          setServerStatus("offline");
          setStatusMsg("Server appears offline");
        }
      }
    };
    check();
    return () => { cancelled = true; };
  }, []);

  // ── Wake server (called when user hits submit while offline) ─
  const wakeServerAndPoll = async (): Promise<boolean> => {
    setServerStatus("waking");
    for (let attempt = 0; attempt < WAKE_MAX_ATTEMPTS; attempt++) {
      if (!mountedRef.current) return false;
      setStatusMsg(`Server is starting up… (${Math.round((attempt / WAKE_MAX_ATTEMPTS) * 100)}%)`);
      const ok = await pingHealth();
      if (ok) {
        if (mountedRef.current) {
          setServerStatus("online");
          setStatusMsg("");
        }
        return true;
      }
      await new Promise((r) => setTimeout(r, WAKE_POLL_INTERVAL));
    }
    if (mountedRef.current) {
      setServerStatus("offline");
      setStatusMsg("Server is taking too long to respond");
    }
    return false;
  };

  const clearErrors = () => { setError(""); setPhoneError(""); setPassError(""); };

  const handlePhoneChange = (v: string) => {
    setPhone(v);
    if (phoneError) setPhoneError(validateNigerianPhone(v).message);
  };

  // ── Submit with wake-up + one auto-retry ──────────────────
  const handleSubmit = async () => {
    clearErrors();

    const { valid, message } = validateNigerianPhone(phone);
    if (!valid) { setPhoneError(message); return; }
    if (password.length < 6) { setPassError("Password must be at least 6 characters"); return; }
    if (tab === "signup") {
      if (!fullName.trim()) { setError("Full name is required"); return; }
      if (password !== confirmPw) { setPassError("Passwords do not match"); return; }
    }

    // If server appears offline, try to wake it first (handles Render cold start)
    if (serverStatus === "offline" || serverStatus === "checking") {
      const alive = await wakeServerAndPoll();
      if (!alive) {
        setError("Server is not responding. Please try again in a minute.");
        return;
      }
    }

    setLoading(true);

    const attemptRequest = async (isRetry = false): Promise<void> => {
      try {
        const res = tab === "signup"
          ? await api.register(phone.trim(), fullName.trim(), password, referredBy || undefined)
          : await api.login(phone.trim(), password);
        localStorage.setItem("rr_token", res.token);
        localStorage.setItem("rr_user", JSON.stringify(res.user));
        navigate("/dashboard");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        const isFetchError = msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network") || msg.toLowerCase().includes("failed");

        // Auto-retry once on network failure (handles Render going cold between health check and submit)
        if (isFetchError && !isRetry) {
          setError("Connection interrupted — retrying…");
          const alive = await wakeServerAndPoll();
          if (alive) {
            return attemptRequest(true);
          }
          setError("Connection lost. Server took too long to respond. Please try again.");
          return;
        }

        if (msg.includes("already"))
          setError("This phone number is already registered. Try logging in.");
        else if (msg.includes("Invalid") || msg.includes("401") || msg.includes("incorrect"))
          setError("Incorrect phone number or password.");
        else if (msg.includes("users"))
          setError("Service setup incomplete. Please contact support.");
        else if (isFetchError)
          setError("Connection lost. Please check your internet and try again.");
        else
          setError(msg);
      }
    };

    try {
      await attemptRequest();
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  // ── Status indicator label ─────────────────────────────────
  const statusLabel = () => {
    if (serverStatus === "checking") return <span className="text-white/30 text-[11px]">connecting…</span>;
    if (serverStatus === "waking")   return <span className="text-yellow-400 text-[11px]">starting up…</span>;
    if (serverStatus === "online")   return <><Wifi size={13} className="text-green-400" /><span className="text-green-400 text-[11px]">online</span></>;
    return <><WifiOff size={13} className="text-red-400" /><span className="text-red-400 text-[11px]">offline</span></>;
  };

  const isSubmitDisabled = loading || serverStatus === "waking";
  const submitLabel = () => {
    if (loading)                   return <><Loader2 size={15} className="animate-spin" /> {tab === "login" ? "Logging in…" : "Creating account…"}</>;
    if (serverStatus === "waking") return <><Loader2 size={15} className="animate-spin" /> Starting server…</>;
    if (serverStatus === "checking") return "Connecting…";
    return tab === "login" ? "Log In" : "Create Account";
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(160deg, #02231c 0%, #004d40 50%, #02231c 100%)" }}
    >
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
      >
        <ArrowLeft size={16} /> Back to home
      </Link>

      <div
        className="w-full max-w-[400px]"
        style={{
          background: "rgba(2,35,28,0.7)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "36px 32px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            <span className="font-display text-white text-xl">RootRides Invest</span>
          </div>
          <div className="flex items-center gap-1.5">{statusLabel()}</div>
        </div>

        {/* Wake-up progress message */}
        {(serverStatus === "waking" || (serverStatus === "checking" && statusMsg)) && (
          <div className="mb-4 text-yellow-400/80 text-xs bg-yellow-400/5 border border-yellow-400/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <Loader2 size={12} className="animate-spin flex-shrink-0" />
            {statusMsg || "Connecting to server…"}
          </div>
        )}

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden border border-white/10 mb-8">
          {(["login", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); clearErrors(); }}
              className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${
                tab === t ? "bg-[#f59e0b] text-[#02231c]" : "text-white/50 hover:text-white/80"
              }`}
            >
              {t === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          {tab === "signup" && (
            <Field label="Full Name" icon={<User size={16} />}
              value={fullName} onChange={setFullName} placeholder="Chinedu Okafor" />
          )}

          <Field label="Phone Number" icon={<Phone size={16} />}
            value={phone} onChange={handlePhoneChange}
            placeholder="08012345678 or +2348012345678" error={phoneError} />

          <p className="text-white/25 text-[11px] -mt-2 pl-1">
            11 digits starting with 0 &nbsp;·&nbsp; 13 characters starting with +234
          </p>

          <Field label="Password" icon={<Lock size={16} />}
            type={showPass ? "text" : "password"}
            value={password} onChange={setPassword}
            placeholder="Min. 6 characters" error={passError}
            suffix={
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />

          {tab === "signup" && (
            <Field label="Confirm Password" icon={<Lock size={16} />}
              type={showConf ? "text" : "password"}
              value={confirmPw} onChange={setConfirmPw}
              placeholder="Repeat your password"
              suffix={
                <button type="button" onClick={() => setShowConf(!showConf)}
                  className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0">
                  {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
          )}

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="mt-2 w-full py-3.5 bg-[#f59e0b] text-[#02231c] font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {submitLabel()}
          </button>

          <p className="text-center text-white/30 text-xs pt-1">
            {tab === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setTab(tab === "login" ? "signup" : "login"); clearErrors(); }}
              className="text-[#f59e0b] hover:underline">
              {tab === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

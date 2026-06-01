import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, ArrowLeft, Phone, Lock, User, Wifi, WifiOff } from "lucide-react";
import { api } from "@/lib/api";

const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";

// ── Nigerian phone validation ──────────────────────────────────────────────────
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
type ServerStatus = "checking" | "online" | "offline";

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

export default function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab]                 = useState<Tab>("login");
  const [phone, setPhone]             = useState("");
  const [fullName, setFullName]       = useState("");
  const [password, setPassword]       = useState("");
  const [confirmPw, setConfirmPw]     = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [showConf, setShowConf]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [phoneError, setPhoneError]   = useState("");
  const [passError, setPassError]     = useState("");
  const [serverStatus, setServerStatus] = useState<ServerStatus>("checking");

  // ── Ping backend on mount ───────────────────────────────────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(8000) });
        const data = await res.json();
        setServerStatus(data.status === "healthy" ? "online" : "offline");
      } catch {
        setServerStatus("offline");
      }
    };
    check();
  }, []);

  const clearErrors = () => { setError(""); setPhoneError(""); setPassError(""); };

  const handlePhoneChange = (v: string) => {
    setPhone(v);
    if (phoneError) setPhoneError(validateNigerianPhone(v).message);
  };

  const handleSubmit = async () => {
    clearErrors();

    if (serverStatus === "offline") {
      setError("Cannot reach the server. Check your internet or try again shortly.");
      return;
    }

    const { valid, message } = validateNigerianPhone(phone);
    if (!valid) { setPhoneError(message); return; }
    if (password.length < 6) { setPassError("Password must be at least 6 characters"); return; }
    if (tab === "signup") {
      if (!fullName.trim()) { setError("Full name is required"); return; }
      if (password !== confirmPw) { setPassError("Passwords do not match"); return; }
    }

    setLoading(true);
    try {
      const res = tab === "signup"
        ? await api.register(phone.trim(), fullName.trim(), password)
        : await api.login(phone.trim(), password);

      localStorage.setItem("rr_token", res.token);
      localStorage.setItem("rr_user", JSON.stringify(res.user));
      navigate("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (msg.toLowerCase().includes("fetch"))
        setError("Connection lost. Please check your internet and try again.");
      else if (msg.includes("already"))
        setError("This phone number is already registered. Try logging in.");
      else if (msg.includes("Invalid") || msg.includes("401"))
        setError("Incorrect phone number or password.");
      else if (msg.includes("users"))
        setError("Service setup incomplete. Please contact support.");
      else
        setError(msg);
    } finally {
      setLoading(false);
    }
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
        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            <span className="font-display text-white text-xl">RootRides Invest</span>
          </div>
          {/* Server status indicator */}
          <div className="flex items-center gap-1.5">
            {serverStatus === "checking" && (
              <span className="text-white/30 text-[11px]">connecting…</span>
            )}
            {serverStatus === "online" && (
              <><Wifi size={13} className="text-green-400" /><span className="text-green-400 text-[11px]">online</span></>
            )}
            {serverStatus === "offline" && (
              <><WifiOff size={13} className="text-red-400" /><span className="text-red-400 text-[11px]">offline</span></>
            )}
          </div>
        </div>

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
            disabled={loading || serverStatus === "checking"}
            className="mt-2 w-full py-3.5 bg-[#f59e0b] text-[#02231c] font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
          >
            {loading
              ? (tab === "login" ? "Logging in…" : "Creating account…")
              : serverStatus === "checking" ? "Connecting…"
              : (tab === "login" ? "Log In" : "Create Account")}
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

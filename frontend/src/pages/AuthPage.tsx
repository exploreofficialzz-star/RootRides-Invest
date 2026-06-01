import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, ArrowLeft, Phone, Lock, User } from "lucide-react";
import { api } from "@/lib/api";

// ── Nigerian phone validation ──────────────────────────────────────────────────
// Local:  0[7|8|9]XXXXXXXXX  → 11 digits  (e.g. 08012345678)
// Intl:  +234[7|8|9]XXXXXXXXX → 13 chars  (e.g. +2348012345678)
function validateNigerianPhone(phone: string): { valid: boolean; message: string } {
  const cleaned = phone.replace(/[\s-]/g, "");
  const local = /^0[789]\d{9}$/;
  const intl  = /^\+234[789]\d{9}$/;

  if (!cleaned) return { valid: false, message: "Phone number is required" };
  if (local.test(cleaned) || intl.test(cleaned)) return { valid: true, message: "" };

  if (cleaned.startsWith("0") && cleaned.length !== 11)
    return { valid: false, message: "Numbers starting with 0 must be 11 digits" };
  if (cleaned.startsWith("+234") && cleaned.length !== 13)
    return { valid: false, message: "Numbers starting with +234 must be 13 characters" };
  if (!cleaned.match(/^(0|\+234)/))
    return { valid: false, message: "Must start with 0 or +234" };
  if (!cleaned.match(/^(0|\+234)[789]/))
    return { valid: false, message: "Network prefix must be 070, 080, or 090 series" };

  return { valid: false, message: "Invalid Nigerian phone number" };
}

type Tab = "login" | "signup";

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
  const [tab, setTab]                   = useState<Tab>("login");
  const [phone, setPhone]               = useState("");
  const [fullName, setFullName]         = useState("");
  const [password, setPassword]         = useState("");
  const [confirmPassword, setConfirm]   = useState("");
  const [showPass, setShowPass]         = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [phoneError, setPhoneError]     = useState("");
  const [passError, setPassError]       = useState("");

  const clearErrors = () => { setError(""); setPhoneError(""); setPassError(""); };

  const handlePhoneChange = (v: string) => {
    setPhone(v);
    if (phoneError) {
      const { message } = validateNigerianPhone(v);
      setPhoneError(message);
    }
  };

  const handleSubmit = async () => {
    clearErrors();

    // Phone validation
    const { valid, message } = validateNigerianPhone(phone);
    if (!valid) { setPhoneError(message); return; }

    // Password validation
    if (password.length < 6) { setPassError("Password must be at least 6 characters"); return; }

    if (tab === "signup") {
      if (!fullName.trim()) { setError("Full name is required"); return; }
      if (password !== confirmPassword) { setPassError("Passwords do not match"); return; }
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
      if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("networkerror")) {
        setError("Server is waking up — please wait 30 seconds and try again.");
      } else if (msg.includes("already")) {
        setError("This phone number is already registered. Try logging in.");
      } else if (msg.includes("Invalid") || msg.includes("401")) {
        setError("Incorrect phone number or password.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(160deg, #02231c 0%, #004d40 50%, #02231c 100%)" }}
    >
      {/* Back to home */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Back to home
      </Link>

      {/* Card */}
      <div
        className="w-full max-w-[400px]"
        style={{
          background: "rgba(2, 35, 28, 0.7)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "36px 32px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
          <span className="font-display text-white text-xl">RootRides Invest</span>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden border border-white/10 mb-8">
          {(["login", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); clearErrors(); }}
              className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${
                tab === t
                  ? "bg-[#f59e0b] text-[#02231c]"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {t === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          {tab === "signup" && (
            <Field
              label="Full Name"
              icon={<User size={16} />}
              value={fullName}
              onChange={setFullName}
              placeholder="Chinedu Okafor"
            />
          )}

          <Field
            label="Phone Number"
            icon={<Phone size={16} />}
            value={phone}
            onChange={handlePhoneChange}
            placeholder="08012345678 or +2348012345678"
            error={phoneError}
          />

          <div className="text-white/30 text-[11px] -mt-2 pl-1">
            11 digits starting with 0 &nbsp;·&nbsp; 13 characters starting with +234
          </div>

          <Field
            label="Password"
            icon={<Lock size={16} />}
            type={showPass ? "text" : "password"}
            value={password}
            onChange={setPassword}
            placeholder="Min. 6 characters"
            error={passError}
            suffix={
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />

          {tab === "signup" && (
            <Field
              label="Confirm Password"
              icon={<Lock size={16} />}
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={setConfirm}
              placeholder="Repeat your password"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
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
            disabled={loading}
            className="mt-2 w-full py-3.5 bg-[#f59e0b] text-[#02231c] font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
          >
            {loading
              ? (tab === "login" ? "Logging in..." : "Creating account...")
              : (tab === "login" ? "Log In" : "Create Account")}
          </button>

          <p className="text-center text-white/30 text-xs pt-1">
            {tab === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setTab(tab === "login" ? "signup" : "login"); clearErrors(); }}
              className="text-[#f59e0b] hover:underline"
            >
              {tab === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

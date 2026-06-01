// ─────────────────────────────────────────────────────────────────────────────
// RootRides Invest — API Client
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Plan {
  id: string;
  name: string;
  amount_naira: number;
  daily_return_naira: number;
  image_path: string;
  gradient: string;
  is_dark: boolean;
  grid_span: string;
  display_order: number;
}

export interface PlatformStats {
  total_invested: number;
  active_users: number;
  uptime_percent: number;
  support_label: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  plan_label: string;
  display_order: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  display_order: number;
}

export interface WaitlistResponse {
  message: "success" | "already_registered";
  email: string;
}

export interface AuthUser {
  id: string;
  phone: string;
  full_name: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `API ${res.status}: ${path}`);
  return data as T;
}

// ── API surface ───────────────────────────────────────────────────────────────

export const api = {
  // Public data
  getPlans:        ()                                      => get<Plan[]>("/api/plans"),
  getStats:        ()                                      => get<PlatformStats>("/api/stats"),
  getTestimonials: ()                                      => get<Testimonial[]>("/api/testimonials"),
  getFaq:          ()                                      => get<FaqItem[]>("/api/faq"),
  joinWaitlist:    (email: string, referral?: string)      =>
    post<WaitlistResponse>("/api/waitlist", { email, referral_code: referral ?? null }),

  // Auth
  register: (phone: string, full_name: string, password: string) =>
    post<AuthResponse>("/api/auth/register", { phone, full_name, password }),
  login: (phone: string, password: string) =>
    post<AuthResponse>("/api/auth/login", { phone, password }),
};

// ── Auth helpers ──────────────────────────────────────────────────────────────

export const auth = {
  getUser: (): AuthUser | null => {
    try {
      const raw = localStorage.getItem("rr_user");
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch { return null; }
  },
  getToken: () => localStorage.getItem("rr_token"),
  logout: () => {
    localStorage.removeItem("rr_token");
    localStorage.removeItem("rr_user");
  },
  isLoggedIn: () => !!localStorage.getItem("rr_token"),
};

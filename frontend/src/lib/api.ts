// ─────────────────────────────────────────────────────────────────────────────
// RootRides Invest — API Client
// All backend calls go through this file.
// Set VITE_API_URL in .env.local (dev) and Vercel env vars (prod).
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
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// ── API surface ───────────────────────────────────────────────────────────────

export const api = {
  getPlans:        ()                              => get<Plan[]>("/api/plans"),
  getStats:        ()                              => get<PlatformStats>("/api/stats"),
  getTestimonials: ()                              => get<Testimonial[]>("/api/testimonials"),
  getFaq:          ()                              => get<FaqItem[]>("/api/faq"),
  joinWaitlist:    (email: string, referral?: string) =>
    post<WaitlistResponse>("/api/waitlist", { email, referral_code: referral ?? null }),
};

const BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";

export interface Plan { id: string; name: string; amount_naira: number; daily_return_naira: number; image_path: string; gradient: string; is_dark: boolean; grid_span: string; display_order: number; }
export interface PlatformStats { total_invested: number; active_users: number; uptime_percent: number; support_label: string; }
export interface Testimonial { id: string; quote: string; name: string; plan_label: string; display_order: number; }
export interface FaqItem { id: string; question: string; answer: string; display_order: number; }
export interface WaitlistResponse { message: "success" | "already_registered"; email: string; }
export interface AuthUser { id: string; phone: string; full_name: string; }
export interface AuthResponse { token: string; user: AuthUser; }
export interface UserStats { total_invested: number; total_earned: number; today_potential: number; has_investments: boolean; referral_code: string | null; referral_earnings: number; }
export interface Investment { id: string; user_id: string; plan_id: string; plan_name: string; amount_naira: number; daily_return_naira: number; is_active: boolean; started_at: string; }
export interface PaymentVerifyPayload { transaction_id: number; tx_ref: string; plan_id: string; plan_name: string; amount_naira: number; daily_return_naira: number; }

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}
async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `API ${res.status}`);
  return data;
}
function authHeaders() { return { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("rr_token") || ""}` }; }
async function authGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `API ${res.status}`);
  return data;
}
async function authPost<T>(path: string, body: unknown = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `API ${res.status}`);
  return data;
}

export const api = {
  getPlans:           ()                                                     => get<Plan[]>("/api/plans"),
  getStats:           ()                                                     => get<PlatformStats>("/api/stats"),
  getTestimonials:    ()                                                     => get<Testimonial[]>("/api/testimonials"),
  getFaq:             ()                                                     => get<FaqItem[]>("/api/faq"),
  joinWaitlist:       (email: string, referral?: string)                     => post<WaitlistResponse>("/api/waitlist", { email, referral_code: referral ?? null }),
  register: (phone: string, full_name: string, password: string, referred_by?: string) => post<AuthResponse>("/api/auth/register", { phone, full_name, password, referred_by: referred_by || null }),
  login:              (phone: string, password: string)                      => post<AuthResponse>("/api/auth/login", { phone, password }),
  getUserStats:       ()                                                     => authGet<UserStats>("/api/user/stats"),
  getUserInvestments: ()                                                     => authGet<Investment[]>("/api/user/investments"),
  getTodayClaims:     ()                                                     => authGet<string[]>("/api/claims/today"),
  claimDailyProfit:   (investment_id: string)                               => authPost(`/api/claims/${investment_id}`),
  verifyPayment:      (payload: PaymentVerifyPayload)                       => authPost<{ message: string }>("/api/payments/verify", payload),
};

export const auth = {
  getUser:    (): AuthUser | null => { try { const r = localStorage.getItem("rr_user"); return r ? JSON.parse(r) : null; } catch { return null; } },
  getToken:   () => localStorage.getItem("rr_token"),
  logout:     () => { localStorage.removeItem("rr_token"); localStorage.removeItem("rr_user"); },
  isLoggedIn: () => !!localStorage.getItem("rr_token"),
};

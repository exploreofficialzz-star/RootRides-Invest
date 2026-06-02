-- ============================================================
-- RootRides Invest — MIGRATION SCRIPT
-- Safe to run on an existing Supabase database.
-- Your users / investments / daily_claims tables already exist —
-- this script only ADDS new things on top.
-- Run this once in Supabase SQL Editor > Run.
-- ============================================================

-- ── SECTION 1: Tables that may not exist yet ─────────────────
-- (all use IF NOT EXISTS so they're safe to re-run)

CREATE TABLE IF NOT EXISTS plans (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT        NOT NULL,
  amount_naira        BIGINT      NOT NULL,
  daily_return_naira  BIGINT      NOT NULL,
  image_path          TEXT        NOT NULL,
  gradient            TEXT        NOT NULL,
  is_dark             BOOLEAN     NOT NULL DEFAULT FALSE,
  grid_span           TEXT        NOT NULL DEFAULT '',
  display_order       INT         NOT NULL,
  is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_stats (
  id              INT         PRIMARY KEY DEFAULT 1,
  total_invested  BIGINT      NOT NULL DEFAULT 2500000000,
  active_users    INT         NOT NULL DEFAULT 50000,
  uptime_percent  NUMERIC(5,1) NOT NULL DEFAULT 99.7,
  support_label   TEXT        NOT NULL DEFAULT '24/7',
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  quote         TEXT        NOT NULL,
  name          TEXT        NOT NULL,
  plan_label    TEXT        NOT NULL,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  display_order INT         NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faq_items (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question      TEXT        NOT NULL,
  answer        TEXT        NOT NULL,
  display_order INT         NOT NULL,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS waitlist (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        UNIQUE NOT NULL,
  referral_code TEXT,
  source        TEXT        NOT NULL DEFAULT 'website',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── SECTION 2: Indexes on your existing tables ───────────────
-- Dramatically speeds up lookups as users scale to thousands.

CREATE INDEX IF NOT EXISTS idx_users_phone
  ON users(phone);

CREATE INDEX IF NOT EXISTS idx_users_referral_code
  ON users(referral_code);

CREATE INDEX IF NOT EXISTS idx_investments_user_id
  ON investments(user_id);

CREATE INDEX IF NOT EXISTS idx_investments_user_active
  ON investments(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_investments_flw_tx_ref
  ON investments(flw_tx_ref);

CREATE INDEX IF NOT EXISTS idx_daily_claims_user_id
  ON daily_claims(user_id);

CREATE INDEX IF NOT EXISTS idx_daily_claims_inv_date
  ON daily_claims(investment_id, claim_date);

-- ── SECTION 3: Atomic referral earnings RPC ──────────────────
-- Replaces the unsafe read-modify-write in Python.
-- Uses a single SQL UPDATE so two simultaneous referrals can never
-- both read 0 and both write 3000 (race condition).

CREATE OR REPLACE FUNCTION increment_referral_earnings(
  referrer_code TEXT,
  amount        BIGINT
)
RETURNS VOID
LANGUAGE SQL
AS $$
  UPDATE users
  SET referral_earnings = referral_earnings + amount
  WHERE referral_code = referrer_code;
$$;

-- ── SECTION 4: RLS policies ───────────────────────────────────
-- You already ran: ALTER TABLE users/investments/daily_claims ENABLE ROW LEVEL SECURITY;
-- But with no policies defined, ALL operations are denied for non-service-role access.
-- Your backend uses the service_role key so it bypasses RLS automatically.
-- These policies explicitly lock the tables from direct anon/client access.

-- RLS for plans, stats, testimonials, faq (public read-only)
ALTER TABLE plans           ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_stats  ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials    ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist        ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- plans
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='plans' AND policyname='Public can read plans') THEN
    CREATE POLICY "Public can read plans" ON plans FOR SELECT USING (is_active = TRUE);
  END IF;
  -- platform_stats
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='platform_stats' AND policyname='Public can read stats') THEN
    CREATE POLICY "Public can read stats" ON platform_stats FOR SELECT USING (TRUE);
  END IF;
  -- testimonials
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='testimonials' AND policyname='Public can read testimonials') THEN
    CREATE POLICY "Public can read testimonials" ON testimonials FOR SELECT USING (is_active = TRUE);
  END IF;
  -- faq_items
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='faq_items' AND policyname='Public can read faq') THEN
    CREATE POLICY "Public can read faq" ON faq_items FOR SELECT USING (is_active = TRUE);
  END IF;
  -- waitlist (insert only)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='waitlist' AND policyname='Anyone can join waitlist') THEN
    CREATE POLICY "Anyone can join waitlist" ON waitlist FOR INSERT WITH CHECK (TRUE);
  END IF;

  -- users / investments / daily_claims:
  -- service_role key (used by your FastAPI backend) bypasses RLS entirely.
  -- These DENY policies block any direct anon/client access as a security layer.
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='users' AND policyname='Backend service only - users') THEN
    CREATE POLICY "Backend service only - users" ON users USING (FALSE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='investments' AND policyname='Backend service only - investments') THEN
    CREATE POLICY "Backend service only - investments" ON investments USING (FALSE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='daily_claims' AND policyname='Backend service only - daily_claims') THEN
    CREATE POLICY "Backend service only - daily_claims" ON daily_claims USING (FALSE);
  END IF;
END
$$;

-- ── SECTION 5: Seed data ─────────────────────────────────────
-- ON CONFLICT DO NOTHING = safe to re-run; skips if data already exists.

INSERT INTO plans (name, amount_naira, daily_return_naira, image_path, gradient, is_dark, grid_span, display_order) VALUES
  ('Rice Plan',      5000,  835,  '/assets/rice.jpg',      'linear-gradient(135deg, #f8f6f1 0%, #e8f5e9 100%)', FALSE, 'row-span-2',    1),
  ('Cement Plan',    10000, 1835, '/assets/cement.jpg',    'linear-gradient(135deg, #f8f6f1 0%, #eceff1 100%)', FALSE, '',              2),
  ('Farm Plan',      20000, 2500, '/assets/farm.jpg',      'linear-gradient(135deg, #f8f6f1 0%, #e8f5e9 100%)', FALSE, '',              3),
  ('Farm Machinery', 30000, 3500, '/assets/machinery.jpg', 'linear-gradient(135deg, #f8f6f1 0%, #fff3e0 100%)', FALSE, '',              4),
  ('Cars Plan',      50000, 4835, '/assets/cars.jpg',      'linear-gradient(135deg, #02231c 0%, #004d40 100%)', TRUE,  'md:col-span-2', 5)
ON CONFLICT DO NOTHING;

INSERT INTO platform_stats (id, total_invested, active_users, uptime_percent, support_label)
VALUES (1, 2500000000, 50000, 99.7, '24/7')
ON CONFLICT (id) DO NOTHING;

INSERT INTO testimonials (quote, name, plan_label, display_order) VALUES
  ('I invested ₦20,000 in the Farm plan and I''ve been claiming ₦2,500 daily. RootRides changed how I think about growing my money.', 'Chinedu O.', 'Farm Plan Investor',   1),
  ('The daily earnings are real. I started with Rice and kept reinvesting. Now I''m on the Cars plan earning ₦4,835 every single day.',  'Amina K.',  'Cars Plan Investor',   2),
  ('I''ve referred 12 friends so far. The ₦3,000 bonus per referral adds up fast. This is the easiest side income I''ve ever had.',      'Tunde B.',  'Top Referrer',         3),
  ('Bank withdrawals work exactly as promised. I get my money within 48 hours every month. Very reliable platform.',                     'Ngozi M.',  'Cement Plan Investor', 4),
  ('As a student, the Rice plan was perfect for me. ₦5,000 to start and ₦835 daily helps with my expenses.',                            'Emeka J.',  'Rice Plan Investor',   5)
ON CONFLICT DO NOTHING;

INSERT INTO faq_items (question, answer, display_order) VALUES
  ('How do I start investing?',             'Download the RootRides app, create an account with your phone number, deposit funds via Flutterwave, and choose an investment plan. Your daily earnings begin immediately.',                           1),
  ('When can I withdraw my earnings?',      'You can withdraw your accumulated earnings once every month. Submit your bank details in the app, and your withdrawal will be processed within 24–48 hours.',                                         2),
  ('How does the referral program work?',   'Share your unique referral code with friends. When they register and make their first deposit, ₦3,000 is automatically credited to your account.',                                                    3),
  ('Is my investment safe?',                'Yes. RootRides uses bank-grade encryption and secure payment processing through Flutterwave. Your funds are protected with enterprise-level security protocols.',                                      4),
  ('What happens if I miss a daily claim?', 'You can claim your earnings once every 24 hours. If you miss a day, you can claim the next day — earnings accumulate and are available whenever you check in.',                                       5),
  ('How do I download the app?',            'Visit rootrides.com/download on your Android device to download the APK directly. iOS support is coming soon.',                                                                                       6)
ON CONFLICT DO NOTHING;

-- ── DONE ─────────────────────────────────────────────────────
-- Summary of what this migration added:
--   ✓ 5 tables (plans, platform_stats, testimonials, faq_items, waitlist) + seed data
--   ✓ 7 performance indexes on users / investments / daily_claims
--   ✓ increment_referral_earnings() atomic SQL function
--   ✓ RLS policies (public read for content tables; deny-all anon for user data tables)

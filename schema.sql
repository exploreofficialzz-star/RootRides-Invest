-- ============================================================
-- RootRides Invest — Supabase Schema
-- Run this in your Supabase SQL Editor (Project > SQL Editor)
-- ============================================================

-- 1. Investment Plans
CREATE TABLE IF NOT EXISTS plans (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  amount_naira    BIGINT      NOT NULL,
  daily_return_naira BIGINT   NOT NULL,
  image_path      TEXT        NOT NULL,
  gradient        TEXT        NOT NULL,
  is_dark         BOOLEAN     NOT NULL DEFAULT FALSE,
  grid_span       TEXT        NOT NULL DEFAULT '',
  display_order   INT         NOT NULL,
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Platform Stats (single always-present row, id = 1)
CREATE TABLE IF NOT EXISTS platform_stats (
  id              INT         PRIMARY KEY DEFAULT 1,
  total_invested  BIGINT      NOT NULL DEFAULT 2500000000,
  active_users    INT         NOT NULL DEFAULT 50000,
  uptime_percent  NUMERIC(5,1) NOT NULL DEFAULT 99.7,
  support_label   TEXT        NOT NULL DEFAULT '24/7',
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  quote           TEXT        NOT NULL,
  name            TEXT        NOT NULL,
  plan_label      TEXT        NOT NULL,
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  display_order   INT         NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. FAQ Items
CREATE TABLE IF NOT EXISTS faq_items (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question        TEXT        NOT NULL,
  answer          TEXT        NOT NULL,
  display_order   INT         NOT NULL,
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Waitlist / Email Captures
CREATE TABLE IF NOT EXISTS waitlist (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT        UNIQUE NOT NULL,
  referral_code   TEXT,
  source          TEXT        NOT NULL DEFAULT 'website',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Investment Plans
INSERT INTO plans (name, amount_naira, daily_return_naira, image_path, gradient, is_dark, grid_span, display_order) VALUES
  ('Rice Plan',      5000,  835,  '/assets/rice.jpg',      'linear-gradient(135deg, #f8f6f1 0%, #e8f5e9 100%)', FALSE, 'row-span-2',    1),
  ('Cement Plan',    10000, 1835, '/assets/cement.jpg',    'linear-gradient(135deg, #f8f6f1 0%, #eceff1 100%)', FALSE, '',              2),
  ('Farm Plan',      20000, 2500, '/assets/farm.jpg',      'linear-gradient(135deg, #f8f6f1 0%, #e8f5e9 100%)', FALSE, '',              3),
  ('Farm Machinery', 30000, 3500, '/assets/machinery.jpg', 'linear-gradient(135deg, #f8f6f1 0%, #fff3e0 100%)', FALSE, '',              4),
  ('Cars Plan',      50000, 4835, '/assets/cars.jpg',      'linear-gradient(135deg, #02231c 0%, #004d40 100%)', TRUE,  'md:col-span-2', 5)
ON CONFLICT DO NOTHING;

-- Platform Stats
INSERT INTO platform_stats (id, total_invested, active_users, uptime_percent, support_label)
VALUES (1, 2500000000, 50000, 99.7, '24/7')
ON CONFLICT (id) DO NOTHING;

-- Testimonials
INSERT INTO testimonials (quote, name, plan_label, display_order) VALUES
  ('I invested ₦20,000 in the Farm plan and I''ve been claiming ₦2,500 daily. RootRides changed how I think about growing my money.', 'Chinedu O.', 'Farm Plan Investor',    1),
  ('The daily earnings are real. I started with Rice and kept reinvesting. Now I''m on the Cars plan earning ₦4,835 every single day.',  'Amina K.',   'Cars Plan Investor',    2),
  ('I''ve referred 12 friends so far. The ₦3,000 bonus per referral adds up fast. This is the easiest side income I''ve ever had.',      'Tunde B.',   'Top Referrer',          3),
  ('Bank withdrawals work exactly as promised. I get my money within 48 hours every month. Very reliable platform.',                     'Ngozi M.',   'Cement Plan Investor',  4),
  ('As a student, the Rice plan was perfect for me. ₦5,000 to start and ₦835 daily helps with my expenses.',                            'Emeka J.',   'Rice Plan Investor',    5)
ON CONFLICT DO NOTHING;

-- FAQ Items
INSERT INTO faq_items (question, answer, display_order) VALUES
  ('How do I start investing?',        'Download the RootRides app, create an account with your phone number, deposit funds via Flutterwave, and choose an investment plan. Your daily earnings begin immediately.',                                                                    1),
  ('When can I withdraw my earnings?', 'You can withdraw your accumulated earnings once every month. Submit your bank details in the app, and your withdrawal will be processed within 24–48 hours.',                                                                                  2),
  ('How does the referral program work?', 'Share your unique referral code with friends. When they register and make their first deposit, ₦3,000 is automatically credited to your account.',                                                                                          3),
  ('Is my investment safe?',           'Yes. RootRides uses bank-grade encryption and secure payment processing through Flutterwave. Your funds are protected with enterprise-level security protocols.',                                                                              4),
  ('What happens if I miss a daily claim?', 'You can claim your earnings once every 24 hours. If you miss a day, you can claim the next day — earnings accumulate and are available whenever you check in.',                                                                           5),
  ('How do I download the app?',       'Visit rootrides.com/download on your Android device to download the APK directly. iOS support is coming soon.',                                                                                                                               6)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE plans           ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_stats  ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials     ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist         ENABLE ROW LEVEL SECURITY;

-- Public read-only policies (plans, stats, testimonials, faq)
CREATE POLICY "Public can read plans"          ON plans           FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can read stats"          ON platform_stats  FOR SELECT USING (TRUE);
CREATE POLICY "Public can read testimonials"   ON testimonials    FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can read faq"            ON faq_items       FOR SELECT USING (is_active = TRUE);

-- Waitlist: insert only (no read for anonymous users)
CREATE POLICY "Anyone can join waitlist"       ON waitlist        FOR INSERT WITH CHECK (TRUE);

import { useEffect, useState } from "react";
import { useCountUp } from "@/hooks/useCountUp";
import { api, type PlatformStats } from "@/lib/api";

// ── Fallback while loading ──────────────────────────────────────────────────
const DEFAULT_STATS: PlatformStats = {
  total_invested: 2500000000,
  active_users: 50000,
  uptime_percent: 99.7,
  support_label: "24/7",
};

function StatItem({
  target,
  prefix,
  suffix,
  label,
}: {
  target: number;
  prefix: string;
  suffix: string;
  label: string;
}) {
  const { ref, display } = useCountUp(target, 1500, prefix, suffix);

  return (
    <div className="text-center" ref={ref}>
      <div className="text-h3 shimmer-gold mb-2">{display}</div>
      <div className="text-xs font-body font-medium uppercase tracking-[0.08em] text-[#4a635e]">
        {label}
      </div>
    </div>
  );
}

export default function StatsBar() {
  const [stats, setStats] = useState<PlatformStats>(DEFAULT_STATS);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {/* keep defaults */});
  }, []);

  const items = [
    { target: stats.total_invested,   prefix: "₦", suffix: "+", label: "Invested" },
    { target: stats.active_users,     prefix: "",  suffix: "+", label: "Active Users" },
    { target: stats.uptime_percent,   prefix: "",  suffix: "%", label: "Uptime" },
    { target: 24,                      prefix: "",  suffix: "/7", label: "Support" },
  ];

  return (
    <section className="w-full bg-paper py-10" data-section-bg="light">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((s, i) => (
            <StatItem
              key={i}
              target={s.target}
              prefix={s.prefix}
              suffix={s.suffix}
              label={s.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

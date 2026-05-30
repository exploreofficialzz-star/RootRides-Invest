import { useCountUp } from "@/hooks/useCountUp";

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
  const stats = [
    { target: 2500000000, prefix: "\u20A6", suffix: "+", label: "Invested" },
    { target: 50000, prefix: "", suffix: "+", label: "Active Users" },
    { target: 99.7, prefix: "", suffix: "%", label: "Uptime" },
    { target: 24, prefix: "", suffix: "/7", label: "Support" },
  ];

  return (
    <section className="w-full bg-paper py-10" data-section-bg="light">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
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

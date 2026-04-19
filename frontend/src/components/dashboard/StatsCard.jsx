import { useEffect, useState } from "react";

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  suffix = "",
  delay = 0
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    let frameId;
    const startedAt = performance.now();
    const duration = 900;

    const tick = (timestamp) => {
      const progress = Math.min((timestamp - startedAt) / duration, 1);
      setDisplayValue(Math.round(target * progress));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return (
    <article
      className="glass-panel animate-slide-up rounded-[24px] p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-text-muted">{title}</p>
          <h3 className="mt-3 text-3xl font-semibold text-text-primary">
            {displayValue.toLocaleString()}
            {suffix}
          </h3>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <p className="mt-4 text-xs text-text-muted">
        {typeof trend === "number"
          ? `${trend >= 0 ? "↑" : "↓"} ${Math.abs(trend)}% vs last week`
          : "No weekly comparison yet"}
      </p>
    </article>
  );
}


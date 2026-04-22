import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { cn } from "../../lib/utils";

export interface StatTileProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  format?: "number" | "currency" | "percent";
  delta?: {
    value: string;
    direction: "up" | "down" | "flat";
    positive?: boolean;
  };
  sparkline?: number[];
  className?: string;
  footer?: ReactNode;
}

function formatDisplay(
  value: number,
  format: StatTileProps["format"],
  prefix?: string,
  suffix?: string
): string {
  let body: string;
  if (format === "currency") {
    body = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(value));
  } else if (format === "percent") {
    body = `${(value * 100).toFixed(1)}%`;
  } else {
    body = new Intl.NumberFormat("en-US").format(Math.round(value));
  }
  return `${prefix ?? ""}${body}${suffix ?? ""}`;
}

export function StatTile({
  label,
  value,
  prefix,
  suffix,
  format = "number",
  delta,
  sparkline,
  className,
  footer,
}: StatTileProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    const from = 0;
    const to = value;
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  const sparkData = (sparkline ?? []).map((v, i) => ({ i, v }));

  const deltaColor =
    delta?.positive === true
      ? "text-vault-forest"
      : delta?.direction === "up"
      ? "text-vault-forest"
      : delta?.direction === "down"
      ? "text-vault-oxblood"
      : "text-vault-graphite";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "flex items-start justify-between gap-6 bg-vault-paper border border-vault-hairline rounded-[6px] p-8 transition-colors duration-500 ease-vault hover:border-vault-hairline-deep",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="label-eyebrow">{label}</p>
        <p className="mt-5 font-display font-light text-5xl num-mono text-vault-ink leading-none tracking-tighter-alt">
          {formatDisplay(display, format, prefix, suffix)}
        </p>
        {delta ? (
          <p className={cn("mt-4 label-eyebrow-strong", deltaColor)}>
            {delta.direction === "up"
              ? "↑"
              : delta.direction === "down"
              ? "↓"
              : "·"}{" "}
            {delta.value}
          </p>
        ) : null}
        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
      {sparkline && sparkline.length > 1 ? (
        <div className="w-24 h-12 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke="#1A3D2E"
                strokeWidth={1.2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </motion.div>
  );
}

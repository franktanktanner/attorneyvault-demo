import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

const START_SECONDS = 10 * 60;

function format(seconds: number): string {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const s = (safe % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export interface SessionTimerProps {
  className?: string;
}

export function SessionTimer({ className }: SessionTimerProps) {
  const [seconds, setSeconds] = useState(START_SECONDS);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const colorClass =
    seconds <= 30
      ? "text-vault-oxblood"
      : seconds <= 120
      ? "text-vault-gold"
      : "text-vault-ink";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 label-eyebrow-strong num-mono",
        colorClass,
        className
      )}
    >
      <span className="text-vault-graphite">SESSION</span>
      <span>{format(seconds)}</span>
    </span>
  );
}

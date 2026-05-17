import { cn } from "../../lib/utils";
import { useVaultSessionContext } from "../../contexts/VaultSessionContext";

export interface SessionTimerProps {
  className?: string;
}

export function SessionTimer({ className }: SessionTimerProps) {
  const { remainingSeconds, formatted } = useVaultSessionContext();

  const colorClass =
    remainingSeconds <= 30
      ? "text-vault-oxblood"
      : remainingSeconds <= 120
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
      <span>{formatted}</span>
    </span>
  );
}

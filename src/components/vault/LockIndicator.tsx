import { Lock, Unlock, ShieldAlert } from "lucide-react";
import { cn } from "../../lib/utils";
import { VaultPulse } from "./VaultPulse";

export type LockState = "unlocked" | "warning" | "locked";

export interface LockIndicatorProps {
  state?: LockState;
  className?: string;
}

const copy: Record<LockState, string> = {
  unlocked: "VAULT UNLOCKED",
  warning: "SESSION WARNING",
  locked: "VAULT LOCKED",
};

const textColor: Record<LockState, string> = {
  unlocked: "text-vault-forest",
  warning: "text-vault-gold",
  locked: "text-vault-oxblood",
};

export function LockIndicator({
  state = "unlocked",
  className,
}: LockIndicatorProps) {
  const Icon =
    state === "unlocked" ? Unlock : state === "warning" ? ShieldAlert : Lock;
  const pulseColor =
    state === "unlocked" ? "forest" : state === "warning" ? "gold" : "oxblood";

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <Icon
        size={14}
        strokeWidth={1.6}
        className={cn(textColor[state])}
      />
      <VaultPulse color={pulseColor} />
      <span className={cn("label-eyebrow-strong", textColor[state])}>
        {copy[state]}
      </span>
    </div>
  );
}

import { cn } from "../../lib/utils";

export interface VaultPulseProps {
  color?: "forest" | "gold" | "oxblood";
  className?: string;
}

const colorClasses: Record<NonNullable<VaultPulseProps["color"]>, string> = {
  forest: "bg-vault-forest",
  gold: "bg-vault-gold",
  oxblood: "bg-vault-oxblood",
};

export function VaultPulse({ color = "forest", className }: VaultPulseProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-1.5 w-1.5 rounded-full vault-pulse",
        colorClasses[color],
        className
      )}
    />
  );
}

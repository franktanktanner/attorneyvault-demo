import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type BadgeVariant = "neutral" | "forest" | "gold" | "oxblood" | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-vault-hairline text-vault-graphite",
  forest: "bg-vault-forest text-vault-paper",
  gold: "bg-vault-gold text-vault-paper",
  oxblood: "bg-vault-oxblood text-vault-paper",
  outline:
    "bg-transparent border border-vault-hairline text-vault-graphite",
};

export function Badge({
  variant = "neutral",
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-1 rounded-full font-sans text-[10px] uppercase tracking-wider-alt font-semibold",
        variantClasses[variant],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

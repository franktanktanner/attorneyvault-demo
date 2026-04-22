import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type DividerTone = "default" | "gold" | "oxblood";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  tone?: DividerTone;
}

const lineClasses: Record<DividerTone, string> = {
  default: "bg-vault-hairline",
  gold: "bg-vault-gold/40",
  oxblood: "bg-vault-oxblood/30",
};

const labelClasses: Record<DividerTone, string> = {
  default: "text-vault-ink",
  gold: "text-vault-gold",
  oxblood: "text-vault-oxblood",
};

export function Divider({
  label,
  tone = "default",
  className,
  ...rest
}: DividerProps) {
  if (!label) {
    return (
      <div
        className={cn("h-px w-full", lineClasses[tone], className)}
        {...rest}
      />
    );
  }
  return (
    <div
      className={cn("flex items-center gap-6 w-full", className)}
      {...rest}
    >
      <span className={cn("flex-1 h-px", lineClasses[tone])} />
      <span
        className={cn(
          "font-sans text-[10px] uppercase tracking-wider-alt font-semibold whitespace-nowrap",
          labelClasses[tone]
        )}
      >
        {label}
      </span>
      <span className={cn("flex-1 h-px", lineClasses[tone])} />
    </div>
  );
}

import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export function Divider({ label, className, ...rest }: DividerProps) {
  if (!label) {
    return (
      <div
        className={cn("h-px w-full bg-vault-hairline", className)}
        {...rest}
      />
    );
  }
  return (
    <div
      className={cn("flex items-center gap-6 w-full", className)}
      {...rest}
    >
      <span className="flex-1 h-px bg-vault-hairline" />
      <span className="label-eyebrow-strong whitespace-nowrap">{label}</span>
      <span className="flex-1 h-px bg-vault-hairline" />
    </div>
  );
}

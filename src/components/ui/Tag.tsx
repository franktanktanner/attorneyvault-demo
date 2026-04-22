import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "default" | "forest" | "gold" | "oxblood";
}

const toneClasses: Record<NonNullable<TagProps["tone"]>, string> = {
  default: "border-vault-hairline text-vault-graphite",
  forest: "border-vault-forest text-vault-forest",
  gold: "border-vault-gold text-vault-gold",
  oxblood: "border-vault-oxblood text-vault-oxblood",
};

export function Tag({
  tone = "default",
  className,
  children,
  ...rest
}: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-[3px] border rounded-[2px] font-sans text-[9px] uppercase tracking-wider-alt font-semibold",
        toneClasses[tone],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "destructive" | "gold";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconTrailing?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-vault-ink text-vault-paper hover:bg-vault-forest",
  secondary:
    "bg-transparent border border-vault-ink text-vault-ink hover:bg-vault-ink hover:text-vault-paper",
  ghost:
    "bg-transparent text-vault-graphite hover:text-vault-ink hover:bg-vault-hairline",
  destructive:
    "bg-vault-oxblood text-vault-paper hover:opacity-90",
  gold:
    "bg-vault-gold text-vault-paper hover:bg-vault-gold-light",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-[10px]",
  md: "px-6 py-3 text-[11px]",
  lg: "px-8 py-4 text-[12px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className,
      icon,
      iconTrailing,
      children,
      disabled,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-sans font-semibold uppercase tracking-wider-alt rounded-[2px] transition-all duration-500 ease-vault disabled:opacity-40 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...rest}
      >
        {icon ? <span className="flex items-center">{icon}</span> : null}
        <span>{children}</span>
        {iconTrailing ? (
          <span className="flex items-center">{iconTrailing}</span>
        ) : null}
      </button>
    );
  }
);
Button.displayName = "Button";

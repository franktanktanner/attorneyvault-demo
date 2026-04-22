import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg" | "none";
  interactive?: boolean;
}

const paddingClasses = {
  none: "p-0",
  sm: "p-5",
  md: "p-8",
  lg: "p-10",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = "md", interactive = false, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-vault-paper border border-vault-hairline rounded-[6px] transition-colors duration-500 ease-vault",
          paddingClasses[padding],
          interactive && "hover:border-vault-hairline-deep",
          className
        )}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

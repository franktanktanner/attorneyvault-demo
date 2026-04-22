import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, className, id, onFocus, onBlur, ...rest }, ref) => {
    const reactId = useId();
    const inputId = id ?? `vault-input-${reactId}`;
    const [focused, setFocused] = useState(false);

    return (
      <div className="w-full">
        {label ? (
          <label htmlFor={inputId} className="label-eyebrow block mb-2">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            className={cn(
              "w-full bg-transparent border-0 border-b border-vault-hairline px-0 py-2 font-sans text-sm text-vault-ink placeholder:text-vault-graphite-light focus:outline-none focus:ring-0 focus:border-vault-hairline transition-colors duration-500 ease-vault",
              className
            )}
            {...rest}
          />
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute bottom-0 left-0 h-px bg-vault-forest transition-[width] duration-500 ease-vault",
              focused ? "w-full" : "w-0"
            )}
          />
        </div>
        {hint ? (
          <p className="mt-2 label-eyebrow text-vault-graphite-light">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

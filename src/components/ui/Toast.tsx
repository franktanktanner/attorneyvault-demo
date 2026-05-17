import { motion, AnimatePresence } from "framer-motion";
import { Check, Info, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export type ToastVariant = "success" | "info" | "pending";

export interface ToastEntry {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastStackProps {
  toasts: ToastEntry[];
}

const VARIANT_META: Record<
  ToastVariant,
  { eyebrow: string; accent: string; Icon: typeof Check; iconSpin?: boolean }
> = {
  success: {
    eyebrow: "LOGGED",
    accent: "text-vault-forest border-l-vault-forest",
    Icon: Check,
  },
  info: {
    eyebrow: "OPENED",
    accent: "text-vault-gold border-l-vault-gold",
    Icon: Info,
  },
  pending: {
    eyebrow: "IN PROGRESS",
    accent: "text-vault-oxblood border-l-vault-oxblood",
    Icon: Loader2,
    iconSpin: true,
  },
};

export function ToastStack({ toasts }: ToastStackProps) {
  return (
    <div className="fixed bottom-10 right-6 z-[60] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const meta = VARIANT_META[toast.variant];
          const Icon = meta.Icon;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 24, y: 8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "pointer-events-auto min-w-[280px] max-w-[360px] bg-vault-paper border border-vault-hairline border-l-2 rounded-[4px] shadow-seal px-4 py-3 flex items-start gap-3",
                meta.accent
              )}
            >
              <Icon
                strokeWidth={1.6}
                size={14}
                className={cn(
                  "mt-0.5 shrink-0",
                  meta.iconSpin && "animate-spin"
                )}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-wider-alt font-semibold",
                    meta.accent.split(" ")[0]
                  )}
                >
                  {meta.eyebrow}
                </p>
                <p className="mt-1 font-sans text-sm text-vault-ink leading-snug">
                  {toast.message}
                </p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

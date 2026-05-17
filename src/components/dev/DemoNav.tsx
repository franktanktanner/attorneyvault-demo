import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, X } from "lucide-react";
import { cn } from "../../lib/utils";

const ROUTES: Array<{ path: string; label: string; eyebrow: string }> = [
  { path: "/", label: "Login", eyebrow: "01 · CINEMATIC UNLOCK" },
  { path: "/vault", label: "Vault Home", eyebrow: "02 · MORNING DIGEST" },
  { path: "/rolodex", label: "Rolodex", eyebrow: "03 · DIRECTORY" },
  { path: "/attorney/atty-001", label: "Attorney · Augustin Mercer", eyebrow: "04 · DEEP DIVE" },
  { path: "/pipeline", label: "Pipeline", eyebrow: "05 · RELATIONSHIP BOARD" },
  { path: "/intelligence", label: "Intelligence", eyebrow: "06 · SIGNAL GRID" },
  { path: "/enrichment", label: "Enrichment", eyebrow: "07 · SOURCING" },
  { path: "/vault-mode", label: "Vault Mode", eyebrow: "08 · SEALED ACCESS" },
  { path: "/reports", label: "Reports", eyebrow: "09 · EDITORIAL EXPORTS" },
];

export function DemoNav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.shiftKey && event.key.toLowerCase() === "d") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const resetState = () => {
    sessionStorage.clear();
    setOpen(false);
    navigate("/", { replace: true });
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="demo-nav-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed inset-0 z-[80] bg-vault-obsidian/85 backdrop-blur-sm flex items-center justify-center px-6"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[520px] bg-vault-obsidian border border-vault-graphite/40 rounded-[6px] overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-vault-graphite/30">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider-alt text-vault-gold font-semibold">
                  DEMO NAVIGATOR · ⌘⇧D
                </p>
                <h2 className="mt-1 font-display text-xl text-vault-paper tracking-tighter-alt font-light">
                  Jump to any scene
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close demo navigator"
                className="text-vault-graphite-light hover:text-vault-paper transition-colors duration-300"
              >
                <X strokeWidth={1.5} size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {ROUTES.map((route) => (
                <button
                  key={route.path}
                  type="button"
                  onClick={() => go(route.path)}
                  className={cn(
                    "w-full px-6 py-3 flex items-center justify-between gap-4 text-left border-b border-vault-graphite/20 transition-colors duration-300",
                    "hover:bg-vault-graphite/10 group"
                  )}
                >
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-wider-alt text-vault-graphite-light font-semibold">
                      {route.eyebrow}
                    </p>
                    <p className="mt-1 font-sans text-sm text-vault-paper truncate">
                      {route.label}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider-alt text-vault-graphite group-hover:text-vault-gold transition-colors duration-300">
                    {route.path}
                  </span>
                </button>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-vault-graphite/30 flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-wider-alt text-vault-graphite-light">
                ESC TO CLOSE · ⌘⇧D TO TOGGLE
              </p>
              <button
                type="button"
                onClick={resetState}
                className="inline-flex items-center gap-2 px-3 py-1.5 border border-vault-oxblood/60 text-vault-oxblood hover:bg-vault-oxblood hover:text-vault-paper transition-colors duration-300 rounded-[2px] font-mono text-[10px] uppercase tracking-wider-alt font-semibold"
              >
                <RotateCcw strokeWidth={1.6} size={12} />
                Reset Demo State
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

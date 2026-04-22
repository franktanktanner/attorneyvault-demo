import { Lock, ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { SessionTimer } from "../vault/SessionTimer";
import { LockIndicator } from "../vault/LockIndicator";
import { Button } from "../ui/Button";

const CRUMBS: Record<string, string> = {
  "/vault": "VAULT HOME",
  "/rolodex": "ROLODEX",
  "/pipeline": "PIPELINE",
  "/intelligence": "INTELLIGENCE",
  "/enrichment": "ENRICHMENT",
  "/vault-mode": "VAULT MODE",
  "/reports": "REPORTS",
};

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const crumb =
    CRUMBS[path] ??
    (path.startsWith("/attorney/") ? "ROLODEX · ATTORNEY PROFILE" : "VAULT");

  return (
    <header className="fixed top-0 right-0 left-[220px] h-16 bg-vault-paper border-b border-vault-hairline z-20">
      <div className="h-full px-8 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="label-eyebrow">{crumb}</span>
        </div>

        <div className="flex items-center gap-6">
          <SessionTimer />
          <LockIndicator state="unlocked" />
          <Button
            variant="ghost"
            size="sm"
            icon={<Lock size={12} strokeWidth={1.8} />}
            onClick={() => navigate("/")}
          >
            Lock Vault
          </Button>
          <span className="h-6 w-px bg-vault-hairline" />
          <button
            type="button"
            className="flex items-center gap-2 group"
            aria-label="Account menu"
          >
            <div className="h-9 w-9 rounded-full border border-vault-ink flex items-center justify-center">
              <span className="font-mono text-[10px] font-semibold tracking-wider-alt text-vault-ink">
                CJS
              </span>
            </div>
            <ChevronDown
              size={12}
              strokeWidth={1.6}
              className="text-vault-graphite group-hover:text-vault-ink transition-colors duration-500 ease-vault"
            />
          </button>
        </div>
      </div>
    </header>
  );
}

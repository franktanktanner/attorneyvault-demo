import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  KanbanSquare,
  Sparkles,
  Radar,
  Shield,
  BarChart3,
} from "lucide-react";
import { cn } from "../../lib/utils";

const NAV = [
  { to: "/vault", label: "Vault Home", Icon: Home },
  { to: "/rolodex", label: "Rolodex", Icon: Users },
  { to: "/pipeline", label: "Pipeline", Icon: KanbanSquare },
  { to: "/intelligence", label: "Intelligence", Icon: Sparkles },
  { to: "/enrichment", label: "Enrichment", Icon: Radar },
  { to: "/vault-mode", label: "Vault Mode", Icon: Shield },
  { to: "/reports", label: "Reports", Icon: BarChart3 },
];

function VaultGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" className="shrink-0">
      <rect
        x="3"
        y="5"
        width="26"
        height="22"
        rx="1.5"
        fill="none"
        stroke="#0A0A0A"
        strokeWidth="1.4"
      />
      <circle
        cx="16"
        cy="16"
        r="5"
        fill="none"
        stroke="#1A3D2E"
        strokeWidth="1.2"
      />
      <circle cx="16" cy="16" r="1.3" fill="#1A3D2E" />
      <line x1="16" y1="7.5" x2="16" y2="9" stroke="#0A0A0A" strokeWidth="1" />
      <line
        x1="16"
        y1="23"
        x2="16"
        y2="24.5"
        stroke="#0A0A0A"
        strokeWidth="1"
      />
      <line x1="7.5" y1="16" x2="9" y2="16" stroke="#0A0A0A" strokeWidth="1" />
      <line
        x1="23"
        y1="16"
        x2="24.5"
        y2="16"
        stroke="#0A0A0A"
        strokeWidth="1"
      />
    </svg>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-vault-paper border-r border-vault-hairline flex flex-col z-30">
      <div className="h-20 px-6 flex flex-col justify-center border-b border-vault-hairline">
        <div className="flex items-center gap-3">
          <VaultGlyph />
          <span className="font-display text-xl text-vault-ink tracking-tighter-alt">
            AttorneyVault
          </span>
        </div>
        <span className="label-eyebrow mt-1.5">PRIVATE INTELLIGENCE</span>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "relative h-14 pl-6 pr-4 flex items-center gap-3 border-b border-vault-hairline transition-colors duration-500 ease-vault",
                isActive
                  ? "text-vault-ink bg-vault-paper-deep"
                  : "text-vault-graphite hover:text-vault-ink"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-vault-forest" />
                ) : null}
                <Icon size={16} strokeWidth={1.5} />
                <span className="font-sans text-[13px] font-medium tracking-tight">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-5 border-t border-vault-hairline">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border border-vault-forest flex items-center justify-center">
            <span className="font-mono text-[11px] font-semibold tracking-wider-alt text-vault-forest">
              CJS
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-vault-ink truncate">
              C. Jeffrey Stanley
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block h-1 w-1 rounded-full bg-vault-gold" />
              <span className="label-eyebrow">Principal</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

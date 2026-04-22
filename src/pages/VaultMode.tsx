import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts";
import { Download, Filter, Lock } from "lucide-react";

import { PageShell } from "../components/layout/PageShell";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { attorneys } from "../lib/mockData";
import { cn } from "../lib/utils";

const EASE_VAULT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const AUDIT_ACTIONS = [
  "VAULT_UNLOCKED",
  "ATTORNEY_VIEWED",
  "NOTE_ADDED",
  "TAG_APPLIED",
  "REFERRAL_LOGGED",
  "EXPORT_GENERATED",
  "CONTACT_LOGGED",
  "ENRICHMENT_RUN",
  "TIER_UPGRADED",
  "SESSION_EXTENDED",
  "VAULT_LOCKED",
] as const;

const AUDIT_ACTORS = [
  "C. Jeffrey Stanley",
  "Marta Beltran",
  "Intake Desk",
  "Concierge Desk",
  "Relationship Desk",
  "System",
] as const;

const AUDIT_DETAILS: Record<(typeof AUDIT_ACTIONS)[number], string[]> = {
  VAULT_UNLOCKED: [
    "Principal session established from San Jose HQ",
    "Biometric confirmation · principal override",
  ],
  ATTORNEY_VIEWED: [
    "Profile accessed from Rolodex",
    "Profile accessed from Pipeline board",
    "Profile accessed from Court Signal referral",
  ],
  NOTE_ADDED: [
    "Relationship note appended",
    "Preference note updated",
    "Concierge observation logged",
  ],
  TAG_APPLIED: [
    "Trusted Circle tag applied",
    "Federal Courts tag applied",
    "Reactivation tag applied",
  ],
  REFERRAL_LOGGED: [
    "Inbound referral recorded to ledger",
    "Bond posting linked to referral",
  ],
  EXPORT_GENERATED: [
    "Quarterly intelligence export PDF",
    "Gold Vault export archive · watermarked",
  ],
  CONTACT_LOGGED: [
    "Coffee meeting logged",
    "Phone call logged · direct line",
    "In-person observation logged",
  ],
  ENRICHMENT_RUN: [
    "CourtConnect enrichment completed",
    "Bar registry sweep completed",
    "Editorial sourcing pass completed",
  ],
  TIER_UPGRADED: [
    "Tier upgrade recorded · silver → gold",
    "Tier downgrade recorded · gold → silver",
  ],
  SESSION_EXTENDED: ["Session extended by principal"],
  VAULT_LOCKED: ["Session ended by auto-timeout", "Manual lock by principal"],
};

interface AuditRow {
  id: string;
  serial: string;
  action: (typeof AUDIT_ACTIONS)[number];
  subject: string;
  detail: string;
  actor: string;
  minutesAgo: number;
}

function buildAuditLog(): AuditRow[] {
  const rows: AuditRow[] = [];
  const count = 28;
  for (let i = 0; i < count; i++) {
    const action = AUDIT_ACTIONS[i % AUDIT_ACTIONS.length];
    const actor = AUDIT_ACTORS[i % AUDIT_ACTORS.length];
    const details = AUDIT_DETAILS[action];
    const detail = details[i % details.length];
    const systemish =
      action === "ENRICHMENT_RUN" ||
      action === "VAULT_UNLOCKED" ||
      action === "VAULT_LOCKED" ||
      action === "SESSION_EXTENDED";
    const attorney = attorneys[(i * 17) % attorneys.length];
    const subject = systemish ? "System" : attorney.name;
    const minutesAgo = 2 + i * 9 + ((i * 13) % 7);
    rows.push({
      id: `audit-${i}`,
      serial: String(count - i).padStart(3, "0"),
      action,
      subject,
      detail,
      actor,
      minutesAgo,
    });
  }
  return rows;
}

function formatMinutesAgo(minutes: number): string {
  if (minutes < 1) return "NOW";
  if (minutes < 60) return `${minutes}M AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.floor(hours / 24);
  return `${days}D AGO`;
}

function formatClockFromMinutes(minutes: number): string {
  const d = new Date(Date.now() - minutes * 60_000);
  return d
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
}

function formatSessionRemaining(seconds: number): string {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60).toString().padStart(2, "0");
  const s = (safe % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const VERSION_HISTORY = [
  8, 12, 9, 14, 11, 13, 10, 16, 12, 15, 11, 18, 13, 14, 12, 17, 10, 13, 16, 19,
  14, 12, 15, 11, 18, 20, 14, 12, 10, 13, 15, 17, 12, 14, 11, 16, 9, 13, 15,
  18, 14, 11, 13, 16, 12, 17, 10, 14, 13, 15, 12, 18, 11, 14, 16, 13, 17, 10,
  12, 15, 11, 18, 14, 9, 13, 16, 12, 14, 18, 11, 13, 17, 15, 12, 10, 14, 16,
  13, 18, 11, 15, 12, 14, 17, 13, 11, 16, 10, 14, 12,
];

export default function VaultMode() {
  const [scope, setScope] = useState<"ALL" | "GOLD VAULT" | "CUSTOM">("ALL");
  const [sessionSeconds, setSessionSeconds] = useState(9 * 60 + 12);
  const rows = useMemo(() => buildAuditLog(), []);
  const versionData = useMemo(
    () => VERSION_HISTORY.map((v, i) => ({ day: i + 1, edits: v })),
    []
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setSessionSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <PageShell>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_VAULT }}
      >
        <p className="label-eyebrow">VAULT MODE · SEALED ACCESS</p>
        <h1 className="mt-4 font-display font-light text-6xl text-vault-ink tracking-tightest leading-[0.95]">
          Vault Mode
        </h1>
        <p className="mt-5 text-lg font-light text-vault-graphite max-w-2xl leading-relaxed">
          Every edit recorded. Every export encrypted. Every access logged.
          Protection of the relationship capital that took 27 years to build.
        </p>
      </motion.header>

      <section className="mt-12">
        <Card padding="lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="label-eyebrow">VAULT INTEGRITY</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-vault-forest vault-pulse" />
                <span className="font-display font-light text-3xl text-vault-ink num-mono tracking-tighter-alt">
                  100%
                </span>
              </div>
              <p className="mt-2 label-eyebrow text-vault-forest">VERIFIED</p>
            </div>
            <div>
              <p className="label-eyebrow">ENCRYPTION</p>
              <p className="mt-3 font-display font-light text-3xl text-vault-ink tracking-tighter-alt">
                AES-256
              </p>
              <p className="mt-2 label-eyebrow text-vault-graphite-light">
                AT REST · IN TRANSIT
              </p>
            </div>
            <div>
              <p className="label-eyebrow">LAST BACKUP</p>
              <p className="mt-3 font-display font-light text-3xl text-vault-ink tracking-tighter-alt">
                2H AGO
              </p>
              <p className="mt-2 label-eyebrow text-vault-graphite-light">
                SEALED SNAPSHOT
              </p>
            </div>
            <div>
              <p className="label-eyebrow">ACCESS ZONES</p>
              <p className="mt-3 font-display font-light text-3xl text-vault-ink num-mono tracking-tighter-alt">
                3 ACTIVE
              </p>
              <p className="mt-2 label-eyebrow text-vault-graphite-light">
                GENERAL · GOLD · PLATINUM
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-10 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-vault-hairline">
            <p className="label-eyebrow-strong">LIVE AUDIT TRAIL</p>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                icon={<Filter strokeWidth={1.5} size={12} />}
              >
                Filter Events
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<Download strokeWidth={1.5} size={12} />}
              >
                Export Log (CSV)
              </Button>
            </div>
          </div>
          <div className="mt-4 max-h-[640px] overflow-y-auto divide-y divide-vault-hairline">
            {rows.map((row) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, ease: EASE_VAULT }}
                className="grid grid-cols-[48px_180px_1fr_auto] items-start gap-4 py-3"
              >
                <p className="font-mono text-[11px] uppercase tracking-wider-alt text-vault-graphite-light num-mono">
                  {row.serial}
                </p>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider-alt text-vault-ink">
                    {row.action}
                  </p>
                  <p className="mt-0.5 label-eyebrow text-vault-graphite-light">
                    {row.subject}
                  </p>
                </div>
                <p className="text-sm text-vault-graphite leading-relaxed">
                  {row.detail}
                </p>
                <div className="text-right">
                  <p className="label-eyebrow-strong text-vault-ink">
                    {row.actor}
                  </p>
                  <p className="mt-0.5 label-eyebrow num-mono text-vault-graphite-light">
                    {formatClockFromMinutes(row.minutesAgo)} ·{" "}
                    {formatMinutesAgo(row.minutesAgo)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <Card padding="md">
            <p className="label-eyebrow">VAULT ZONES</p>
            <div className="mt-5 space-y-4">
              {[
                {
                  name: "General Vault",
                  descriptor: "All 247 attorneys · open access",
                  dot: "bg-vault-forest",
                  label: "ACTIVE",
                  labelColor: "text-vault-forest",
                },
                {
                  name: "Gold Vault",
                  descriptor: "Top 47 · elevated permissions",
                  dot: "bg-vault-gold",
                  label: "ELEVATED",
                  labelColor: "text-vault-gold",
                },
                {
                  name: "Platinum Vault",
                  descriptor: "Top 12 · principal-only",
                  dot: "bg-vault-gold",
                  label: "PRINCIPAL",
                  labelColor: "text-vault-gold",
                },
              ].map((zone) => (
                <div
                  key={zone.name}
                  className="flex items-start justify-between gap-3 pb-3 border-b border-vault-hairline last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full mt-1.5",
                        zone.dot
                      )}
                    />
                    <div>
                      <p className="font-sans text-sm text-vault-ink font-medium">
                        {zone.name}
                      </p>
                      <p className="label-eyebrow text-vault-graphite-light">
                        {zone.descriptor}
                      </p>
                    </div>
                  </div>
                  <p className={cn("label-eyebrow-strong", zone.labelColor)}>
                    {zone.label}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="md">
            <p className="label-eyebrow">ENCRYPTED EXPORT</p>
            <h3 className="mt-3 font-display text-lg text-vault-ink tracking-tighter-alt font-medium">
              Export Vault Data
            </h3>
            <p className="mt-2 text-sm text-vault-graphite leading-relaxed">
              Generate a password-protected archive of attorney records.
              Every export is logged and watermarked.
            </p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="label-eyebrow block mb-2">MASTER CODE</label>
                <input
                  type="password"
                  placeholder="•••••••••••"
                  className="w-full bg-transparent border-0 border-b border-vault-hairline px-0 py-2 font-mono text-sm text-vault-ink placeholder:text-vault-graphite-light focus:outline-none focus:border-vault-forest transition-colors duration-500 ease-vault"
                />
              </div>
              <div>
                <label className="label-eyebrow block mb-2">
                  EXPORT SCOPE
                </label>
                <div className="flex items-center gap-2">
                  {(["ALL", "GOLD VAULT", "CUSTOM"] as const).map(
                    (option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setScope(option)}
                        className={cn(
                          "px-3 py-1.5 rounded-full border font-sans text-[10px] uppercase tracking-wider-alt font-semibold transition-colors duration-500 ease-vault",
                          scope === option
                            ? "bg-vault-ink border-vault-ink text-vault-paper"
                            : "bg-transparent border-vault-hairline text-vault-graphite hover:text-vault-ink"
                        )}
                      >
                        {option}
                      </button>
                    )
                  )}
                </div>
              </div>
              <Button variant="primary" size="md" className="w-full">
                Initiate Encrypted Export
              </Button>
              <p className="label-eyebrow text-vault-graphite-light">
                EXPORTS EXPIRE AFTER 72 HOURS · RE-AUTHENTICATION REQUIRED
              </p>
            </div>
          </Card>

          <Card padding="md">
            <p className="label-eyebrow">VERSION HISTORY</p>
            <p className="mt-3 font-sans text-sm text-vault-ink">
              90-day rolling history preserved
            </p>
            <div className="mt-4 h-20">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={versionData}
                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                >
                  <XAxis dataKey="day" hide />
                  <Bar
                    dataKey="edits"
                    fill="#1A3D2E"
                    radius={[1, 1, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="label-eyebrow">LAST SNAPSHOT · 2H AGO</p>
              <Button variant="ghost" size="sm">
                Restore From Snapshot
              </Button>
            </div>
          </Card>

          <Card padding="md">
            <p className="label-eyebrow">ACTIVE SESSION</p>
            <div className="mt-3 flex items-center gap-3">
              <Lock strokeWidth={1.5} size={14} className="text-vault-ink" />
              <p className="font-display font-light text-3xl text-vault-ink num-mono tracking-tighter-alt">
                {formatSessionRemaining(sessionSeconds)}
              </p>
            </div>
            <p className="mt-2 label-eyebrow text-vault-graphite-light">
              AUTO-LOCK IN {formatSessionRemaining(sessionSeconds)}
            </p>
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSessionSeconds(10 * 60)}
              >
                Extend Session
              </Button>
            </div>
          </Card>
        </aside>
      </section>
    </PageShell>
  );
}

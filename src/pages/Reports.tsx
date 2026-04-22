import { motion } from "framer-motion";
import { Building2, FileText, User } from "lucide-react";

import { PageShell } from "../components/layout/PageShell";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { StatTile } from "../components/ui/StatTile";
import { cn } from "../lib/utils";

const EASE_VAULT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const REPORTS_SPARK = [2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14];
const DRAFTS_SPARK = [3, 3, 2, 2, 3, 2, 3, 2, 2, 3, 2, 2];

interface GeneratorCard {
  eyebrow: string;
  title: string;
  Icon: typeof FileText;
  body: string;
  meta: string;
  cta: string;
  lastRun: string;
  accent: "gold" | "forest" | "graphite";
}

const GENERATORS: GeneratorCard[] = [
  {
    eyebrow: "QUARTERLY BRIEF",
    title: "Relationship State of the Firm",
    Icon: FileText,
    body: "One envelope, once per quarter. The editorial briefing sent to principals covering network health, top movers, drift alerts, competitive signals, and recommended actions for the quarter ahead.",
    meta: "8 to 12 pages · PDF · Watermarked · Encrypted",
    cta: "Generate Q1 2026 Brief",
    lastRun: "Last generated: Jan 31, 2026",
    accent: "gold",
  },
  {
    eyebrow: "ATTORNEY LEDGER",
    title: "Per-Attorney Lifetime Ledger",
    Icon: User,
    body: "Every referral, touch, bond, and drift signal for a single attorney. Generated for quarterly relationship reviews, internal handoffs, or principal read-outs.",
    meta: "4 to 6 pages per attorney · PDF · Watermarked",
    cta: "Select Attorney → Generate",
    lastRun: "Available for all 247 records",
    accent: "forest",
  },
  {
    eyebrow: "OFFICE SNAPSHOT",
    title: "Per-Office Performance Report",
    Icon: Building2,
    body: "Performance of a single office against the vault baseline. Referral volume, conversion rates, active relationships, drift indicators, and competitive positioning within that territory.",
    meta: "6 to 8 pages · PDF · Watermarked",
    cta: "Select Office → Generate",
    lastRun: "Available for all 6 offices",
    accent: "graphite",
  },
];

type ReportKind = "QUARTERLY BRIEF" | "ATTORNEY LEDGER" | "OFFICE SNAPSHOT";

interface RecentReport {
  generatedIso: string;
  kind: ReportKind;
  subject: string;
  author: string;
  pages: number;
  tag?: "draft";
}

const RECENT_REPORTS: RecentReport[] = [
  {
    generatedIso: "2026-04-14",
    kind: "QUARTERLY BRIEF",
    subject: "Q1 2026 Firm Brief",
    author: "C. Jeffrey Stanley",
    pages: 10,
    tag: "draft",
  },
  {
    generatedIso: "2026-04-08",
    kind: "ATTORNEY LEDGER",
    subject: "Marisol Castaneda · Full Ledger",
    author: "Cindy Stanley",
    pages: 5,
  },
  {
    generatedIso: "2026-04-02",
    kind: "OFFICE SNAPSHOT",
    subject: "San Jose HQ · Q1 Preview",
    author: "C. Jeffrey Stanley",
    pages: 7,
  },
  {
    generatedIso: "2026-03-28",
    kind: "ATTORNEY LEDGER",
    subject: "Harold Okonkwo · Full Ledger",
    author: "C. Jeffrey Stanley",
    pages: 6,
  },
  {
    generatedIso: "2026-03-21",
    kind: "OFFICE SNAPSHOT",
    subject: "Los Angeles · Q4 Review",
    author: "Cindy Stanley",
    pages: 8,
  },
  {
    generatedIso: "2026-03-14",
    kind: "ATTORNEY LEDGER",
    subject: "Priya Ramanathan · Full Ledger",
    author: "C. Jeffrey Stanley",
    pages: 5,
  },
  {
    generatedIso: "2026-02-28",
    kind: "OFFICE SNAPSHOT",
    subject: "Oakland · Q4 Review",
    author: "C. Jeffrey Stanley",
    pages: 7,
  },
  {
    generatedIso: "2026-02-20",
    kind: "ATTORNEY LEDGER",
    subject: "Darnell Whitfield · Full Ledger",
    author: "Cindy Stanley",
    pages: 6,
  },
  {
    generatedIso: "2026-02-14",
    kind: "OFFICE SNAPSHOT",
    subject: "Santa Ana · Q4 Review",
    author: "C. Jeffrey Stanley",
    pages: 6,
  },
  {
    generatedIso: "2026-01-31",
    kind: "QUARTERLY BRIEF",
    subject: "Q4 2025 Firm Brief",
    author: "C. Jeffrey Stanley",
    pages: 11,
  },
  {
    generatedIso: "2026-01-24",
    kind: "OFFICE SNAPSHOT",
    subject: "San Diego · Q4 Review",
    author: "Cindy Stanley",
    pages: 6,
  },
  {
    generatedIso: "2026-01-17",
    kind: "OFFICE SNAPSHOT",
    subject: "Redwood City · Q4 Review",
    author: "C. Jeffrey Stanley",
    pages: 5,
  },
];

const KIND_VARIANT: Record<ReportKind, "gold" | "forest" | "outline"> = {
  "QUARTERLY BRIEF": "gold",
  "ATTORNEY LEDGER": "forest",
  "OFFICE SNAPSHOT": "outline",
};

function formatAbsolute(iso: string): string {
  return new Date(`${iso}T12:00:00Z`)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

function formatRelative(iso: string): string {
  const then = new Date(`${iso}T12:00:00Z`).getTime();
  const days = Math.max(
    0,
    Math.floor((Date.now() - then) / 86_400_000)
  );
  if (days < 1) return "TODAY";
  if (days === 1) return "1 DAY AGO";
  if (days < 30) return `${days} DAYS AGO`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} MO AGO`;
  return `${Math.floor(days / 365)}Y AGO`;
}

export default function Reports() {
  return (
    <PageShell>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_VAULT }}
      >
        <p className="label-eyebrow">REPORTS · EDITORIAL EXPORTS</p>
        <h1 className="mt-4 font-display font-light text-6xl text-vault-ink tracking-tightest leading-[0.95]">
          Reports
        </h1>
        <p className="mt-5 text-lg font-light text-vault-graphite max-w-2xl leading-relaxed">
          Quarterly briefs, per-attorney ledgers, and office snapshots.
          Generated on demand. Sealed, encrypted, watermarked.
        </p>
      </motion.header>

      <section className="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatTile
          label="Reports Generated · QTD"
          value={14}
          sparkline={REPORTS_SPARK}
          delta={{ value: "+3 vs. last quarter", direction: "up" }}
        />
        <StatTile
          label="Last Export"
          value={2}
          suffix=" DAYS AGO"
          delta={{ value: "Q1 2026 FIRM BRIEF", direction: "flat" }}
        />
        <StatTile
          label="Pending Drafts"
          value={2}
          sparkline={DRAFTS_SPARK}
          delta={{ value: "AWAITING PRINCIPAL REVIEW", direction: "flat" }}
        />
        <StatTile
          label="Archive Retention"
          value={90}
          suffix=" DAYS"
          delta={{ value: "EXTENDABLE ON REQUEST", direction: "flat" }}
        />
      </section>

      <section className="mt-14">
        <div className="flex items-center justify-between pb-3 border-b border-vault-hairline">
          <p className="label-eyebrow-strong">GENERATE A NEW REPORT</p>
          <p className="label-eyebrow text-vault-graphite-light">
            THREE EDITIONS AVAILABLE
          </p>
        </div>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {GENERATORS.map((gen, idx) => {
            const Icon = gen.Icon;
            return (
              <motion.div
                key={gen.eyebrow}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.1 + idx * 0.08,
                  ease: EASE_VAULT,
                }}
              >
                <Card padding="lg" interactive className="h-full flex flex-col">
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-full border border-vault-hairline flex items-center justify-center">
                      <Icon
                        strokeWidth={1.5}
                        size={18}
                        className={cn(
                          gen.accent === "gold"
                            ? "text-vault-gold"
                            : gen.accent === "forest"
                            ? "text-vault-forest"
                            : "text-vault-graphite"
                        )}
                      />
                    </div>
                    <p className="label-eyebrow">{gen.eyebrow}</p>
                  </div>
                  <h3 className="mt-5 font-display text-2xl text-vault-ink tracking-tighter-alt font-medium">
                    {gen.title}
                  </h3>
                  <p className="mt-4 text-sm text-vault-graphite leading-relaxed flex-1">
                    {gen.body}
                  </p>
                  <div className="mt-5 pt-4 border-t border-vault-hairline">
                    <p className="label-eyebrow text-vault-graphite-light">
                      {gen.meta.toUpperCase()}
                    </p>
                    <div className="mt-4">
                      <Button variant="primary" size="md" className="w-full">
                        {gen.cta}
                      </Button>
                    </div>
                    <p className="mt-3 font-sans text-[11px] text-vault-graphite-light">
                      {gen.lastRun}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mt-14">
        <div className="flex items-center justify-between pb-3 border-b border-vault-hairline">
          <p className="label-eyebrow-strong">RECENT EDITIONS · ARCHIVED</p>
          <p className="label-eyebrow text-vault-graphite-light">
            {RECENT_REPORTS.length} IN ARCHIVE
          </p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-vault-hairline-deep">
                <th className="text-left py-3 px-2 label-eyebrow-strong">
                  Generated
                </th>
                <th className="text-left py-3 px-2 label-eyebrow-strong">
                  Type
                </th>
                <th className="text-left py-3 px-2 label-eyebrow-strong">
                  Subject
                </th>
                <th className="text-left py-3 px-2 label-eyebrow-strong hidden md:table-cell">
                  Author
                </th>
                <th className="text-left py-3 px-2 label-eyebrow-strong hidden lg:table-cell">
                  Pages
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {RECENT_REPORTS.map((report, idx) => (
                <motion.tr
                  key={`${report.generatedIso}-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(idx * 0.03, 0.4),
                    ease: EASE_VAULT,
                  }}
                  className="border-b border-vault-hairline hover:bg-vault-paper-deep transition-colors duration-300"
                >
                  <td className="py-3 px-2">
                    <p className="label-eyebrow-strong text-vault-ink">
                      {formatAbsolute(report.generatedIso)}
                    </p>
                    <p className="label-eyebrow text-vault-graphite-light">
                      {formatRelative(report.generatedIso)}
                    </p>
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant={KIND_VARIANT[report.kind]}>
                      {report.kind}
                    </Badge>
                  </td>
                  <td className="py-3 px-2">
                    <p className="font-sans text-sm text-vault-ink font-medium">
                      {report.subject}
                    </p>
                    {report.tag === "draft" ? (
                      <p className="mt-0.5 label-eyebrow text-vault-gold">
                        DRAFT · AWAITING PRINCIPAL REVIEW
                      </p>
                    ) : null}
                  </td>
                  <td className="py-3 px-2 hidden md:table-cell font-sans text-sm text-vault-graphite">
                    {report.author}
                  </td>
                  <td className="py-3 px-2 hidden lg:table-cell font-sans text-sm text-vault-ink num-mono">
                    {report.pages}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        type="button"
                        className="label-eyebrow-strong text-vault-ink hover:text-vault-forest transition-colors duration-500 ease-vault"
                      >
                        DOWNLOAD
                      </button>
                      <button
                        type="button"
                        className="label-eyebrow text-vault-graphite hover:text-vault-ink transition-colors duration-500 ease-vault hidden md:inline-flex"
                      >
                        VIEW
                      </button>
                      <button
                        type="button"
                        className="label-eyebrow text-vault-graphite hover:text-vault-ink transition-colors duration-500 ease-vault hidden lg:inline-flex"
                      >
                        REGENERATE
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-14">
        <Card padding="lg">
          <div className="flex items-center justify-between pb-3 border-b border-vault-hairline">
            <p className="label-eyebrow-strong">ARCHIVE & RETENTION</p>
            <p className="label-eyebrow text-vault-graphite-light">
              VAULT MODE GOVERNED
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="label-eyebrow">ENCRYPTION</p>
              <p className="mt-3 font-display text-lg text-vault-ink tracking-tighter-alt font-medium">
                AES-256 at rest
              </p>
              <p className="mt-2 text-sm text-vault-graphite leading-relaxed">
                Re-authentication required for access beyond 72 hours. Exports
                cannot be downloaded without principal credentials.
              </p>
            </div>
            <div>
              <p className="label-eyebrow">WATERMARKING</p>
              <p className="mt-3 font-display text-lg text-vault-ink tracking-tighter-alt font-medium">
                Principal signature embedded
              </p>
              <p className="mt-2 text-sm text-vault-graphite leading-relaxed">
                Every export watermarked with principal signature and timestamp.
                Forensic recovery possible if a file leaves the vault.
              </p>
            </div>
            <div>
              <p className="label-eyebrow">RETENTION</p>
              <p className="mt-3 font-display text-lg text-vault-ink tracking-tighter-alt font-medium">
                90-day rolling archive
              </p>
              <p className="mt-2 text-sm text-vault-graphite leading-relaxed">
                Longer retention available for subpoena response or
                compliance. Archive restore recorded in the audit trail.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </PageShell>
  );
}

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Briefcase,
  Sparkles,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import { PageShell } from "../components/layout/PageShell";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import {
  attorneys,
  type AttorneyTier,
  type BbbOffice,
} from "../lib/mockData";
import { cn } from "../lib/utils";

const EASE_VAULT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const TABS = [
  "Briefing",
  "Dormant Watch",
  "Court Signals",
  "Relationship Drift",
  "Competitive Index",
] as const;
type Tab = (typeof TABS)[number];

const TIER_BADGE: Record<
  AttorneyTier,
  "gold" | "neutral" | "outline" | "oxblood"
> = {
  platinum: "gold",
  gold: "gold",
  silver: "neutral",
  bronze: "outline",
  prospect: "outline",
  dormant: "oxblood",
};

const HEALTH_SPARK = [91, 92, 92, 93, 93, 92, 94, 94, 93, 95, 94, 94];

function daysSince(iso: string): number {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  );
}

function formatRelativeShort(days: number): string {
  if (days < 1) return "TODAY";
  if (days === 1) return "1 DAY AGO";
  if (days < 30) return `${days} DAYS AGO`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} MO AGO`;
  return `${Math.floor(days / 365)}Y AGO`;
}

// ============================================================================
// Briefing derivations from the real dataset
// ============================================================================

interface BriefingItem {
  kind: "risk" | "opportunity" | "note" | "insight";
  headline: string;
  body: string;
  attorneyId?: string;
}

function buildBriefing(): BriefingItem[] {
  const active = attorneys.filter(
    (a) =>
      (a.tier === "platinum" || a.tier === "gold") && a.status === "active"
  );
  const drifting = active
    .map((a) => ({ a, days: daysSince(a.lastReferralDate) }))
    .sort((x, y) => y.days - x.days);
  const driftTop = drifting[0];
  const opportunity = active.find((a) => a.tier === "platinum") ?? active[0];
  const driftCount = active.filter(
    (a) => daysSince(a.lastReferralDate) > 30
  ).length;
  const firmChange = attorneys.find((a) =>
    a.tags.some((t) => t.toLowerCase().includes("trusted"))
  );

  return [
    {
      kind: "risk",
      headline: `${driftTop.a.name}: ${driftTop.days}-day referral silence`,
      body: `Historical cadence shows monthly inbound from ${driftTop.a.firm}. The current gap exceeds the attorney's 30-day baseline by a wide margin. Concierge desk recommends a non-transactional touch this week.`,
      attorneyId: driftTop.a.id,
    },
    {
      kind: "opportunity",
      headline: `${opportunity.name}: federal docket activity up this week`,
      body: `Court Connect indexed 3 federal matters where ${opportunity.firm} appeared as counsel of record over the last 5 days. Bail counsel has not yet been retained on two of the matters.`,
      attorneyId: opportunity.id,
    },
    {
      kind: "note",
      headline: `${firmChange?.name ?? "Priya Ramanathan"}: firm address updated per State Bar registry`,
      body: `Monthly bar sweep confirmed the address change. Vault record updated automatically; concierge desk notified to refresh firm collateral on the next visit.`,
      attorneyId: firmChange?.id,
    },
    {
      kind: "insight",
      headline: `${driftCount} platinum and gold attorneys show signs of relationship drift`,
      body: `All have exceeded their historical contact cadence by 2 sigma. Reactivation sequencing has been queued for principal review in the Dormant Watch tab.`,
    },
    {
      kind: "insight",
      headline: `Bay Area federal docket up 23% quarter over quarter`,
      body: `Filing volume at the Northern District is running well above the 5-year average. Redwood City and Oakland offices are well-positioned. Consider routing additional federal intake support to both territories this quarter.`,
    },
  ];
}

function iconFor(kind: BriefingItem["kind"]) {
  if (kind === "risk")
    return (
      <AlertTriangle
        strokeWidth={1.5}
        size={16}
        className="text-vault-oxblood"
      />
    );
  if (kind === "opportunity")
    return (
      <Sparkles strokeWidth={1.5} size={16} className="text-vault-gold" />
    );
  if (kind === "note")
    return <Users strokeWidth={1.5} size={16} className="text-vault-forest" />;
  return (
    <Briefcase strokeWidth={1.5} size={16} className="text-vault-graphite" />
  );
}

function BriefingCard({
  item,
  onOpen,
}: {
  item: BriefingItem;
  onOpen?: () => void;
}) {
  return (
    <Card padding="md" interactive>
      <div className="flex items-start gap-4">
        <div className="h-9 w-9 rounded-full border border-vault-hairline flex items-center justify-center shrink-0">
          {iconFor(item.kind)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl text-vault-ink font-medium tracking-tighter-alt">
            {item.headline}
          </h3>
          <p className="mt-3 text-sm text-vault-graphite leading-relaxed">
            {item.body}
          </p>
          {item.attorneyId ? (
            <div className="mt-4">
              <Button variant="ghost" size="sm" onClick={onOpen}>
                View in Vault →
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Briefing tab
// ============================================================================

function BriefingTab({
  navigate,
}: {
  navigate: (path: string) => void;
}) {
  const items = useMemo(() => buildBriefing(), []);
  const sparkData = HEALTH_SPARK.map((v, i) => ({ i, v }));
  const watches = useMemo(
    () =>
      attorneys
        .filter(
          (a) =>
            a.status === "reactivation" ||
            (a.tier !== "dormant" &&
              a.tier !== "prospect" &&
              daysSince(a.lastContactDate) > 45)
        )
        .sort(
          (x, y) =>
            daysSince(y.lastContactDate) - daysSince(x.lastContactDate)
        )
        .slice(0, 3),
    []
  );

  return (
    <div className="mt-10 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
      <section>
        <div className="flex items-center justify-between pb-3 border-b border-vault-hairline">
          <p className="label-eyebrow-strong">THIS WEEK'S INTELLIGENCE</p>
          <p className="label-eyebrow text-vault-graphite-light">
            UPDATED ·{" "}
            {new Date()
              .toLocaleDateString("en-US", { month: "short", day: "numeric" })
              .toUpperCase()}
          </p>
        </div>
        <div className="mt-6 space-y-5">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: idx * 0.06,
                ease: EASE_VAULT,
              }}
            >
              <BriefingCard
                item={item}
                onOpen={
                  item.attorneyId
                    ? () => navigate(`/attorney/${item.attorneyId}`)
                    : undefined
                }
              />
            </motion.div>
          ))}
        </div>
      </section>

      <aside className="space-y-6">
        <Card padding="md">
          <p className="label-eyebrow">VAULT WEATHER</p>
          <div className="mt-4 flex items-end gap-2">
            <span className="font-display font-light text-5xl text-vault-ink num-mono leading-none tracking-tighter-alt">
              94
            </span>
            <span className="pb-2 font-sans text-sm text-vault-graphite">
              / 100
            </span>
          </div>
          <p className="mt-2 label-eyebrow text-vault-forest">
            NETWORK HEALTH · STRONG
          </p>
          <div className="mt-5 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#1A3D2E"
                  strokeWidth={1.4}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="label-eyebrow text-vault-graphite-light">
            12-WEEK TREND
          </p>
        </Card>

        <Card padding="md">
          <p className="label-eyebrow">ACTIVE WATCHES</p>
          <p className="mt-3 font-display text-lg text-vault-ink tracking-tighter-alt font-medium">
            {watches.length} attorneys flagged for reactivation
          </p>
          <div className="mt-5 space-y-4">
            {watches.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 pb-4 border-b border-vault-hairline last:border-0 last:pb-0"
              >
                <div className="h-8 w-8 rounded-full bg-vault-paper-deep border border-vault-hairline flex items-center justify-center font-display text-[11px] text-vault-ink">
                  {a.avatarInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm text-vault-ink truncate font-medium">
                    {a.name}
                  </p>
                  <p className="label-eyebrow truncate">
                    {formatRelativeShort(daysSince(a.lastContactDate))} ·{" "}
                    {a.ownerOffice.toUpperCase()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/attorney/${a.id}`)}
                  className="label-eyebrow-strong text-vault-ink hover:text-vault-forest transition-colors duration-500 ease-vault"
                >
                  VIEW
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <p className="label-eyebrow">SIGNAL STREAMS</p>
          <div className="mt-5 space-y-3">
            {[
              { name: "Court Connect", sync: "12m ago" },
              { name: "Bar Registry", sync: "2h ago" },
              { name: "Editorial", sync: "4h ago" },
              { name: "Human Layer", sync: "concierge desk" },
            ].map((stream) => (
              <div
                key={stream.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-vault-forest vault-pulse" />
                  <p className="font-sans text-sm text-vault-ink">
                    {stream.name}
                  </p>
                </div>
                <p className="label-eyebrow text-vault-graphite-light">
                  LIVE · {stream.sync.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </aside>
    </div>
  );
}

// ============================================================================
// Dormant Watch tab
// ============================================================================

const REASON_POOL = [
  "Historical cadence broken. No inbound in 90+ days.",
  "Firm change detected. Relationship not yet re-confirmed.",
  "Former volume referrer. Tier downgrade pending.",
  "No response to last three touch attempts.",
  "Concierge note: flagged for principal-only outreach.",
  "Summer trial schedule likely explains silence.",
  "New name partner at firm may be routing intake differently.",
];

function DormantWatchTab({
  navigate,
}: {
  navigate: (path: string) => void;
}) {
  const rows = useMemo(
    () =>
      attorneys
        .filter(
          (a) =>
            a.tier === "dormant" ||
            a.status === "reactivation" ||
            daysSince(a.lastContactDate) > 60
        )
        .map((a) => {
          const days = daysSince(a.lastContactDate);
          const reasonSeed =
            a.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0) * 7;
          const reason = REASON_POOL[reasonSeed % REASON_POOL.length];
          return { attorney: a, days, reason };
        })
        .sort((x, y) => y.days - x.days)
        .slice(0, 18),
    []
  );

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between pb-3 border-b border-vault-hairline">
        <p className="label-eyebrow-strong">
          DORMANT WATCH · REACTIVATION QUEUE
        </p>
        <p className="label-eyebrow text-vault-graphite-light">
          {rows.length} FLAGGED
        </p>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-vault-hairline-deep">
              <th className="text-left py-3 px-2 label-eyebrow-strong">
                Attorney
              </th>
              <th className="text-left py-3 px-2 label-eyebrow-strong hidden md:table-cell">
                Last Contact
              </th>
              <th className="text-left py-3 px-2 label-eyebrow-strong">
                Days Since
              </th>
              <th className="text-left py-3 px-2 label-eyebrow-strong hidden lg:table-cell">
                Reason
              </th>
              <th className="text-left py-3 px-2 label-eyebrow-strong">
                Tier
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ attorney, days, reason }) => (
              <tr
                key={attorney.id}
                className="border-b border-vault-hairline hover:bg-vault-paper-deep transition-colors duration-300"
              >
                <td className="py-3 px-2">
                  <p className="font-sans text-sm text-vault-ink font-medium">
                    {attorney.name}
                  </p>
                  <p className="label-eyebrow truncate">{attorney.firm}</p>
                </td>
                <td className="py-3 px-2 hidden md:table-cell label-eyebrow">
                  {formatRelativeShort(days)}
                </td>
                <td className="py-3 px-2 font-sans text-sm text-vault-ink num-mono font-medium">
                  {days}
                </td>
                <td className="py-3 px-2 hidden lg:table-cell font-sans text-sm text-vault-graphite max-w-md">
                  {reason}
                </td>
                <td className="py-3 px-2">
                  <Badge variant={TIER_BADGE[attorney.tier]}>
                    {attorney.tier}
                  </Badge>
                </td>
                <td className="py-3 px-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/attorney/${attorney.id}`)}
                    className="label-eyebrow-strong text-vault-ink hover:text-vault-forest transition-colors duration-500 ease-vault whitespace-nowrap"
                  >
                    SCHEDULE OUTREACH →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Court Signals tab
// ============================================================================

interface CourtEvent {
  court: string;
  date: string;
  headline: string;
  insight: string;
}

const COURT_EVENTS: CourtEvent[] = [
  {
    court: "LASC Dept 120",
    date: "4/21",
    headline: "Federal arraignment calendar up 15% vs prior week",
    insight:
      "Two high-volume Los Angeles attorneys have filed notices of appearance. Ramanathan Defense LLP is absent from the calendar for the first time in six weeks.",
  },
  {
    court: "USDC ND Cal",
    date: "4/21",
    headline: "New indictments: 4 federal white collar matters filed",
    insight:
      "One matter matches a white collar practice area profile owned by the Redwood City office. Okonkwo Law Offices is historically competitive for federal bail counsel in this docket.",
  },
  {
    court: "Alameda Superior",
    date: "4/20",
    headline: "6 new felony cases with no counsel assigned",
    insight:
      "Public defender conflict roster shows capacity pressure. Private intake opportunity for Oakland-owned attorneys this week.",
  },
  {
    court: "San Diego Superior",
    date: "4/20",
    headline: "Three violent crimes arraignments rescheduled to Thursday",
    insight:
      "Whitfield Trial Group is on the appearance sheet for all three. Bail hearings likely to cluster Thursday afternoon.",
  },
  {
    court: "OC Superior · Westminster",
    date: "4/19",
    headline: "DUI manslaughter case transferred from Central",
    insight:
      "Santa Ana-owned attorneys with DUI manslaughter experience should be flagged. Montrose Trial Advocates historically competes for this profile.",
  },
  {
    court: "Santa Clara Superior",
    date: "4/18",
    headline: "Gang enhancement ruling issued in People v. Becerra",
    insight:
      "The ruling narrows enhancement criteria. Relevant for Kerrigan Law Firm and Stanley & Reyes, both of whom have active matters in this category.",
  },
  {
    court: "USDC CD Cal",
    date: "4/18",
    headline: "Two federal wire fraud matters transferred from SD Cal",
    insight:
      "Venue migration flagged. Bail counsel likely to shift to LA-owned attorneys. Castaneda Criminal Defense is best positioned on historical volume.",
  },
  {
    court: "LA Superior · Compton",
    date: "4/17",
    headline: "Weapons enhancement calendar lighter than usual",
    insight:
      "Opportunity window for attorneys routing lower-volume weapons matters. Brennan Defense Associates typically leads this docket.",
  },
];

function CourtSignalsTab() {
  return (
    <div className="mt-10">
      <div className="flex items-center justify-between pb-3 border-b border-vault-hairline">
        <p className="label-eyebrow-strong">
          COURT SIGNAL FEED · BAY AREA · LA · OC · SD
        </p>
        <p className="label-eyebrow text-vault-graphite-light">
          LIVE · LAST SYNC 12M AGO
        </p>
      </div>
      <div className="mt-6 space-y-5">
        {COURT_EVENTS.map((event, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: idx * 0.04,
              ease: EASE_VAULT,
            }}
            className="pb-5 border-b border-vault-hairline"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="label-eyebrow">
                  {event.court} · {event.date}
                </p>
                <h4 className="mt-2 font-display text-xl text-vault-ink font-medium tracking-tighter-alt">
                  {event.headline}
                </h4>
                <p className="mt-2 text-sm text-vault-graphite leading-relaxed max-w-3xl">
                  {event.insight}
                </p>
              </div>
              <Briefcase
                strokeWidth={1.5}
                size={16}
                className="text-vault-graphite mt-1 shrink-0"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Relationship Drift tab
// ============================================================================

function RelationshipDriftTab() {
  const points = useMemo(
    () =>
      attorneys
        .filter((a) => a.lifetimeVolume > 0)
        .map((a) => ({
          id: a.id,
          name: a.name,
          x: Math.min(365, daysSince(a.lastContactDate)),
          y: a.lifetimeVolume / 1_000_000,
          atRisk:
            daysSince(a.lastContactDate) >= 90 && a.lifetimeVolume >= 500_000,
        })),
    []
  );
  const risk = points.filter((p) => p.atRisk);
  const healthy = points.filter((p) => !p.atRisk);

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between pb-3 border-b border-vault-hairline">
        <p className="label-eyebrow-strong">
          RELATIONSHIP DRIFT · CONTACT RECENCY × LIFETIME VOLUME
        </p>
        <p className="label-eyebrow text-vault-oxblood">
          {risk.length} AT RISK
        </p>
      </div>
      <Card padding="lg" className="mt-6">
        <div className="h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
              <CartesianGrid stroke="#E8E6E0" strokeDasharray="0" />
              <XAxis
                dataKey="x"
                type="number"
                domain={[0, 365]}
                tick={{ fontSize: 10, fill: "#6B6B68" }}
                tickLine={false}
                axisLine={{ stroke: "#E8E6E0" }}
                label={{
                  value: "DAYS SINCE LAST CONTACT",
                  position: "bottom",
                  offset: 12,
                  fill: "#6B6B68",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                }}
              />
              <YAxis
                dataKey="y"
                type="number"
                tick={{ fontSize: 10, fill: "#6B6B68" }}
                tickLine={false}
                axisLine={{ stroke: "#E8E6E0" }}
                tickFormatter={(value) => `$${value}M`}
                label={{
                  value: "LIFETIME VOLUME",
                  position: "insideLeft",
                  angle: -90,
                  offset: 0,
                  fill: "#6B6B68",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                }}
              />
              <ZAxis range={[40, 60]} />
              <Tooltip
                cursor={{ stroke: "#E8E6E0" }}
                contentStyle={{
                  background: "#FAFAF7",
                  border: "1px solid #E8E6E0",
                  borderRadius: 4,
                  fontFamily: "Inter, sans-serif",
                  fontSize: 11,
                }}
                formatter={(value, key) => {
                  const num = typeof value === "number" ? value : Number(value);
                  if (key === "y") return [`$${num.toFixed(2)}M`, "VOLUME"];
                  if (key === "x") return [`${num} DAYS`, "SILENCE"];
                  return [String(value), String(key)];
                }}
                labelFormatter={() => ""}
              />
              <Scatter data={healthy} fill="#1A3D2E" fillOpacity={0.55} />
              <Scatter data={risk} fill="#7A1F1F" fillOpacity={0.9} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-vault-forest" />
            <p className="label-eyebrow">HEALTHY RELATIONSHIPS</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-vault-oxblood" />
            <p className="label-eyebrow">
              90+ DAYS · $500K+ VOLUME · AT RISK
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// Competitive Index tab
// ============================================================================

const MARKET_SHARE: Array<{
  office: BbbOffice;
  share: number;
  delta: string;
  note: string;
}> = [
  {
    office: "San Jose HQ",
    share: 0.38,
    delta: "+2 PTS QTD",
    note: "Dominant in Santa Clara. Capacity pressure on SV Legal Bail Co.",
  },
  {
    office: "Los Angeles",
    share: 0.29,
    delta: "+1 PT QTD",
    note: "LA County share rising. Aladdin Bail Bonds slipping in Compton and Inglewood.",
  },
  {
    office: "Oakland",
    share: 0.22,
    delta: "FLAT",
    note: "Alameda stable. East Bay federal docket recently competitive with All-Pro Bail Bonds.",
  },
  {
    office: "Santa Ana",
    share: 0.19,
    delta: "+1 PT QTD",
    note: "Orange County growth. DUI intake recovering after summer dip.",
  },
  {
    office: "San Diego",
    share: 0.17,
    delta: "-1 PT QTD",
    note: "Share softening. New entrant in La Jolla pulling higher-value white collar referrals.",
  },
  {
    office: "Redwood City",
    share: 0.16,
    delta: "+1 PT QTD",
    note: "Peninsula federal caseload rising. Positioned well for northern district migration.",
  },
];

function CompetitiveIndexTab() {
  return (
    <div className="mt-10">
      <div className="flex items-center justify-between pb-3 border-b border-vault-hairline">
        <p className="label-eyebrow-strong">
          COMPETITIVE INDEX · ESTIMATED BAIL REFERRAL SHARE
        </p>
        <p className="label-eyebrow text-vault-graphite-light">
          MODELED · TRAILING 90 DAYS
        </p>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {MARKET_SHARE.map((row, idx) => (
          <motion.div
            key={row.office}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: idx * 0.05,
              ease: EASE_VAULT,
            }}
          >
            <Card padding="md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="label-eyebrow">{row.office.toUpperCase()}</p>
                  <p className="mt-2 font-display font-light text-4xl text-vault-ink num-mono tracking-tighter-alt">
                    {Math.round(row.share * 100)}%
                  </p>
                  <p className="mt-1 label-eyebrow text-vault-forest">
                    {row.delta}
                  </p>
                </div>
                <div className="w-24 h-20 flex items-end">
                  <div className="w-full bg-vault-paper-deep h-full flex items-end">
                    <div
                      className="w-full bg-vault-ink"
                      style={{ height: `${Math.round(row.share * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-vault-graphite leading-relaxed">
                {row.note}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function Intelligence() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Briefing");

  return (
    <PageShell>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_VAULT }}
      >
        <p className="label-eyebrow">INTELLIGENCE · SIGNAL GRID</p>
        <h1 className="mt-4 font-display font-light text-6xl text-vault-ink tracking-tightest leading-[0.95]">
          Intelligence
        </h1>
        <p className="mt-5 text-lg font-light text-vault-graphite max-w-2xl leading-relaxed">
          Signals derived from the vault. Updated continuously. Acted on by
          intention.
        </p>
      </motion.header>

      <nav
        className="mt-10 border-b border-vault-hairline flex items-center gap-1 overflow-x-auto"
        role="tablist"
      >
        {TABS.map((entry) => {
          const active = entry === tab;
          return (
            <button
              key={entry}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(entry)}
              className={cn(
                "relative px-4 py-3 font-sans text-[11px] uppercase tracking-wider-alt font-semibold whitespace-nowrap transition-colors duration-500 ease-vault",
                active
                  ? "text-vault-ink"
                  : "text-vault-graphite hover:text-vault-ink"
              )}
            >
              {entry}
              {active ? (
                <motion.span
                  layoutId="intel-underline"
                  className="absolute left-3 right-3 -bottom-px h-px bg-vault-ink"
                />
              ) : null}
            </button>
          );
        })}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: EASE_VAULT }}
        >
          {tab === "Briefing" ? (
            <BriefingTab navigate={navigate} />
          ) : tab === "Dormant Watch" ? (
            <DormantWatchTab navigate={navigate} />
          ) : tab === "Court Signals" ? (
            <CourtSignalsTab />
          ) : tab === "Relationship Drift" ? (
            <RelationshipDriftTab />
          ) : (
            <CompetitiveIndexTab />
          )}
        </motion.div>
      </AnimatePresence>
    </PageShell>
  );
}

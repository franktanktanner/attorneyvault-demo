import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Briefcase,
  ChevronRight,
  Sparkles,
  Users,
} from "lucide-react";

import { PageShell } from "../components/layout/PageShell";
import { Divider } from "../components/ui/Divider";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { StatTile } from "../components/ui/StatTile";
import { VaultSeal } from "../components/vault/VaultSeal";
import {
  attorneys,
  timelineEntries,
  type Attorney,
  type AttorneyTier,
} from "../lib/mockData";
import { cn } from "../lib/utils";

const EASE_VAULT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const SPARK_VOLUME = [8, 9, 11, 10, 13, 14, 12, 15, 17, 16, 19, 21];
const SPARK_REFERRERS = [72, 74, 78, 81, 82, 84, 85, 86, 88, 87, 89, 89];
const SPARK_ACTIVE = [210, 214, 219, 223, 228, 232, 236, 239, 241, 244, 246, 247];
const SPARK_DORMANT = [48, 46, 44, 43, 41, 39, 38, 37, 36, 35, 34, 34];

const TIER_BADGE: Record<AttorneyTier, "gold" | "neutral" | "outline" | "oxblood"> = {
  platinum: "gold",
  gold: "gold",
  silver: "neutral",
  bronze: "outline",
  prospect: "outline",
  dormant: "oxblood",
};

const TIER_AVATAR: Record<AttorneyTier, string> = {
  platinum: "bg-vault-gold text-vault-paper",
  gold: "bg-vault-gold-light text-vault-paper",
  silver: "bg-vault-graphite text-vault-paper",
  bronze: "bg-vault-hairline-deep text-vault-ink",
  prospect: "bg-transparent border border-vault-hairline text-vault-graphite",
  dormant: "bg-vault-oxblood text-vault-paper",
};

function daysSince(iso: string): number {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  );
}

function hoursSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000));
}

function formatRelativeShort(days: number): string {
  if (days < 1) return "TODAY";
  if (days === 1) return "1 DAY AGO";
  if (days < 30) return `${days} DAYS AGO`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} MO AGO`;
  return `${Math.floor(days / 365)}Y AGO`;
}

function formatHoursShort(hours: number): string {
  if (hours < 1) return "NOW";
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.floor(hours / 24);
  return `${days}D AGO`;
}

interface BriefingItem {
  kind: "risk" | "opportunity" | "note" | "insight";
  headline: string;
  body: string;
  attorneyId?: string;
}

function buildHomeBriefing(): BriefingItem[] {
  const active = attorneys.filter(
    (a) =>
      (a.tier === "platinum" || a.tier === "gold") && a.status === "active"
  );
  const drifting = active
    .map((a) => ({ a, days: daysSince(a.lastReferralDate) }))
    .sort((x, y) => y.days - x.days);
  const driftTop = drifting[0];
  const opportunity =
    active.find((a) => a.tier === "platinum" && a.id !== driftTop?.a.id) ??
    active[0];
  const driftCount = active.filter(
    (a) => daysSince(a.lastReferralDate) > 30
  ).length;

  return [
    {
      kind: "risk",
      headline: `${driftTop.a.name}: ${driftTop.days}-day referral silence`,
      body: `Historical cadence shows monthly inbound from ${driftTop.a.firm}. The current gap exceeds the attorney's 30-day baseline. Concierge desk recommends a non-transactional touch this week.`,
      attorneyId: driftTop.a.id,
    },
    {
      kind: "opportunity",
      headline: `${opportunity.name}: federal docket activity up this week`,
      body: `Court Connect indexed 3 federal matters where ${opportunity.firm} appeared as counsel of record over the last 5 days. Bail counsel has not yet been retained on two of the matters.`,
      attorneyId: opportunity.id,
    },
    {
      kind: "insight",
      headline: `${driftCount} platinum and gold attorneys show signs of relationship drift`,
      body: `All have exceeded their historical contact cadence by 2 sigma. Reactivation sequencing has been queued for principal review in the Intelligence briefing.`,
    },
  ];
}

function iconFor(kind: BriefingItem["kind"]) {
  if (kind === "risk")
    return (
      <AlertTriangle strokeWidth={1.5} size={16} className="text-vault-oxblood" />
    );
  if (kind === "opportunity")
    return <Sparkles strokeWidth={1.5} size={16} className="text-vault-gold" />;
  if (kind === "note")
    return <Users strokeWidth={1.5} size={16} className="text-vault-forest" />;
  return (
    <Briefcase strokeWidth={1.5} size={16} className="text-vault-graphite" />
  );
}

function ReactivationRow({
  attorney,
  onOpen,
}: {
  attorney: Attorney;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full flex items-center gap-4 py-4 border-b border-vault-hairline last:border-0 hover:bg-vault-paper-deep transition-colors duration-300 ease-vault group"
    >
      <div
        className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center font-display text-[11px] font-light shrink-0",
          TIER_AVATAR[attorney.tier]
        )}
      >
        {attorney.avatarInitials}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="font-sans text-sm text-vault-ink font-medium truncate">
          {attorney.name}
        </p>
        <p className="label-eyebrow truncate">{attorney.firm}</p>
      </div>
      <div className="hidden md:flex flex-col items-end shrink-0">
        <p className="label-eyebrow-strong text-vault-ink">
          {formatRelativeShort(daysSince(attorney.lastContactDate))}
        </p>
        <p className="label-eyebrow text-vault-graphite-light">LAST CONTACT</p>
      </div>
      <Badge variant={TIER_BADGE[attorney.tier]}>{attorney.tier}</Badge>
      <span className="label-eyebrow-strong text-vault-graphite group-hover:text-vault-ink transition-colors duration-300 ease-vault hidden sm:inline-flex items-center gap-1">
        OPEN PROFILE
        <ChevronRight strokeWidth={1.5} size={12} />
      </span>
    </button>
  );
}

function InboundRow({
  attorney,
  summary,
  channel,
  iso,
  onOpen,
}: {
  attorney: Attorney;
  summary: string;
  channel: string;
  iso: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full grid grid-cols-[auto_1fr_auto] items-start gap-4 py-4 border-b border-vault-hairline last:border-0 hover:bg-vault-paper-deep transition-colors duration-300 ease-vault text-left group"
    >
      <Badge variant="gold">REFERRAL</Badge>
      <div className="min-w-0">
        <p className="font-sans text-sm text-vault-ink font-medium">
          {attorney.name}{" "}
          <span className="font-normal text-vault-graphite">· {attorney.firm}</span>
        </p>
        <p className="mt-1 text-sm text-vault-graphite leading-relaxed">
          {summary}
        </p>
        <p className="mt-1 label-eyebrow text-vault-graphite-light">
          {channel.toUpperCase()}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="label-eyebrow-strong text-vault-ink">
          {formatHoursShort(hoursSince(iso))}
        </p>
      </div>
    </button>
  );
}

export default function VaultHome() {
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greet =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const briefing = useMemo(() => buildHomeBriefing(), []);

  const reactivation = useMemo(() => {
    return attorneys
      .filter((a) => a.tier === "platinum" || a.tier === "gold")
      .map((a) => ({ a, days: daysSince(a.lastContactDate) }))
      .sort((x, y) => y.days - x.days)
      .slice(0, 5)
      .map((x) => x.a);
  }, []);

  const recentInbound = useMemo(() => {
    return timelineEntries
      .filter((e) => e.type === "referral")
      .map((e) => {
        const attorney = attorneys.find((a) => a.id === e.attorneyId);
        return attorney ? { entry: e, attorney } : null;
      })
      .filter((x): x is { entry: typeof timelineEntries[number]; attorney: Attorney } => x !== null)
      .sort(
        (a, b) =>
          new Date(b.entry.timestamp).getTime() -
          new Date(a.entry.timestamp).getTime()
      )
      .slice(0, 3);
  }, []);

  return (
    <PageShell>
      <header className="flex items-start justify-between gap-10">
        <div>
          <p className="label-eyebrow">VAULT HOME · PRIVATE INTELLIGENCE</p>
          <h1 className="mt-4 font-display font-light text-6xl text-vault-ink tracking-tightest leading-[0.95]">
            {greet}, Jeffrey.
          </h1>
          <p className="mt-5 text-lg text-vault-graphite max-w-xl leading-relaxed">
            Your vault is secured. 247 attorneys under active intelligence.
          </p>
        </div>
        <VaultSeal size={72} timestamp="SEALED 21:47 PT" />
      </header>

      <div className="mt-14">
        <Divider label="FOUNDATION READY" />
      </div>

      <section className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatTile
          label="Total Attorneys"
          value={247}
          sparkline={SPARK_ACTIVE}
          delta={{ value: "+14 this quarter", direction: "up" }}
        />
        <StatTile
          label="Active Referrers"
          value={89}
          sparkline={SPARK_REFERRERS}
          delta={{ value: "+3 vs. last month", direction: "up" }}
        />
        <StatTile
          label="Lifetime Volume"
          value={14820000}
          format="currency"
          sparkline={SPARK_VOLUME}
          delta={{ value: "+$1.2M QTD", direction: "up" }}
        />
        <StatTile
          label="Dormant Relationships"
          value={34}
          sparkline={SPARK_DORMANT}
          delta={{ value: "-4 reactivated", direction: "down" }}
        />
      </section>

      <section className="mt-16">
        <div className="flex items-end justify-between pb-3 border-b border-vault-hairline">
          <div>
            <p className="label-eyebrow">MORNING DIGEST · CURATED FOR PRINCIPAL</p>
            <h2 className="mt-2 font-display font-light text-3xl text-vault-ink tracking-tighter-alt">
              Today's Briefing
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate("/intelligence")}
            className="label-eyebrow-strong text-vault-graphite hover:text-vault-ink transition-colors duration-500 ease-vault hidden md:inline-flex items-center gap-1"
          >
            FULL INTELLIGENCE
            <ChevronRight strokeWidth={1.5} size={12} />
          </button>
        </div>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {briefing.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.05 * idx,
                ease: EASE_VAULT,
              }}
            >
              <Card padding="md" interactive className="h-full flex flex-col">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full border border-vault-hairline flex items-center justify-center shrink-0">
                    {iconFor(item.kind)}
                  </div>
                  <p className="label-eyebrow mt-2">
                    {item.kind === "risk"
                      ? "DRIFT SIGNAL"
                      : item.kind === "opportunity"
                      ? "OPPORTUNITY"
                      : "NETWORK INSIGHT"}
                  </p>
                </div>
                <h3 className="mt-4 font-display text-lg text-vault-ink tracking-tighter-alt font-medium">
                  {item.headline}
                </h3>
                <p className="mt-3 text-sm text-vault-graphite leading-relaxed flex-1">
                  {item.body}
                </p>
                {item.attorneyId ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/attorney/${item.attorneyId}`)}
                    className="mt-4 self-start label-eyebrow-strong text-vault-ink hover:text-vault-forest transition-colors duration-500 ease-vault inline-flex items-center gap-1"
                  >
                    VIEW IN VAULT
                    <ChevronRight strokeWidth={1.5} size={12} />
                  </button>
                ) : null}
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12">
        <div>
          <div className="flex items-end justify-between pb-3 border-b border-vault-hairline">
            <div>
              <p className="label-eyebrow">DORMANT · WORTH A CALL</p>
              <h2 className="mt-2 font-display font-light text-3xl text-vault-ink tracking-tighter-alt">
                Reactivation Queue
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/intelligence")}
              className="label-eyebrow-strong text-vault-graphite hover:text-vault-ink transition-colors duration-500 ease-vault hidden md:inline-flex items-center gap-1"
            >
              VIEW ALL
              <ChevronRight strokeWidth={1.5} size={12} />
            </button>
          </div>
          <div className="mt-2">
            {reactivation.map((attorney) => (
              <ReactivationRow
                key={attorney.id}
                attorney={attorney}
                onOpen={() => navigate(`/attorney/${attorney.id}`)}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-end justify-between pb-3 border-b border-vault-hairline">
            <div>
              <p className="label-eyebrow">LAST 72 HOURS</p>
              <h2 className="mt-2 font-display font-light text-3xl text-vault-ink tracking-tighter-alt">
                Recent Inbound
              </h2>
            </div>
          </div>
          <div className="mt-2">
            {recentInbound.map(({ entry, attorney }) => (
              <InboundRow
                key={entry.id}
                attorney={attorney}
                summary={entry.summary}
                channel={entry.channel}
                iso={entry.timestamp}
                onOpen={() => navigate(`/attorney/${attorney.id}`)}
              />
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

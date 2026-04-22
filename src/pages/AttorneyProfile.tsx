import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  Download,
  Edit,
  Mail,
  MessageSquare,
  Phone,
  Shield,
  Sparkles,
  User,
} from "lucide-react";

import { PageShell } from "../components/layout/PageShell";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Divider } from "../components/ui/Divider";
import { StatTile } from "../components/ui/StatTile";
import { Tag } from "../components/ui/Tag";
import { VaultSeal } from "../components/vault/VaultSeal";
import {
  attorneys,
  type Attorney,
  type AttorneyStatus,
  type AttorneyTier,
  type BbbOffice,
} from "../lib/mockData";
import { cn, formatCompactCurrency } from "../lib/utils";

// ============================================================================
// Constants
// ============================================================================

const EASE_VAULT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const TIER_EYEBROW: Record<AttorneyTier, string> = {
  platinum: "PLATINUM VAULT · TOP RELATIONSHIP",
  gold: "GOLD VAULT · CORE REFERRER",
  silver: "SILVER VAULT · ACTIVE NETWORK",
  bronze: "BRONZE VAULT · EMERGING RELATIONSHIP",
  prospect: "PROSPECT VAULT · TARGETED INTRODUCTION",
  dormant: "DORMANT VAULT · REACTIVATION CANDIDATE",
};

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

type BadgeVariant = "neutral" | "forest" | "gold" | "oxblood" | "outline";

const STATUS_LABEL: Record<
  AttorneyStatus,
  { label: string; variant: BadgeVariant }
> = {
  active: { label: "ACTIVE", variant: "forest" },
  warm: { label: "WARM", variant: "neutral" },
  cold: { label: "COLD", variant: "outline" },
  dormant: { label: "DORMANT", variant: "oxblood" },
  reactivation: { label: "REACTIVATION", variant: "outline" },
};

const OFFICE_MANAGER: Record<BbbOffice, string> = {
  "San Jose HQ": "Dominic Reyes",
  Oakland: "Marisela Torres",
  "Redwood City": "Claudia Weston",
  "Los Angeles": "Anton Kowalski",
  "Santa Ana": "Gabriela Moreno",
  "San Diego": "Preston Ballard",
};

// ============================================================================
// Deterministic PRNG and helpers
// ============================================================================

function hashId(id: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function seededUnit(seed: number, step: number): number {
  const x = Math.sin(seed * 12.9898 + step * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function seededInt(min: number, max: number, seed: number, step: number): number {
  return Math.floor(min + seededUnit(seed, step) * (max - min + 1));
}

function seededPick<T>(arr: T[], seed: number, step: number): T {
  return arr[Math.floor(seededUnit(seed, step) * arr.length)];
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function hoursAgoIso(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

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

function formatAbsoluteShort(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

function formatClock(iso: string): string {
  return new Date(iso)
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
}

function formatAdmittedYear(yearsAdmitted: number): number {
  return new Date().getFullYear() - yearsAdmitted;
}

// ============================================================================
// Timeline generation
// ============================================================================

type TimelineKind =
  | "referral"
  | "in_person"
  | "gift"
  | "event"
  | "call"
  | "text"
  | "email"
  | "note";

const TIMELINE_META: Record<
  TimelineKind,
  { label: string; variant: BadgeVariant }
> = {
  referral: { label: "REFERRAL", variant: "gold" },
  in_person: { label: "IN PERSON", variant: "forest" },
  gift: { label: "GIFT", variant: "gold" },
  event: { label: "EVENT", variant: "forest" },
  call: { label: "CALL", variant: "neutral" },
  text: { label: "TEXT", variant: "neutral" },
  email: { label: "EMAIL", variant: "neutral" },
  note: { label: "NOTE", variant: "outline" },
};

const DEFENDANT_FIRSTS = [
  "Miguel", "Carla", "Andre", "Lena", "Raj", "Tomas", "Nia", "Julian",
  "Sasha", "Bianca", "Desmond", "Imani", "Carlos", "Amira", "Hassan",
  "Soledad", "Bruno", "Tiana", "Kenji", "Paloma",
];

const DEFENDANT_LASTS = [
  "Delgado", "Washington", "Keller", "Santos", "Bravo", "Ortiz",
  "Solomon", "Pierce", "Castro", "Larkin", "Crane", "Matsuda",
  "Vega", "Okafor", "Priest", "Alvarez", "Monroe", "Ibanez",
  "Nakashima", "Ramos",
];

const SUMMARY_TEMPLATES: Record<TimelineKind, string[]> = {
  referral: [
    "Referred {defendant}. {bond} bond posted. Active payment plan.",
    "Inbound referral: {defendant} weapons matter. Bond posted same day via {office} desk.",
    "Federal matter for {defendant}. Coordinated intake with HQ concierge.",
    "Referred {defendant} on a {bond} posting. Released by 6:40 PM, family notified.",
  ],
  in_person: [
    "Lunch at Drago Centro. Discussed Q4 referral volume and summer associate program.",
    "Coffee at Birch. Reviewed upcoming arraignment calendar and two federal intakes.",
    "Meeting at courthouse cafe after morning calendar. Confirmed CLE speaking slot.",
    "Stopped by firm office. Reviewed preferred intake flow with {assistant}.",
  ],
  gift: [
    "Holiday care package delivered via concierge desk. Signed for at {time}.",
    "Hand-delivered leather-bound bar registry annual. Receipt confirmed by {assistant}.",
    "Signed California criminal defense treatise sent to the firm. Thank-you note received.",
    "Courtside seats delivered for the Clippers matinee. Attendance confirmed.",
  ],
  event: [
    "Spotted at LA County Bar CLE. Acknowledged and passed card.",
    "Hosted at Warriors private box. Stayed through the third quarter.",
    "Attended Federal Bar annual dinner. Introduced to panel moderator.",
    "Seen at Hastings reunion mixer. Warm handshake, brief catch-up.",
  ],
  call: [
    "Follow-up on pending arraignment. Voicemail left at direct line.",
    "Confirmed availability for Friday strategy call.",
    "Discussed client intake process and bond posting cadence.",
    "Spoke with {assistant}. Message relayed, callback scheduled.",
  ],
  text: [
    "Confirmed next-day posting for weekend booking.",
    "Quick thank-you for the {defendant} referral. Responded with acknowledgement.",
    "Forwarded after-hours contact protocol.",
    "Inbound text from direct line: asking about Friday posting availability.",
  ],
  email: [
    "Sent Q1 volume summary and projected trajectory.",
    "Shared updated concierge contact roster for firm assistants.",
    "Reply-all thread on multi-defendant federal case coordination.",
    "Inbound: requesting sealed records routing for federal white collar intake.",
  ],
  note: [
    "Prefers Tuesday calls after 2 PM. Avoid Friday trial prep window.",
    "Prefers text over call for status updates.",
    "Noted aversion to generic gift baskets. Prefers handwritten books.",
    "{assistant} handles calendar. Route all scheduling through her directly.",
  ],
};

interface TimelineRow {
  id: string;
  kind: TimelineKind;
  summary: string;
  daysAgo: number;
  timestamp: string;
  actor: string;
  channel: string;
}

const TIMELINE_SEQUENCE: TimelineKind[] = [
  "referral",
  "call",
  "in_person",
  "text",
  "email",
  "gift",
  "note",
  "referral",
  "event",
  "call",
];

const TIMELINE_DAY_SLOTS = [2, 5, 9, 15, 22, 31, 48, 67, 95, 128];

function buildTimeline(attorney: Attorney): TimelineRow[] {
  const seed = hashId(attorney.id);
  return TIMELINE_SEQUENCE.map((kind, idx) => {
    const jitter = seededInt(0, 2, seed, idx + 1);
    const daysAgo = TIMELINE_DAY_SLOTS[idx] + jitter;
    const templates = SUMMARY_TEMPLATES[kind];
    const template = seededPick(templates, seed, idx + 10);
    const defendant = `${seededPick(
      DEFENDANT_FIRSTS,
      seed,
      idx + 20
    )} ${seededPick(DEFENDANT_LASTS, seed, idx + 30)}`;
    const bondSeed = 0.6 + seededUnit(seed, idx + 40) * 1.0;
    const bond = Math.round((attorney.averageBondSize * bondSeed) / 500) * 500;
    const summary = template
      .replace("{defendant}", defendant)
      .replace("{bond}", formatCompactCurrency(bond))
      .replace("{office}", attorney.ownerOffice)
      .replace("{assistant}", attorney.assistant)
      .replace("{time}", "2:14 PM");

    const actor =
      kind === "referral"
        ? "Intake Desk"
        : kind === "gift"
        ? "Concierge Desk"
        : kind === "event"
        ? "Regional Partner"
        : kind === "in_person"
        ? "Principal"
        : kind === "note"
        ? "Principal"
        : "Relationship Desk";

    const channel =
      kind === "call"
        ? "Direct line"
        : kind === "text"
        ? "SMS"
        : kind === "email"
        ? "Vault Outbound"
        : kind === "in_person"
        ? "In person"
        : kind === "gift"
        ? "Concierge"
        : kind === "event"
        ? "Hospitality"
        : kind === "referral"
        ? "Vault Intake"
        : "Internal";

    return {
      id: `tl-${attorney.id}-${idx}`,
      kind,
      summary,
      daysAgo,
      timestamp: daysAgoIso(daysAgo),
      actor,
      channel,
    };
  });
}

// ============================================================================
// Bonds generation
// ============================================================================

type BondStatus = "active" | "paid" | "forfeited" | "pending";

const BOND_STATUS_META: Record<
  BondStatus,
  { label: string; variant: BadgeVariant }
> = {
  active: { label: "ACTIVE", variant: "neutral" },
  paid: { label: "PAID IN FULL", variant: "forest" },
  forfeited: { label: "FORFEITED", variant: "oxblood" },
  pending: { label: "PENDING", variant: "outline" },
};

const CHARGES = [
  "PC 187 Homicide",
  "PC 245 Assault with Deadly Weapon",
  "VC 23152 DUI",
  "HS 11351 Drug Possession for Sale",
  "PC 422 Criminal Threats",
  "PC 273.5 Domestic Violence",
  "PC 459 Burglary",
  "PC 487 Grand Theft",
  "PC 182 Conspiracy",
  "PC 211 Robbery",
  "18 USC 1343 Wire Fraud",
  "18 USC 371 Federal Conspiracy",
];

interface BondRow {
  id: string;
  defendant: string;
  amount: number;
  status: BondStatus;
  referredDaysAgo: number;
  referredIso: string;
  charge: string;
  office: BbbOffice;
}

function buildBonds(attorney: Attorney): BondRow[] {
  const seed = hashId(attorney.id);
  const count = 8;
  return Array.from({ length: count }, (_, i) => {
    const defendant = `${seededPick(
      DEFENDANT_FIRSTS,
      seed,
      i + 50
    )} ${seededPick(DEFENDANT_LASTS, seed, i + 60)}`;
    const bandCenter = Math.max(5000, attorney.averageBondSize || 25000);
    const amount = Math.max(
      2500,
      Math.round((bandCenter * (0.45 + seededUnit(seed, i + 70) * 1.3)) / 500) *
        500
    );
    const statusIdx = Math.floor(seededUnit(seed, i + 80) * 10);
    const status: BondStatus =
      statusIdx < 4
        ? "active"
        : statusIdx < 7
        ? "paid"
        : statusIdx < 9
        ? "pending"
        : "forfeited";
    const referredDaysAgo = 7 + i * 28 + seededInt(0, 10, seed, i + 90);
    return {
      id: `bond-${attorney.id}-${i}`,
      defendant,
      amount,
      status,
      referredDaysAgo,
      referredIso: daysAgoIso(referredDaysAgo),
      charge: seededPick(CHARGES, seed, i + 100),
      office: attorney.ownerOffice,
    };
  });
}

// ============================================================================
// Audit generation
// ============================================================================

interface AuditRow {
  id: string;
  action: string;
  actor: string;
  timestampIso: string;
  detail: string;
}

const AUDIT_TEMPLATES: Array<{ action: string; detail: string }> = [
  { action: "ATTORNEY_VIEWED", detail: "Profile accessed from Rolodex" },
  { action: "NOTE_ADDED", detail: "Relationship note appended" },
  { action: "TAG_APPLIED", detail: "Trusted Circle tag applied" },
  { action: "CONTACT_LOGGED", detail: "Coffee meeting logged" },
  { action: "TIER_UPGRADED", detail: "Tier upgrade recorded" },
  { action: "EXPORT_GENERATED", detail: "Quarterly intelligence export PDF" },
  { action: "ENRICHMENT_RUN", detail: "CourtConnect enrichment completed" },
];

const AUDIT_ACTORS = [
  "C. Jeffrey Stanley",
  "Marta Beltran",
  "Intake Desk",
  "Concierge Desk",
  "Relationship Desk",
];

function buildAudit(attorney: Attorney): AuditRow[] {
  const seed = hashId(attorney.id);
  return Array.from({ length: 5 }, (_, i) => {
    const tpl =
      AUDIT_TEMPLATES[
        (i * 3 + Math.floor(seededUnit(seed, i + 200) * 3)) %
          AUDIT_TEMPLATES.length
      ];
    const actor =
      AUDIT_ACTORS[
        (i + Math.floor(seededUnit(seed, i + 210) * 2)) % AUDIT_ACTORS.length
      ];
    const hours = i * 14 + seededInt(0, 6, seed, i + 220);
    return {
      id: `audit-${attorney.id}-${i}`,
      action: tpl.action,
      actor,
      timestampIso: hoursAgoIso(hours),
      detail: tpl.detail,
    };
  });
}

// ============================================================================
// Relationship health
// ============================================================================

type HealthLevel = "strong" | "warming" | "cooling";

interface HealthState {
  level: HealthLevel;
  label: string;
  color: string;
  description: string;
}

function computeHealth(attorney: Attorney): HealthState {
  const days = daysSince(attorney.lastContactDate);
  if (days < 30) {
    return {
      level: "strong",
      label: "STRONG · ACTIVE CADENCE",
      color: "text-vault-forest",
      description: `Contact within the last ${days} days. Referral flow is consistent with tier expectations. Maintain current touchpoint cadence through the quarter.`,
    };
  }
  if (days < 90) {
    return {
      level: "warming",
      label: "WARMING DRIFT · RE-ENGAGE RECOMMENDED",
      color: "text-vault-gold",
      description: `Last contact was ${days} days ago. Referral cadence is holding but the relationship temperature is cooling at the margins. Schedule a light, non-transactional touch this week.`,
    };
  }
  return {
    level: "cooling",
    label: "COOLING · REACTIVATION PRIORITY",
    color: "text-vault-oxblood",
    description: `No contact in ${days} days. Historical referral volume suggests this relationship has not been formally reactivated. Reach out with a personal note before any transactional outreach.`,
  };
}

function computeNextAction(
  attorney: Attorney,
  health: HealthState,
  bonds: BondRow[]
): { title: string; reason: string } {
  if (attorney.tier === "prospect") {
    return {
      title: "Schedule targeted introduction",
      reason: `${attorney.name} has not yet referred a matter. A warm introduction through a mutual contact at the ${attorney.county} County bar will materially raise the odds of a first referral before Q3.`,
    };
  }
  if (health.level === "cooling" || attorney.tier === "dormant") {
    return {
      title: "Reactivation outreach",
      reason: `Send a hand-written note acknowledging historical volume. Follow with a private coffee invitation at ${attorney.ownerOffice}. Avoid any transactional ask in the first touch.`,
    };
  }
  if (health.level === "warming") {
    return {
      title: "Schedule 30-minute coffee",
      reason: `Offer two dates in the next ten business days. Purpose is non-transactional: reconnect, surface any intake-side friction, reconfirm after-hours contact protocol.`,
    };
  }
  const recentReferral = bonds[0];
  return {
    title: `Send thank-you for the ${recentReferral.defendant} referral`,
    reason: `The ${formatCompactCurrency(
      recentReferral.amount
    )} posting on ${formatAbsoluteShort(
      recentReferral.referredIso
    )} is the most recent inbound. A specific, named acknowledgement from the principal closes the loop cleanly.`,
  };
}

function composeEmailPreview(
  attorney: Attorney,
  bonds: BondRow[]
): { subject: string; body: string } {
  const firstName = attorney.name.split(" ")[0].replace(".", "");
  const recent = bonds[0];
  const body = `${firstName},\n\nWanted to close the loop on the ${recent.defendant} posting last ${formatAbsoluteShort(
    recent.referredIso
  ).split(" ")[0]}. Concierge flagged everything as clean on our side, and our intake team was impressed with how quickly your office routed the paperwork. That makes the ${
    attorney.lifetimeReferrals
  }th referral we have worked through together at ${attorney.firm}.\n\nIf the calendar allows, I would like to grab a short coffee in the next two weeks. No agenda beyond saying thank you and hearing how the back half of the year is shaping up for you.\n\nAs always, direct line is good.\n\nJeff`;
  return {
    subject: `RE: Quick catch-up`,
    body,
  };
}

// ============================================================================
// Subcomponents
// ============================================================================

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-vault-hairline">
      <p className="label-eyebrow-strong">{label}</p>
    </div>
  );
}

function ZoneBanner({ tier }: { tier: AttorneyTier }) {
  if (tier !== "platinum" && tier !== "gold") return null;
  const zoneLabel =
    tier === "platinum"
      ? "PLATINUM VAULT · ELEVATED PERMISSIONS REQUIRED"
      : "GOLD VAULT · ELEVATED PERMISSIONS REQUIRED";
  return (
    <div className="mt-6 flex items-center justify-between gap-4 px-5 py-4 bg-vault-paper-deep border border-vault-hairline rounded-[6px]">
      <div className="flex items-center gap-3">
        <Shield
          strokeWidth={1.5}
          size={16}
          className="text-vault-gold"
        />
        <span className="font-sans text-[11px] uppercase tracking-wider-alt font-semibold text-vault-gold">
          {zoneLabel}
        </span>
      </div>
      <p className="label-eyebrow text-vault-graphite-light hidden md:block">
        This record requires additional clearance for export or deletion.
      </p>
    </div>
  );
}

function Hero({ attorney }: { attorney: Attorney }) {
  const eyebrow = TIER_EYEBROW[attorney.tier];
  const status = STATUS_LABEL[attorney.status];
  const primaryTag = attorney.tags[0];
  const secondaryTag = attorney.tags[1];
  const sealedRelative = formatRelativeShort(
    daysSince(attorney.lastContactDate)
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_VAULT }}
      className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-start"
    >
      <div>
        <p className="label-eyebrow text-vault-gold">{eyebrow}</p>
        <h1 className="mt-2 font-display font-light text-6xl xl:text-7xl text-vault-ink tracking-tightest leading-[0.95]">
          {attorney.name}
        </h1>
        <p className="mt-3 text-xl font-light text-vault-graphite">
          {attorney.firm} · {attorney.city} · {attorney.county} County
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Badge variant={TIER_BADGE[attorney.tier]}>{attorney.tier}</Badge>
          <Badge variant={status.variant}>{status.label}</Badge>
          {primaryTag ? <Tag tone="forest">{primaryTag}</Tag> : null}
          {secondaryTag ? <Tag>{secondaryTag}</Tag> : null}
        </div>
        <p className="mt-6 text-base text-vault-graphite max-w-2xl leading-relaxed">
          Active referrer since {formatAdmittedYear(attorney.yearsAdmitted)}.
          Practices {attorney.practiceAreas.slice(0, 2).join(" and ")} across{" "}
          {attorney.city} and {attorney.county} County. Strongest monthly
          referral cadence in the {attorney.ownerOffice} territory.
        </p>
      </div>

      <div className="flex flex-col items-start lg:items-center lg:min-w-[160px]">
        <VaultSeal
          size={96}
          timestamp={`SEALED · ${sealedRelative}`}
        />
        <p className="mt-4 label-eyebrow text-vault-graphite-light">
          VAULT RECORD · {attorney.id.toUpperCase()}
        </p>
      </div>
    </motion.section>
  );
}

function StatsStrip({
  attorney,
  bonds,
}: {
  attorney: Attorney;
  bonds: BondRow[];
}) {
  const ninetyDayBonds = bonds.filter((b) => b.referredDaysAgo <= 90);
  const qtdVolume = ninetyDayBonds.reduce((sum, b) => sum + b.amount, 0);
  const networkAvg = 0.56;
  const convDelta = Math.round((attorney.conversionRate - networkAvg) * 100);
  const convSign = convDelta >= 0 ? "+" : "";

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: EASE_VAULT }}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
    >
      <StatTile
        label="Lifetime Referral Volume"
        value={attorney.lifetimeVolume}
        format="currency"
        delta={{
          value: `+${formatCompactCurrency(qtdVolume)} QTD`,
          direction: "up",
        }}
        sparkline={[8, 9, 11, 10, 13, 14, 12, 15, 17, 16, 19, 21]}
      />
      <StatTile
        label="Lifetime Referrals"
        value={attorney.lifetimeReferrals}
        delta={{
          value: `+${ninetyDayBonds.length} LAST 90 DAYS`,
          direction: "up",
        }}
        sparkline={[12, 14, 15, 17, 19, 22, 24, 26, 28, 31, 33, 36]}
      />
      <StatTile
        label="Average Bond Size"
        value={attorney.averageBondSize}
        format="currency"
        delta={{ value: "PER REFERRAL", direction: "flat" }}
        sparkline={[22, 24, 23, 25, 27, 26, 28, 29, 30, 32, 31, 33]}
      />
      <StatTile
        label="Conversion Rate"
        value={attorney.conversionRate}
        format="percent"
        delta={{
          value: `${convSign}${convDelta}% VS NETWORK AVG`,
          direction: convDelta >= 0 ? "up" : "down",
        }}
        sparkline={[52, 54, 56, 58, 60, 62, 63, 65, 66, 68, 70, 72]}
      />
    </motion.section>
  );
}

function TimelineEntry({ entry }: { entry: TimelineRow }) {
  const meta = TIMELINE_META[entry.kind];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: EASE_VAULT }}
      className="grid grid-cols-[88px_auto_1fr] items-start gap-5 py-4 border-b border-vault-hairline"
    >
      <div className="pt-0.5">
        <p className="label-eyebrow-strong text-vault-ink">
          {formatRelativeShort(entry.daysAgo)}
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider-alt text-vault-graphite-light">
          {formatAbsoluteShort(entry.timestamp)}
        </p>
      </div>
      <div className="pt-1">
        <Badge variant={meta.variant}>{meta.label}</Badge>
      </div>
      <div>
        <p className="text-sm text-vault-ink leading-relaxed">
          {entry.summary}
        </p>
        <p className="mt-1 label-eyebrow text-vault-graphite-light">
          {entry.actor} · {entry.channel}
        </p>
      </div>
    </motion.div>
  );
}

function TimelineSection({ timeline }: { timeline: TimelineRow[] }) {
  return (
    <section>
      <SectionHeader label="RELATIONSHIP TIMELINE · LAST 12 MONTHS" />
      <div className="mt-2">
        {timeline.map((entry) => (
          <TimelineEntry key={entry.id} entry={entry} />
        ))}
      </div>
      <div className="mt-6">
        <Button variant="ghost" size="sm">
          View Full Timeline →
        </Button>
      </div>
    </section>
  );
}

function BondsSection({ bonds }: { bonds: BondRow[] }) {
  const total = bonds.reduce((sum, b) => sum + b.amount, 0);
  return (
    <section className="mt-14">
      <SectionHeader label="REFERRED BONDS · LEDGER" />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-vault-hairline-deep">
              <th className="text-left py-3 px-2 label-eyebrow-strong">
                Defendant
              </th>
              <th className="text-left py-3 px-2 label-eyebrow-strong">
                Bond Amount
              </th>
              <th className="text-left py-3 px-2 label-eyebrow-strong">
                Status
              </th>
              <th className="text-left py-3 px-2 label-eyebrow-strong hidden md:table-cell">
                Referred
              </th>
              <th className="text-left py-3 px-2 label-eyebrow-strong hidden lg:table-cell">
                Office
              </th>
            </tr>
          </thead>
          <tbody>
            {bonds.map((bond) => {
              const meta = BOND_STATUS_META[bond.status];
              return (
                <tr
                  key={bond.id}
                  className="border-b border-vault-hairline hover:bg-vault-paper-deep transition-colors duration-300 ease-vault"
                >
                  <td className="py-3 px-2">
                    <p className="font-sans text-sm text-vault-ink">
                      {bond.defendant}
                    </p>
                    <p className="mt-1 label-eyebrow text-vault-graphite-light">
                      {bond.charge}
                    </p>
                  </td>
                  <td className="py-3 px-2 font-sans text-sm text-vault-ink num-mono font-medium">
                    {formatCompactCurrency(bond.amount)}
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </td>
                  <td className="py-3 px-2 hidden md:table-cell label-eyebrow">
                    {formatAbsoluteShort(bond.referredIso)}
                  </td>
                  <td className="py-3 px-2 hidden lg:table-cell label-eyebrow">
                    {bond.office.toUpperCase()}
                  </td>
                </tr>
              );
            })}
            <tr>
              <td className="py-4 px-2 font-sans text-sm text-vault-ink font-medium">
                Total bond volume
              </td>
              <td className="py-4 px-2 font-display text-xl text-vault-ink num-mono font-light tracking-tighter-alt">
                {formatCompactCurrency(total)}
              </td>
              <td colSpan={3} />
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function VaultIntelligence({
  health,
  action,
  email,
}: {
  health: HealthState;
  action: { title: string; reason: string };
  email: { subject: string; body: string };
}) {
  return (
    <Card padding="md">
      <div className="flex items-center justify-between">
        <p className="label-eyebrow">VAULT INTELLIGENCE · SIGNAL</p>
        <Sparkles
          strokeWidth={1.5}
          size={14}
          className="text-vault-gold"
        />
      </div>

      <div className="mt-6">
        <h3 className="font-display font-light text-xl text-vault-ink tracking-tighter-alt">
          Relationship Health
        </h3>
        <div className="mt-3 flex items-center gap-2">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              health.level === "strong"
                ? "bg-vault-forest vault-pulse"
                : health.level === "warming"
                ? "bg-vault-gold vault-pulse"
                : "bg-vault-oxblood vault-pulse"
            )}
          />
          <p
            className={cn(
              "font-sans text-[11px] uppercase tracking-wider-alt font-semibold",
              health.color
            )}
          >
            {health.label}
          </p>
        </div>
        <p className="mt-3 text-sm text-vault-graphite leading-relaxed">
          {health.description}
        </p>
      </div>

      <div className="my-6 h-px w-full bg-vault-hairline" />

      <div>
        <p className="label-eyebrow">RECOMMENDED NEXT ACTION</p>
        <h4 className="mt-3 font-display font-light text-lg text-vault-ink tracking-tighter-alt">
          {action.title}
        </h4>
        <p className="mt-3 text-sm text-vault-graphite leading-relaxed">
          {action.reason}
        </p>
        <div className="mt-4">
          <Button variant="primary" size="sm">
            Draft The Action →
          </Button>
        </div>
      </div>

      <div className="my-6 h-px w-full bg-vault-hairline" />

      <div>
        <p className="label-eyebrow">AI-DRAFTED FOLLOW-UP</p>
        <div className="mt-3 border border-vault-hairline rounded-[4px] px-4 pt-4 pb-5 bg-vault-paper-deep">
          <p className="label-eyebrow">Subject</p>
          <p className="mt-1 font-sans text-sm text-vault-ink break-words">
            {email.subject}
          </p>
          <div className="mt-3 h-px w-full bg-vault-hairline" />
          <p className="mt-3 text-sm text-vault-ink leading-relaxed whitespace-pre-line break-words">
            {email.body}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="sm">
            Edit & Send
          </Button>
          <Button variant="ghost" size="sm">
            Regenerate
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ContactCard({ attorney }: { attorney: Attorney }) {
  const firmDomain = attorney.firm
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .join("");
  const streetOptions = [
    "330 N First Street",
    "1215 K Street",
    "225 Bush Street",
    "100 S Main Street",
    "555 W Fifth Street",
  ];
  const street = streetOptions[hashId(attorney.id) % streetOptions.length];
  const prefersPhone = (hashId(attorney.id) % 2) === 0;

  return (
    <Card padding="md">
      <p className="label-eyebrow">DIRECT LINES</p>
      <div className="mt-5 space-y-4">
        <div className="flex items-start gap-3">
          <Phone
            strokeWidth={1.5}
            size={14}
            className="text-vault-graphite mt-1 shrink-0"
          />
          <div>
            <p className="font-sans text-sm text-vault-ink num-mono">
              {attorney.phone}
            </p>
            <p className="label-eyebrow text-vault-graphite-light">
              Direct line
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Mail
            strokeWidth={1.5}
            size={14}
            className="text-vault-graphite mt-1 shrink-0"
          />
          <div className="min-w-0">
            <p className="font-sans text-sm text-vault-ink truncate">
              {attorney.email}
            </p>
            <p className="label-eyebrow text-vault-graphite-light">
              Firm email
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <User
            strokeWidth={1.5}
            size={14}
            className="text-vault-graphite mt-1 shrink-0"
          />
          <div>
            <p className="font-sans text-sm text-vault-ink">
              {attorney.assistant}
            </p>
            <p className="label-eyebrow text-vault-graphite-light">
              Assistant
            </p>
          </div>
        </div>
        <div className="pt-3 border-t border-vault-hairline">
          <p className="label-eyebrow">Firm address</p>
          <p className="mt-1 font-sans text-sm text-vault-ink">
            {street}, {attorney.city}, CA
          </p>
          <p className="font-sans text-sm text-vault-graphite-light">
            {firmDomain}.law
          </p>
        </div>
        <div className="pt-3 border-t border-vault-hairline">
          <Tag tone={prefersPhone ? "forest" : "default"}>
            PREFERS · {prefersPhone ? "PHONE" : "EMAIL"}
          </Tag>
        </div>
      </div>
    </Card>
  );
}

function MetadataCard({ attorney }: { attorney: Attorney }) {
  const manager = OFFICE_MANAGER[attorney.ownerOffice];
  const admittedYear = formatAdmittedYear(attorney.yearsAdmitted);

  return (
    <Card padding="md">
      <p className="label-eyebrow">VAULT METADATA</p>
      <div className="mt-5 space-y-5">
        <div>
          <p className="label-eyebrow">Owner</p>
          <p className="mt-1 font-sans text-sm text-vault-ink">
            {attorney.ownerOffice} · {manager}
          </p>
        </div>
        <div>
          <p className="label-eyebrow">Tier</p>
          <div className="mt-2">
            <Badge variant={TIER_BADGE[attorney.tier]}>{attorney.tier}</Badge>
          </div>
        </div>
        {attorney.tags.length ? (
          <div>
            <p className="label-eyebrow">Tags</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {attorney.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </div>
        ) : null}
        <div>
          <p className="label-eyebrow">Practice Areas</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {attorney.practiceAreas.map((area) => (
              <Tag key={area}>{area}</Tag>
            ))}
          </div>
        </div>
        <div className="pt-3 border-t border-vault-hairline space-y-2">
          <p className="label-eyebrow">
            Bar No. <span className="text-vault-ink">{attorney.barNumber}</span>{" "}
            · Admitted {admittedYear}
          </p>
          <p className="label-eyebrow">
            Last edited · {formatRelativeShort(daysSince(attorney.lastContactDate))}
          </p>
        </div>
        <div>
          <Button variant="ghost" size="sm">
            Manage Tags
          </Button>
        </div>
      </div>
    </Card>
  );
}

function AuditSection({ rows }: { rows: AuditRow[] }) {
  return (
    <section className="mt-14">
      <Card padding="md">
        <SectionHeader label="AUDIT TRAIL · RECENT EVENTS" />
        <div className="mt-4 divide-y divide-vault-hairline">
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[200px_auto_1fr_auto] items-center gap-4 py-3"
            >
              <p className="font-mono text-[11px] uppercase tracking-wider-alt text-vault-ink">
                {row.action}
              </p>
              <p className="label-eyebrow">{row.actor}</p>
              <p className="text-sm text-vault-graphite">{row.detail}</p>
              <p className="label-eyebrow num-mono text-vault-graphite-light">
                {formatClock(row.timestampIso)} ·{" "}
                {formatRelativeShort(
                  Math.floor(
                    (Date.now() - new Date(row.timestampIso).getTime()) /
                      86_400_000
                  )
                )}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button variant="ghost" size="sm">
            View Full Audit in Vault Mode →
          </Button>
        </div>
      </Card>
    </section>
  );
}

function StickyActionBar() {
  const actions: Array<{
    label: string;
    Icon: typeof Edit;
  }> = [
    { label: "Edit profile", Icon: Edit },
    { label: "Log new contact", Icon: MessageSquare },
    { label: "Schedule follow-up", Icon: Calendar },
    { label: "Download profile", Icon: Download },
  ];
  return (
    <div className="hidden lg:flex flex-col fixed right-6 top-1/2 -translate-y-1/2 z-20 bg-vault-paper border border-vault-hairline rounded-[4px] overflow-hidden">
      {actions.map(({ label, Icon }, index) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          title={label}
          className={cn(
            "h-11 w-11 flex items-center justify-center text-vault-graphite hover:text-vault-ink hover:bg-vault-paper-deep transition-colors duration-500 ease-vault",
            index > 0 && "border-t border-vault-hairline"
          )}
        >
          <Icon strokeWidth={1.5} size={15} />
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// Not found state
// ============================================================================

function NotInVault() {
  return (
    <PageShell>
      <section className="flex flex-col items-start pt-16 max-w-xl">
        <p className="label-eyebrow">ROLODEX · RECORD NOT FOUND</p>
        <h1 className="mt-4 font-display font-light text-5xl text-vault-ink tracking-tightest leading-[0.95]">
          Attorney not in vault.
        </h1>
        <p className="mt-4 text-base text-vault-graphite leading-relaxed">
          The requested record is not part of the active intelligence set. It
          may have been archived, redacted, or the link may be outdated.
        </p>
        <div className="mt-8">
          <Link to="/rolodex">
            <Button variant="secondary" size="md" icon={<ChevronLeft strokeWidth={1.5} size={14} />}>
              Back to Rolodex
            </Button>
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function AttorneyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const attorney = useMemo(
    () => attorneys.find((a) => a.id === id),
    [id]
  );

  const timeline = useMemo(
    () => (attorney ? buildTimeline(attorney) : []),
    [attorney]
  );
  const bonds = useMemo(
    () => (attorney ? buildBonds(attorney) : []),
    [attorney]
  );
  const audit = useMemo(
    () => (attorney ? buildAudit(attorney) : []),
    [attorney]
  );
  const health = useMemo(
    () => (attorney ? computeHealth(attorney) : null),
    [attorney]
  );
  const nextAction = useMemo(
    () =>
      attorney && health ? computeNextAction(attorney, health, bonds) : null,
    [attorney, health, bonds]
  );
  const email = useMemo(
    () => (attorney ? composeEmailPreview(attorney, bonds) : null),
    [attorney, bonds]
  );

  if (!attorney || !health || !nextAction || !email) {
    return <NotInVault />;
  }

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/rolodex")}
          icon={<ChevronLeft strokeWidth={1.5} size={14} />}
        >
          Back to Rolodex
        </Button>
      </div>

      <ZoneBanner tier={attorney.tier} />

      <Hero attorney={attorney} />

      <div className="my-10">
        <Divider label="RELATIONSHIP LEDGER" />
      </div>

      <StatsStrip attorney={attorney} bonds={bonds} />

      <div className="mt-16 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">
        <div>
          <TimelineSection timeline={timeline} />
          <BondsSection bonds={bonds} />
        </div>
        <div className="space-y-6">
          <VaultIntelligence
            health={health}
            action={nextAction}
            email={email}
          />
          <ContactCard attorney={attorney} />
          <MetadataCard attorney={attorney} />
        </div>
      </div>

      <AuditSection rows={audit} />

      <StickyActionBar />
    </PageShell>
  );
}

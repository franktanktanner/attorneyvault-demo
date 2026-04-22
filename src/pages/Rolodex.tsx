import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { PageShell } from "../components/layout/PageShell";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Divider } from "../components/ui/Divider";
import { StatTile } from "../components/ui/StatTile";
import { Tag } from "../components/ui/Tag";
import {
  attorneys,
  type Attorney,
  type AttorneyStatus,
  type AttorneyTier,
  type BbbOffice,
} from "../lib/mockData";
import { cn, formatCurrency } from "../lib/utils";

const SPARK_VOLUME = [8, 9, 11, 10, 13, 14, 12, 15, 17, 16, 19, 21];
const SPARK_REFERRERS = [72, 74, 78, 81, 82, 84, 85, 86, 88, 87, 89, 89];
const SPARK_ACTIVE = [210, 214, 219, 223, 228, 232, 236, 239, 241, 244, 246, 247];
const SPARK_DORMANT = [48, 46, 44, 43, 41, 39, 38, 37, 36, 35, 34, 34];

type SortKey =
  | "volumeDesc"
  | "volumeAsc"
  | "lastReferralDesc"
  | "lastContactDesc"
  | "alpha"
  | "conversionDesc";

const SORT_LABELS: Record<SortKey, string> = {
  volumeDesc: "Lifetime Volume · High to Low",
  volumeAsc: "Lifetime Volume · Low to High",
  lastReferralDesc: "Last Referral · Most Recent",
  lastContactDesc: "Last Contact · Most Recent",
  alpha: "Alphabetical · A to Z",
  conversionDesc: "Conversion Rate · High to Low",
};

const TIER_ORDER: AttorneyTier[] = [
  "platinum",
  "gold",
  "silver",
  "bronze",
  "prospect",
  "dormant",
];

const TIER_META: Record<
  AttorneyTier,
  { label: string; zone: string; tone: "gold" | "oxblood" | "default" }
> = {
  platinum: {
    label: "Platinum",
    zone: "PLATINUM VAULT · TOP RELATIONSHIPS",
    tone: "gold",
  },
  gold: {
    label: "Gold",
    zone: "GOLD VAULT · CORE REFERRERS",
    tone: "gold",
  },
  silver: {
    label: "Silver",
    zone: "SILVER VAULT · ACTIVE NETWORK",
    tone: "default",
  },
  bronze: {
    label: "Bronze",
    zone: "BRONZE VAULT · EMERGING RELATIONSHIPS",
    tone: "default",
  },
  prospect: {
    label: "Prospect",
    zone: "PROSPECT VAULT · NEW TO NETWORK",
    tone: "default",
  },
  dormant: {
    label: "Dormant",
    zone: "DORMANT VAULT · REACTIVATION CANDIDATES",
    tone: "oxblood",
  },
};

const TIER_AVATAR: Record<AttorneyTier, string> = {
  platinum: "bg-vault-gold text-vault-paper",
  gold: "bg-vault-gold-light text-vault-paper",
  silver: "bg-vault-graphite text-vault-paper",
  bronze: "bg-vault-hairline-deep text-vault-ink",
  prospect:
    "bg-transparent border border-vault-hairline text-vault-graphite",
  dormant: "bg-vault-oxblood text-vault-paper",
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

const STATUS_OPTIONS: AttorneyStatus[] = [
  "active",
  "warm",
  "cold",
  "dormant",
  "reactivation",
];

const OFFICES: BbbOffice[] = [
  "San Jose HQ",
  "Oakland",
  "Redwood City",
  "Los Angeles",
  "Santa Ana",
  "San Diego",
];

const PRACTICE_AREAS: string[] = Array.from(
  new Set(attorneys.flatMap((a) => a.practiceAreas))
).sort();

interface ActiveFilters {
  tier: AttorneyTier[];
  status: AttorneyStatus[];
  office: BbbOffice[];
  practiceAreas: string[];
}

const EMPTY_FILTERS: ActiveFilters = {
  tier: [],
  status: [],
  office: [],
  practiceAreas: [],
};

function countActiveFilters(filters: ActiveFilters): number {
  return (
    filters.tier.length +
    filters.status.length +
    filters.office.length +
    filters.practiceAreas.length
  );
}

function formatCompactCurrency(value: number): string {
  if (value === 0) return "$0";
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    const fixed = m >= 10 ? m.toFixed(1) : m.toFixed(2);
    return `$${fixed.replace(/\.?0+$/, "")}M`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return `$${k.toFixed(0)}K`;
  }
  return formatCurrency(value);
}

function daysSince(iso: string): number {
  const then = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - then) / (24 * 60 * 60 * 1000)));
}

function formatRelativeShort(iso: string): string {
  const days = daysSince(iso);
  if (days >= 365) {
    const years = Math.floor(days / 365);
    return `${years}Y AGO`;
  }
  if (days >= 30) {
    const months = Math.floor(days / 30);
    return `${months} MO AGO`;
  }
  if (days === 0) return "TODAY";
  if (days === 1) return "1 DAY AGO";
  return `${days} DAYS AGO`;
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function conversionDotClass(value: number): string {
  if (value >= 0.7) return "bg-vault-forest";
  if (value >= 0.4) return "bg-vault-gold";
  return "bg-vault-oxblood";
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function sortAttorneys(list: Attorney[], sortBy: SortKey): Attorney[] {
  const copy = [...list];
  switch (sortBy) {
    case "volumeDesc":
      return copy.sort(
        (a, b) =>
          TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) ||
          b.lifetimeVolume - a.lifetimeVolume
      );
    case "volumeAsc":
      return copy.sort((a, b) => a.lifetimeVolume - b.lifetimeVolume);
    case "lastReferralDesc":
      return copy.sort(
        (a, b) => daysSince(a.lastReferralDate) - daysSince(b.lastReferralDate)
      );
    case "lastContactDesc":
      return copy.sort(
        (a, b) => daysSince(a.lastContactDate) - daysSince(b.lastContactDate)
      );
    case "alpha":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "conversionDesc":
      return copy.sort((a, b) => b.conversionRate - a.conversionRate);
    default:
      return copy;
  }
}

function filterAttorneys(
  list: Attorney[],
  search: string,
  filters: ActiveFilters
): Attorney[] {
  const term = search.trim().toLowerCase();
  return list.filter((a) => {
    if (term) {
      const haystack = `${a.name} ${a.firm} ${a.city} ${a.county}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    if (filters.tier.length && !filters.tier.includes(a.tier)) return false;
    if (filters.status.length && !filters.status.includes(a.status))
      return false;
    if (filters.office.length && !filters.office.includes(a.ownerOffice))
      return false;
    if (filters.practiceAreas.length) {
      const hit = a.practiceAreas.some((p) =>
        filters.practiceAreas.includes(p)
      );
      if (!hit) return false;
    }
    return true;
  });
}

function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group py-1.5">
      <span
        className={cn(
          "inline-flex h-[14px] w-[14px] items-center justify-center border transition-colors duration-500 ease-vault",
          checked
            ? "border-vault-ink bg-vault-ink"
            : "border-vault-hairline-deep bg-transparent group-hover:border-vault-graphite"
        )}
      >
        {checked ? (
          <span className="h-[6px] w-[6px] bg-vault-paper" />
        ) : null}
      </span>
      <span className="font-sans text-sm text-vault-ink capitalize">
        {label}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
    </label>
  );
}

interface FilterPanelProps {
  filters: ActiveFilters;
  setFilters: (next: ActiveFilters) => void;
  onClose: () => void;
}

function FilterPanel({ filters, setFilters, onClose }: FilterPanelProps) {
  const toggleTier = (tier: AttorneyTier) =>
    setFilters({ ...filters, tier: toggle(filters.tier, tier) });
  const toggleStatus = (status: AttorneyStatus) =>
    setFilters({ ...filters, status: toggle(filters.status, status) });
  const toggleOffice = (office: BbbOffice) =>
    setFilters({ ...filters, office: toggle(filters.office, office) });
  const togglePractice = (area: string) =>
    setFilters({
      ...filters,
      practiceAreas: toggle(filters.practiceAreas, area),
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="absolute top-full left-0 mt-3 w-[560px] bg-vault-paper border border-vault-hairline-deep rounded-[6px] shadow-lg z-30 p-6"
    >
      <div className="flex items-center justify-between">
        <p className="label-eyebrow-strong">FILTER RECORDS</p>
        <button
          type="button"
          onClick={() => setFilters(EMPTY_FILTERS)}
          className="label-eyebrow text-vault-graphite hover:text-vault-ink transition-colors duration-500 ease-vault"
        >
          CLEAR ALL
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-10 gap-y-6">
        <div>
          <p className="label-eyebrow mb-2">TIER</p>
          {TIER_ORDER.map((tier) => (
            <FilterCheckbox
              key={tier}
              label={TIER_META[tier].label}
              checked={filters.tier.includes(tier)}
              onChange={() => toggleTier(tier)}
            />
          ))}
        </div>

        <div>
          <p className="label-eyebrow mb-2">STATUS</p>
          {STATUS_OPTIONS.map((status) => (
            <FilterCheckbox
              key={status}
              label={status}
              checked={filters.status.includes(status)}
              onChange={() => toggleStatus(status)}
            />
          ))}
        </div>

        <div>
          <p className="label-eyebrow mb-2">OFFICE</p>
          {OFFICES.map((office) => (
            <FilterCheckbox
              key={office}
              label={office}
              checked={filters.office.includes(office)}
              onChange={() => toggleOffice(office)}
            />
          ))}
        </div>

        <div>
          <p className="label-eyebrow mb-2">PRACTICE AREAS</p>
          <div className="max-h-56 overflow-y-auto pr-2">
            {PRACTICE_AREAS.map((area) => (
              <FilterCheckbox
                key={area}
                label={area}
                checked={filters.practiceAreas.includes(area)}
                onChange={() => togglePractice(area)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </motion.div>
  );
}

interface SortDropdownProps {
  value: SortKey;
  onChange: (key: SortKey) => void;
}

function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-3 px-3 py-2 border border-vault-hairline rounded-[2px] hover:border-vault-hairline-deep transition-colors duration-500 ease-vault"
      >
        <span className="label-eyebrow">SORT</span>
        <span className="font-sans text-xs text-vault-ink uppercase tracking-wider-alt">
          {SORT_LABELS[value]}
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute right-0 top-full mt-2 w-[320px] bg-vault-paper border border-vault-hairline-deep rounded-[6px] shadow-lg z-30 py-2"
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => {
              const active = key === value;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  className={cn(
                    "block w-full text-left px-4 py-2 font-sans text-xs uppercase tracking-wider-alt transition-colors duration-500 ease-vault",
                    active
                      ? "bg-vault-paper-deep text-vault-ink"
                      : "text-vault-graphite hover:text-vault-ink hover:bg-vault-paper-deep"
                  )}
                >
                  {SORT_LABELS[key]}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

interface ViewToggleProps {
  view: "grid" | "list";
  onChange: (view: "grid" | "list") => void;
}

function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div
      className="inline-flex border border-vault-hairline rounded-[2px] overflow-hidden"
      role="tablist"
      aria-label="View toggle"
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        aria-label="Grid view"
        aria-selected={view === "grid"}
        className={cn(
          "h-9 w-9 flex items-center justify-center transition-colors duration-500 ease-vault",
          view === "grid"
            ? "bg-vault-ink text-vault-paper"
            : "bg-transparent text-vault-graphite hover:text-vault-ink"
        )}
      >
        <LayoutGrid strokeWidth={1.5} size={16} />
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        aria-label="List view"
        aria-selected={view === "list"}
        className={cn(
          "h-9 w-9 flex items-center justify-center transition-colors duration-500 ease-vault border-l border-vault-hairline",
          view === "list"
            ? "bg-vault-ink text-vault-paper"
            : "bg-transparent text-vault-graphite hover:text-vault-ink"
        )}
      >
        <List strokeWidth={1.5} size={16} />
      </button>
    </div>
  );
}

interface AttorneyCardProps {
  attorney: Attorney;
  onOpen: () => void;
  index: number;
}

function AttorneyCard({ attorney, onOpen, index }: AttorneyCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.03, 0.6),
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <motion.button
        type="button"
        onClick={onOpen}
        aria-label={`Open profile for ${attorney.name}`}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="group w-full text-left"
      >
        <Card
          interactive
          padding="none"
          className="p-6 h-full flex flex-col"
        >
          <div className="flex items-start justify-between gap-4">
            <div
              className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center font-display text-lg font-light shrink-0",
                TIER_AVATAR[attorney.tier]
              )}
            >
              {attorney.avatarInitials}
            </div>
            <Badge variant={TIER_BADGE[attorney.tier]}>{attorney.tier}</Badge>
          </div>

          <div className="mt-4">
            <h3 className="font-display text-xl font-medium text-vault-ink tracking-tighter-alt truncate">
              {attorney.name}
            </h3>
            <p className="mt-1 text-sm text-vault-graphite truncate">
              {attorney.firm}
            </p>
            <p className="mt-1 label-eyebrow truncate">
              {attorney.city.toUpperCase()} · {attorney.county.toUpperCase()} COUNTY
            </p>
          </div>

          <div className="my-4 h-px bg-vault-hairline" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="label-eyebrow">LIFETIME VOLUME</p>
              <p className="mt-1 font-display text-xl font-light text-vault-ink num-mono tracking-tighter-alt">
                {formatCompactCurrency(attorney.lifetimeVolume)}
              </p>
            </div>
            <div>
              <p className="label-eyebrow">REFERRALS</p>
              <p className="mt-1 font-display text-xl font-light text-vault-ink num-mono tracking-tighter-alt">
                {attorney.lifetimeReferrals}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="label-eyebrow">LAST REFERRAL</p>
              <p className="mt-1 label-eyebrow-strong text-vault-ink">
                {attorney.tier === "prospect"
                  ? "NEVER"
                  : formatRelativeShort(attorney.lastReferralDate)}
              </p>
            </div>
            <div>
              <p className="label-eyebrow">CONVERSION</p>
              <p className="mt-1 font-sans text-sm text-vault-ink num-mono">
                {attorney.tier === "prospect"
                  ? "—"
                  : formatPercent(attorney.conversionRate)}
              </p>
            </div>
          </div>

          {attorney.tags.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {attorney.tags.slice(0, 2).map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          ) : null}

          <div className="mt-auto pt-4 flex items-center justify-between border-t border-vault-hairline">
            <p className="label-eyebrow">
              {attorney.ownerOffice.toUpperCase()}
            </p>
            <span className="label-eyebrow-strong text-vault-graphite group-hover:text-vault-ink transition-colors duration-500 ease-vault">
              OPEN PROFILE →
            </span>
          </div>
        </Card>
      </motion.button>
    </motion.div>
  );
}

interface AttorneyRowProps {
  attorney: Attorney;
  onOpen: () => void;
}

function AttorneyRow({ attorney, onOpen }: AttorneyRowProps) {
  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={onOpen}
      className="border-b border-vault-hairline cursor-pointer hover:bg-vault-paper-deep transition-colors duration-200"
    >
      <td className="py-4 px-2">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center font-display text-xs font-light shrink-0",
              TIER_AVATAR[attorney.tier]
            )}
          >
            {attorney.avatarInitials}
          </div>
          <div className="min-w-0">
            <p className="font-display text-base font-medium text-vault-ink truncate">
              {attorney.name}
            </p>
            <p className="font-sans text-xs text-vault-graphite truncate">
              {attorney.firm}
            </p>
          </div>
        </div>
      </td>
      <td className="py-4 px-2">
        <Badge variant={TIER_BADGE[attorney.tier]}>{attorney.tier}</Badge>
      </td>
      <td className="py-4 px-2 hidden md:table-cell">
        <p className="label-eyebrow">{attorney.ownerOffice.toUpperCase()}</p>
      </td>
      <td className="py-4 px-2 font-sans text-sm text-vault-ink num-mono font-medium">
        {formatCompactCurrency(attorney.lifetimeVolume)}
      </td>
      <td className="py-4 px-2 hidden md:table-cell font-sans text-sm text-vault-ink num-mono">
        {attorney.lifetimeReferrals}
      </td>
      <td className="py-4 px-2 hidden lg:table-cell">
        <p className="label-eyebrow">
          {attorney.tier === "prospect"
            ? "NEVER"
            : formatRelativeShort(attorney.lastContactDate)}
        </p>
      </td>
      <td className="py-4 px-2 hidden lg:table-cell">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              conversionDotClass(attorney.conversionRate)
            )}
          />
          <span className="font-sans text-sm text-vault-ink num-mono">
            {attorney.tier === "prospect"
              ? "—"
              : formatPercent(attorney.conversionRate)}
          </span>
        </div>
      </td>
      <td className="py-4 px-2 w-10">
        <ChevronRight
          strokeWidth={1.5}
          size={18}
          className="text-vault-graphite"
        />
      </td>
    </motion.tr>
  );
}

export default function Rolodex() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] =
    useState<ActiveFilters>(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState<SortKey>("volumeDesc");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const filterWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterPanelOpen) return;
    const handler = (event: MouseEvent) => {
      if (
        filterWrapperRef.current &&
        !filterWrapperRef.current.contains(event.target as Node)
      ) {
        setFilterPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterPanelOpen]);

  const filteredAndSorted = useMemo(() => {
    const filtered = filterAttorneys(attorneys, searchQuery, activeFilters);
    return sortAttorneys(filtered, sortBy);
  }, [searchQuery, activeFilters, sortBy]);

  const grouped = useMemo(() => {
    if (sortBy !== "volumeDesc") return null;
    const groups = new Map<AttorneyTier, Attorney[]>();
    for (const tier of TIER_ORDER) {
      groups.set(tier, []);
    }
    for (const attorney of filteredAndSorted) {
      groups.get(attorney.tier)!.push(attorney);
    }
    return TIER_ORDER.filter((tier) => (groups.get(tier) ?? []).length > 0).map(
      (tier) => ({ tier, attorneys: groups.get(tier) ?? [] })
    );
  }, [filteredAndSorted, sortBy]);

  const filterCount = countActiveFilters(activeFilters);
  const openAttorney = (id: string) => navigate(`/attorney/${id}`);

  const handleSearchKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") setSearchQuery("");
  };

  return (
    <PageShell>
      <header>
        <p className="label-eyebrow">ROLODEX · ATTORNEY DIRECTORY</p>
        <h1 className="mt-4 font-display font-light text-6xl text-vault-ink tracking-tightest leading-[0.95]">
          The Rolodex
        </h1>
        <p className="mt-5 text-lg font-light text-vault-graphite max-w-2xl leading-relaxed">
          Every attorney relationship in the vault. 247 active records across
          six offices. Built over 27 years. Protected under AES-256.
        </p>
      </header>

      <div className="h-12" />

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatTile
          label="Total Attorneys"
          value={247}
          sparkline={SPARK_ACTIVE}
          delta={{ value: "+14 this quarter", direction: "up" }}
        />
        <StatTile
          label="Active Referrers (30D)"
          value={89}
          sparkline={SPARK_REFERRERS}
          delta={{ value: "+3 vs last month", direction: "up" }}
        />
        <StatTile
          label="Lifetime Referral Volume"
          value={14820000}
          format="currency"
          sparkline={SPARK_VOLUME}
          delta={{ value: "+$1.2M QTD", direction: "up" }}
        />
        <StatTile
          label="Dormant · Reactivation Targets"
          value={34}
          sparkline={SPARK_DORMANT}
          delta={{
            value: "-4 reactivated",
            direction: "down",
            positive: true,
          }}
        />
      </section>

      <div className="h-16" />

      <section className="border-b border-vault-hairline pb-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-8">
          <div className="w-full lg:w-[360px] shrink-0">
            <label
              htmlFor="rolodex-search"
              className="label-eyebrow block mb-2"
            >
              SEARCH
            </label>
            <div className="relative">
              <Search
                strokeWidth={1.5}
                size={16}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-vault-graphite-light pointer-events-none"
              />
              <input
                id="rolodex-search"
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={handleSearchKey}
                placeholder="Search attorneys, firms, cities..."
                className="w-full bg-transparent border-0 border-b border-vault-hairline pl-7 pr-0 py-2 font-sans text-sm text-vault-ink placeholder:text-vault-graphite-light focus:outline-none focus:border-vault-forest transition-colors duration-500 ease-vault"
              />
            </div>
          </div>

          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div ref={filterWrapperRef} className="relative">
              <button
                type="button"
                onClick={() => setFilterPanelOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3 py-2 border border-vault-hairline rounded-[2px] hover:border-vault-hairline-deep transition-colors duration-500 ease-vault"
              >
                <SlidersHorizontal
                  strokeWidth={1.5}
                  size={14}
                  className="text-vault-graphite"
                />
                <span className="label-eyebrow-strong text-vault-ink">
                  FILTER
                </span>
              </button>
              <AnimatePresence>
                {filterPanelOpen ? (
                  <FilterPanel
                    filters={activeFilters}
                    setFilters={setActiveFilters}
                    onClose={() => setFilterPanelOpen(false)}
                  />
                ) : null}
              </AnimatePresence>
            </div>

            {filterCount === 0 ? (
              <span className="label-eyebrow text-vault-graphite-light">
                ALL ATTORNEYS
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setActiveFilters(EMPTY_FILTERS)}
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-vault-forest text-vault-forest bg-transparent hover:bg-vault-forest hover:text-vault-paper transition-colors duration-500 ease-vault"
              >
                <span className="font-sans text-[10px] uppercase tracking-wider-alt font-semibold">
                  {filterCount} FILTER{filterCount === 1 ? "" : "S"} ACTIVE
                </span>
                <X strokeWidth={1.5} size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <SortDropdown value={sortBy} onChange={setSortBy} />
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>
      </section>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="label-eyebrow">
          SHOWING {filteredAndSorted.length} OF {attorneys.length} ATTORNEYS
        </p>
        {filterCount > 0 ? (
          <p className="label-eyebrow text-vault-graphite-light">
            FILTERED BY:{" "}
            {[
              ...activeFilters.tier.map((t) => `TIER · ${t.toUpperCase()}`),
              ...activeFilters.status.map(
                (s) => `STATUS · ${s.toUpperCase()}`
              ),
              ...activeFilters.office.map(
                (o) => `OFFICE · ${o.toUpperCase()}`
              ),
              ...activeFilters.practiceAreas.map((p) => p.toUpperCase()),
            ].join("  ·  ")}
          </p>
        ) : null}
      </div>

      <div className="mt-8">
        {filteredAndSorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="label-eyebrow">NO MATCHES</p>
            <h2 className="mt-4 font-display font-light text-2xl text-vault-ink tracking-tighter-alt max-w-md">
              The vault found no attorneys matching your criteria.
            </h2>
            <p className="mt-3 text-vault-graphite text-sm">
              Try adjusting filters or clearing your search.
            </p>
            <div className="mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilters(EMPTY_FILTERS);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        ) : view === "grid" ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${sortBy}-${filterCount}-${searchQuery}`}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-12"
            >
              {grouped ? (
                grouped.map(({ tier, attorneys: group }) => (
                  <div key={tier}>
                    <Divider
                      label={TIER_META[tier].zone}
                      tone={TIER_META[tier].tone}
                    />
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {group.map((attorney, index) => (
                        <AttorneyCard
                          key={attorney.id}
                          attorney={attorney}
                          onOpen={() => openAttorney(attorney.id)}
                          index={index}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAndSorted.map((attorney, index) => (
                    <AttorneyCard
                      key={attorney.id}
                      attorney={attorney}
                      onOpen={() => openAttorney(attorney.id)}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`list-${sortBy}-${filterCount}-${searchQuery}`}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-x-auto"
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-vault-hairline-deep sticky top-16 bg-vault-paper z-10">
                    <th className="text-left py-3 px-2 label-eyebrow-strong">
                      Attorney
                    </th>
                    <th className="text-left py-3 px-2 label-eyebrow-strong">
                      Tier
                    </th>
                    <th className="text-left py-3 px-2 label-eyebrow-strong hidden md:table-cell">
                      Office
                    </th>
                    <th className="text-left py-3 px-2 label-eyebrow-strong">
                      Lifetime Volume
                    </th>
                    <th className="text-left py-3 px-2 label-eyebrow-strong hidden md:table-cell">
                      Referrals
                    </th>
                    <th className="text-left py-3 px-2 label-eyebrow-strong hidden lg:table-cell">
                      Last Contact
                    </th>
                    <th className="text-left py-3 px-2 label-eyebrow-strong hidden lg:table-cell">
                      Conversion
                    </th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSorted.map((attorney) => (
                    <AttorneyRow
                      key={attorney.id}
                      attorney={attorney}
                      onOpen={() => openAttorney(attorney.id)}
                    />
                  ))}
                </tbody>
              </table>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </PageShell>
  );
}

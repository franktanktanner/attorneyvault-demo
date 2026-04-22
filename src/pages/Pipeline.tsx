import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus, Search } from "lucide-react";

import { PageShell } from "../components/layout/PageShell";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import {
  attorneys,
  type Attorney,
  type AttorneyTier,
} from "../lib/mockData";
import { cn } from "../lib/utils";

const EASE_VAULT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

type Stage = "identified" | "introduced" | "engaged" | "referring" | "at-risk";

const STAGES: Stage[] = [
  "identified",
  "introduced",
  "engaged",
  "referring",
  "at-risk",
];

const STAGE_META: Record<
  Stage,
  { number: string; name: string; descriptor: string }
> = {
  identified: {
    number: "STAGE 1",
    name: "Identified",
    descriptor: "On the radar. Not yet introduced.",
  },
  introduced: {
    number: "STAGE 2",
    name: "Introduced",
    descriptor: "First warm touch made. Awaiting response.",
  },
  engaged: {
    number: "STAGE 3",
    name: "Engaged",
    descriptor: "In dialog. No referral cadence yet.",
  },
  referring: {
    number: "STAGE 4",
    name: "Referring",
    descriptor: "Active relationship. Volume in the ledger.",
  },
  "at-risk": {
    number: "STAGE 5",
    name: "At Risk",
    descriptor: "Drift detected. Reactivation required.",
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

function hashId(id: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
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

function defaultStage(attorney: Attorney): Stage {
  if (attorney.tier === "prospect") return "identified";
  if (attorney.tier === "dormant" || attorney.status === "reactivation")
    return "at-risk";
  if (attorney.status === "cold") return "at-risk";
  const h = hashId(attorney.id);
  if (attorney.tier === "platinum" || attorney.tier === "gold") {
    return h % 100 < 90 ? "referring" : "engaged";
  }
  if (attorney.tier === "silver") {
    const r = h % 100;
    if (r < 45) return "referring";
    if (r < 85) return "engaged";
    return "introduced";
  }
  const r = h % 100;
  if (r < 50) return "introduced";
  if (r < 85) return "identified";
  return "engaged";
}

function ageDotClass(days: number): string {
  if (days < 30) return "bg-vault-forest";
  if (days < 90) return "bg-vault-gold";
  return "bg-vault-oxblood";
}

interface AttorneyKanbanCardProps {
  attorney: Attorney;
  onOpen: () => void;
  dragging?: boolean;
}

function AttorneyKanbanCard({
  attorney,
  onOpen,
  dragging,
}: AttorneyKanbanCardProps) {
  const contactDays = daysSince(attorney.lastContactDate);
  return (
    <div
      onClick={onOpen}
      className={cn(
        "group relative bg-vault-paper border border-vault-hairline rounded-[4px] p-4 transition-colors duration-300 ease-vault hover:border-vault-hairline-deep cursor-pointer",
        dragging && "shadow-xl scale-[1.02] border-vault-hairline-deep"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-3 bottom-3 w-0.5 rounded-r-sm",
          ageDotClass(contactDays)
        )}
      />
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center font-display text-xs font-light shrink-0",
            TIER_AVATAR[attorney.tier]
          )}
        >
          {attorney.avatarInitials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-sans text-sm text-vault-ink truncate font-medium">
            {attorney.name}
          </p>
          <p className="label-eyebrow truncate mt-0.5">{attorney.firm}</p>
        </div>
      </div>
      <div className="mt-3 h-px w-full bg-vault-hairline" />
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="font-sans text-sm text-vault-ink num-mono font-medium">
            {attorney.lifetimeReferrals}
          </span>
          <span className="label-eyebrow text-vault-graphite-light">refs</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="label-eyebrow-strong text-vault-ink">
            {formatRelativeShort(contactDays)}
          </span>
          <span className="label-eyebrow text-vault-graphite-light">
            contact
          </span>
        </div>
        <Badge variant={TIER_BADGE[attorney.tier]}>{attorney.tier}</Badge>
      </div>
    </div>
  );
}

interface DraggableCardProps {
  attorney: Attorney;
  onOpen: () => void;
}

function DraggableCard({ attorney, onOpen }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: attorney.id,
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn("touch-none", isDragging && "opacity-0")}
    >
      <AttorneyKanbanCard attorney={attorney} onOpen={onOpen} />
    </div>
  );
}

interface KanbanColumnProps {
  stage: Stage;
  attorneys: Attorney[];
  onOpen: (id: string) => void;
  index: number;
}

function KanbanColumn({
  stage,
  attorneys: columnAttorneys,
  onOpen,
  index,
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: stage });
  const meta = STAGE_META[stage];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: EASE_VAULT }}
      className={cn(
        "flex flex-col min-w-[280px] w-[280px] lg:w-auto bg-vault-paper-deep/40 border rounded-[6px] transition-colors duration-300 ease-vault",
        isOver ? "border-vault-forest" : "border-vault-hairline"
      )}
    >
      <div className="sticky top-0 bg-vault-paper-deep/80 backdrop-blur-sm px-4 pt-4 pb-3 rounded-t-[6px] border-b border-vault-hairline">
        <div className="flex items-center justify-between">
          <div>
            <p className="label-eyebrow">{meta.number}</p>
            <h3 className="mt-1 font-display text-xl text-vault-ink tracking-tighter-alt font-medium">
              {meta.name}
            </h3>
          </div>
          <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full border border-vault-hairline-deep font-sans text-xs font-semibold text-vault-ink num-mono">
            {columnAttorneys.length}
          </span>
        </div>
        <p className="mt-2 label-eyebrow text-vault-graphite-light leading-snug">
          {meta.descriptor}
        </p>
      </div>
      <div
        ref={setNodeRef}
        className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[70vh]"
      >
        {columnAttorneys.map((attorney, idx) => (
          <motion.div
            key={attorney.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: Math.min(0.1 + idx * 0.015, 0.8),
              ease: EASE_VAULT,
            }}
          >
            <DraggableCard
              attorney={attorney}
              onOpen={() => onOpen(attorney.id)}
            />
          </motion.div>
        ))}
        {columnAttorneys.length === 0 ? (
          <p className="label-eyebrow text-vault-graphite-light py-6 text-center">
            NO ATTORNEYS IN THIS STAGE
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}

const FILTERS = ["All", "My Territory", "Flagged", "At Risk"] as const;
type Filter = (typeof FILTERS)[number];

export default function Pipeline() {
  const navigate = useNavigate();
  const [stageMap, setStageMap] = useState<Record<string, Stage>>(() => {
    const initial: Record<string, Stage> = {};
    for (const a of attorneys) initial[a.id] = defaultStage(a);
    return initial;
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const filteredAttorneys = useMemo(() => {
    const term = search.trim().toLowerCase();
    return attorneys.filter((a) => {
      if (term) {
        const hay = `${a.name} ${a.firm} ${a.city}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      if (filter === "Flagged") {
        return a.tags.some((t) =>
          t.toLowerCase().includes("trusted circle") ||
          t.toLowerCase().includes("vip") ||
          t.toLowerCase().includes("top referrer")
        );
      }
      if (filter === "At Risk") return stageMap[a.id] === "at-risk";
      if (filter === "My Territory") return a.ownerOffice === "San Jose HQ";
      return true;
    });
  }, [filter, search, stageMap]);

  const byStage = useMemo(() => {
    const out: Record<Stage, Attorney[]> = {
      identified: [],
      introduced: [],
      engaged: [],
      referring: [],
      "at-risk": [],
    };
    for (const a of filteredAttorneys) {
      out[stageMap[a.id] ?? defaultStage(a)].push(a);
    }
    return out;
  }, [filteredAttorneys, stageMap]);

  const activeAttorney = activeId
    ? attorneys.find((a) => a.id === activeId)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const overId = event.over?.id;
    const activeCardId = String(event.active.id);
    if (!overId) return;
    const targetStage = String(overId) as Stage;
    if (!STAGES.includes(targetStage)) return;
    setStageMap((prev) => {
      if (prev[activeCardId] === targetStage) return prev;
      return { ...prev, [activeCardId]: targetStage };
    });
  };
  const handleDragCancel = () => setActiveId(null);

  return (
    <PageShell>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_VAULT }}
      >
        <p className="label-eyebrow">PIPELINE · RELATIONSHIP BOARD</p>
        <h1 className="mt-4 font-display font-light text-6xl text-vault-ink tracking-tightest leading-[0.95]">
          Pipeline
        </h1>
        <p className="mt-5 text-lg font-light text-vault-graphite max-w-2xl leading-relaxed">
          Every attorney relationship plotted by maturity. Drag to advance.
          Aging indicators surface drift before it becomes dormancy.
        </p>
      </motion.header>

      <section className="mt-10 border-b border-vault-hairline pb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={cn(
                "px-3 py-1.5 rounded-full border font-sans text-[10px] uppercase tracking-wider-alt font-semibold transition-colors duration-500 ease-vault",
                filter === option
                  ? "bg-vault-ink border-vault-ink text-vault-paper"
                  : "bg-transparent border-vault-hairline text-vault-graphite hover:text-vault-ink"
              )}
            >
              {option}
            </button>
          ))}
          <div className="relative ml-2 w-56">
            <Search
              strokeWidth={1.5}
              size={14}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-vault-graphite-light pointer-events-none"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search attorneys..."
              className="w-full bg-transparent border-0 border-b border-vault-hairline pl-6 py-1.5 font-sans text-sm text-vault-ink placeholder:text-vault-graphite-light focus:outline-none focus:border-vault-forest transition-colors duration-500 ease-vault"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            icon={<Plus strokeWidth={1.8} size={14} />}
          >
            Add Attorney
          </Button>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STAGES.map((stage) => {
          const meta = STAGE_META[stage];
          return (
            <Card key={stage} padding="none" className="p-5">
              <p className="label-eyebrow">{meta.number}</p>
              <p className="mt-2 font-display text-3xl text-vault-ink num-mono font-light tracking-tighter-alt">
                {byStage[stage].length}
              </p>
              <p className="mt-2 label-eyebrow text-vault-graphite-light">
                {meta.name.toUpperCase()}
              </p>
            </Card>
          );
        })}
      </section>

      <section className="mt-10">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="grid grid-flow-col auto-cols-[280px] lg:grid-flow-row lg:grid-cols-5 lg:auto-cols-auto gap-4 overflow-x-auto lg:overflow-visible pb-4">
            {STAGES.map((stage, i) => (
              <KanbanColumn
                key={stage}
                stage={stage}
                index={i}
                attorneys={byStage[stage]}
                onOpen={(id) => navigate(`/attorney/${id}`)}
              />
            ))}
          </div>
          <DragOverlay>
            {activeAttorney ? (
              <div className="w-[260px]">
                <AttorneyKanbanCard
                  attorney={activeAttorney}
                  onOpen={() => undefined}
                  dragging
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </section>
    </PageShell>
  );
}

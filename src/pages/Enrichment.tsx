import { motion } from "framer-motion";
import {
  Building2,
  FileText,
  Gavel,
  UserCog,
} from "lucide-react";

import { PageShell } from "../components/layout/PageShell";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { StatTile } from "../components/ui/StatTile";
import { cn } from "../lib/utils";

const EASE_VAULT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const SPARK_DATAPOINTS = [11800, 12000, 12150, 12300, 12420, 12510, 12620, 12710, 12780, 12820, 12840, 12847];
const SPARK_RUNS = [2800, 2950, 3020, 3080, 3120, 3150, 3180, 3200, 3210, 3215, 3218, 3221];
const SPARK_UPDATED = [72, 76, 78, 81, 84, 85, 86, 87, 88, 88, 89, 89];
const SPARK_NEW = [6, 7, 9, 10, 12, 11, 13, 13, 14, 14, 14, 14];

interface PipelineDef {
  eyebrow: string;
  title: string;
  icon: typeof Gavel;
  status: string;
  lastRun: string;
  tracks: string;
  events: string[];
  cta: string;
  accent: "forest" | "gold" | "graphite";
}

const PIPELINES: PipelineDef[] = [
  {
    eyebrow: "BAR REGISTRY",
    title: "California State Bar · Continuous Membership Sweep",
    icon: Building2,
    status: "ACTIVE",
    lastRun: "12 MINUTES AGO",
    tracks:
      "Admissions, discipline flags, practice area transitions, firm changes, address updates, obituary scans",
    events: [
      "Updated firm affiliation: Priya Ramanathan → Ramanathan Defense LLP",
      "Discipline flag cleared: public admonition resolved, record refreshed",
      "Bar renewal confirmed: 47 attorneys in the network",
    ],
    cta: "VIEW PIPELINE LOGS →",
    accent: "forest",
  },
  {
    eyebrow: "COURT DOCKETS",
    title: "PACER + County Trial Court Daily Reads",
    icon: Gavel,
    status: "ACTIVE",
    lastRun: "2 HOURS AGO",
    tracks:
      "Counsel of record, new filings, arraignment calendars, venue migration, bail hearing schedules",
    events: [
      "New federal indictment: Harold Okonkwo appeared as counsel of record",
      "Arraignment calendar up 15% at LASC Dept 120",
      "Marisol Castaneda filed motion in People v. Delgado",
    ],
    cta: "VIEW PIPELINE LOGS →",
    accent: "forest",
  },
  {
    eyebrow: "EDITORIAL",
    title: "LA Times · Daily Journal · Law.com · The Recorder",
    icon: FileText,
    status: "ACTIVE",
    lastRun: "4 HOURS AGO",
    tracks:
      "Case coverage, partnership moves, firm formations, departures, notable verdicts",
    events: [
      "Daily Journal: Ramanathan profiled on white collar defense practice",
      "Law.com: Castaneda quoted on federal sentencing reform",
      "The Recorder: new Bay Area criminal defense firm formed in Palo Alto",
    ],
    cta: "VIEW PIPELINE LOGS →",
    accent: "graphite",
  },
  {
    eyebrow: "CONCIERGE",
    title: "Concierge Desk · Qualitative Enrichment",
    icon: UserCog,
    status: "ACTIVE",
    lastRun: "YESTERDAY · 4:30 PM",
    tracks:
      "Preferences, rituals, family context, trusted advisor circle, in-person observations",
    events: [
      "Castaneda anniversary: 25 years with firm next month",
      "Okonkwo preferred meeting venue updated: Drago Centro",
      "New trusted advisor noted: Ramanathan's paralegal Tomás",
    ],
    cta: "VIEW NOTES →",
    accent: "gold",
  },
];

interface ActivityEntry {
  timestamp: string;
  source: string;
  message: string;
}

const ACTIVITY: ActivityEntry[] = [
  {
    timestamp: "4/21 14:22",
    source: "BAR REGISTRY",
    message: "Admission verified for 3 new network prospects",
  },
  {
    timestamp: "4/21 09:14",
    source: "COURT DOCKETS",
    message: "New filing indexed for C. Jeffrey Stanley at Santa Clara Superior",
  },
  {
    timestamp: "4/20 17:45",
    source: "EDITORIAL",
    message: "Recorder mention tagged and linked to Imani Kozlowski",
  },
  {
    timestamp: "4/20 15:10",
    source: "CONCIERGE",
    message: "Observation note appended: Darnell Whitfield courthouse cafe routine",
  },
  {
    timestamp: "4/20 11:02",
    source: "COURT DOCKETS",
    message: "Counsel of record change detected at USDC ND Cal",
  },
  {
    timestamp: "4/19 18:33",
    source: "EDITORIAL",
    message: "Daily Journal profile indexed and linked to Priya Ramanathan",
  },
  {
    timestamp: "4/19 13:28",
    source: "BAR REGISTRY",
    message: "Address update confirmed for 14 attorneys",
  },
  {
    timestamp: "4/19 10:04",
    source: "CONCIERGE",
    message: "Anniversary milestone flagged: Castaneda 25 years at firm",
  },
  {
    timestamp: "4/18 21:47",
    source: "COURT DOCKETS",
    message: "Night sweep: 6 new arraignments indexed across Alameda Superior",
  },
  {
    timestamp: "4/18 16:12",
    source: "EDITORIAL",
    message: "Law.com mention indexed for Marisol Castaneda on sentencing reform panel",
  },
  {
    timestamp: "4/18 12:35",
    source: "BAR REGISTRY",
    message: "Practice area transition: 2 attorneys added federal criminal certification",
  },
  {
    timestamp: "4/17 19:20",
    source: "CONCIERGE",
    message: "Preferred contact window updated for Kamala Brennan: Tuesday mornings",
  },
  {
    timestamp: "4/17 14:55",
    source: "COURT DOCKETS",
    message: "Venue migration detected: two white collar matters transferred from SD to ND Cal",
  },
  {
    timestamp: "4/17 11:08",
    source: "BAR REGISTRY",
    message: "Obituary sweep clear. No network impact.",
  },
  {
    timestamp: "4/16 22:15",
    source: "EDITORIAL",
    message: "LA Times mention indexed for Theodore Brantley on high-profile intake",
  },
  {
    timestamp: "4/16 15:40",
    source: "CONCIERGE",
    message: "New trusted advisor noted at Whitfield Trial Group: paralegal Ana Figueroa",
  },
  {
    timestamp: "4/16 09:57",
    source: "COURT DOCKETS",
    message: "Motion indexed in People v. Delgado: Marisol Castaneda lead counsel",
  },
  {
    timestamp: "4/15 18:22",
    source: "BAR REGISTRY",
    message: "Firm formation detected: new 4-attorney boutique in Redwood City",
  },
];

const SOURCE_ACCENT: Record<string, string> = {
  "BAR REGISTRY": "text-vault-forest",
  "COURT DOCKETS": "text-vault-ink",
  EDITORIAL: "text-vault-graphite",
  CONCIERGE: "text-vault-gold",
};

export default function Enrichment() {
  return (
    <PageShell>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_VAULT }}
      >
        <p className="label-eyebrow">ENRICHMENT · VAULT SOURCING</p>
        <h1 className="mt-4 font-display font-light text-6xl text-vault-ink tracking-tightest leading-[0.95]">
          Enrichment
        </h1>
        <p className="mt-5 text-lg font-light text-vault-graphite max-w-2xl leading-relaxed">
          Four pipelines feed the vault. 2,400+ data points per attorney
          updated continuously.
        </p>
      </motion.header>

      <section className="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatTile
          label="Data Points Tracked"
          value={12847}
          sparkline={SPARK_DATAPOINTS}
          delta={{ value: "+412 THIS WEEK", direction: "up" }}
        />
        <StatTile
          label="Enrichment Runs This Week"
          value={3221}
          sparkline={SPARK_RUNS}
          delta={{ value: "+108 vs. last week", direction: "up" }}
        />
        <StatTile
          label="Attorneys Updated"
          value={89}
          sparkline={SPARK_UPDATED}
          delta={{ value: "+6 last 24h", direction: "up" }}
        />
        <StatTile
          label="New Records Added"
          value={14}
          sparkline={SPARK_NEW}
          delta={{ value: "+3 this month", direction: "up" }}
        />
      </section>

      <section className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {PIPELINES.map((pipeline, idx) => {
          const Icon = pipeline.icon;
          return (
            <motion.div
              key={pipeline.eyebrow}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.1 + idx * 0.08,
                ease: EASE_VAULT,
              }}
            >
              <Card padding="lg" className="h-full flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full border border-vault-hairline flex items-center justify-center">
                      <Icon
                        strokeWidth={1.5}
                        size={18}
                        className={cn(
                          pipeline.accent === "gold"
                            ? "text-vault-gold"
                            : pipeline.accent === "forest"
                            ? "text-vault-forest"
                            : "text-vault-graphite"
                        )}
                      />
                    </div>
                    <div>
                      <p className="label-eyebrow">{pipeline.eyebrow}</p>
                      <p className="label-eyebrow text-vault-graphite-light">
                        LAST RUN · {pipeline.lastRun}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-vault-forest vault-pulse" />
                    <span className="label-eyebrow-strong text-vault-forest">
                      {pipeline.status}
                    </span>
                  </div>
                </div>

                <h3 className="mt-5 font-display text-2xl text-vault-ink tracking-tighter-alt font-medium">
                  {pipeline.title}
                </h3>

                <p className="mt-4 text-sm text-vault-graphite leading-relaxed">
                  {pipeline.tracks}
                </p>

                <div className="mt-5 space-y-3 flex-1">
                  <p className="label-eyebrow">RECENT EVENTS</p>
                  <ul className="space-y-2">
                    {pipeline.events.map((event, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm text-vault-ink leading-relaxed"
                      >
                        <span className="mt-[7px] h-1 w-1 rounded-full bg-vault-graphite shrink-0" />
                        <span>{event}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-5 border-t border-vault-hairline">
                  <Button variant="ghost" size="sm">
                    {pipeline.cta}
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </section>

      <section className="mt-14">
        <Card padding="lg">
          <div className="flex items-center justify-between pb-3 border-b border-vault-hairline">
            <p className="label-eyebrow-strong">
              ENRICHMENT ACTIVITY · LAST 7 DAYS
            </p>
            <p className="label-eyebrow text-vault-graphite-light">
              {ACTIVITY.length} EVENTS
            </p>
          </div>
          <div className="mt-4 divide-y divide-vault-hairline max-h-[520px] overflow-y-auto">
            {ACTIVITY.map((entry, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[108px_140px_1fr] items-start gap-4 py-3"
              >
                <p className="font-mono text-[11px] uppercase tracking-wider-alt text-vault-graphite-light">
                  {entry.timestamp}
                </p>
                <p
                  className={cn(
                    "label-eyebrow-strong",
                    SOURCE_ACCENT[entry.source] ?? "text-vault-ink"
                  )}
                >
                  {entry.source}
                </p>
                <p className="text-sm text-vault-ink leading-relaxed">
                  {entry.message}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </PageShell>
  );
}

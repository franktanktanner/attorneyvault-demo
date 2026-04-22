import { PageShell } from "../components/layout/PageShell";
import { Divider } from "../components/ui/Divider";
import { Card } from "../components/ui/Card";
import { Tag } from "../components/ui/Tag";
import { Badge } from "../components/ui/Badge";
import { attorneys } from "../lib/mockData";
import { formatCurrency, formatNumber } from "../lib/utils";

const TIER_ORDER = ["platinum", "gold", "silver", "bronze", "prospect", "dormant"] as const;

export default function Rolodex() {
  const preview = [...attorneys]
    .sort(
      (a, b) =>
        TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) ||
        b.lifetimeVolume - a.lifetimeVolume
    )
    .slice(0, 6);

  return (
    <PageShell>
      <header>
        <p className="label-eyebrow">ROLODEX · ATTORNEY DIRECTORY</p>
        <h1 className="mt-4 font-display font-light text-6xl text-vault-ink tracking-tightest leading-[0.95]">
          Rolodex
        </h1>
        <p className="mt-5 text-lg text-vault-graphite max-w-xl leading-relaxed">
          {formatNumber(attorneys.length)} attorneys across California criminal
          defense. Full directory experience shipping in upcoming build.
        </p>
      </header>

      <div className="mt-12">
        <Divider label="PREVIEW · TOP TIER" />
      </div>

      <section className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {preview.map((a) => (
          <Card key={a.id} padding="md" interactive>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="label-eyebrow">
                  {a.city.toUpperCase()} · {a.county.toUpperCase()} COUNTY
                </p>
                <h3 className="mt-2 font-display text-2xl text-vault-ink tracking-tighter-alt">
                  {a.name}
                </h3>
                <p className="mt-1 text-sm text-vault-graphite truncate">
                  {a.firm}
                </p>
              </div>
              <Badge
                variant={
                  a.tier === "platinum"
                    ? "forest"
                    : a.tier === "gold"
                    ? "gold"
                    : a.tier === "dormant"
                    ? "oxblood"
                    : "outline"
                }
              >
                {a.tier}
              </Badge>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="label-eyebrow">Lifetime Volume</p>
                <p className="mt-1 font-mono num-mono text-sm text-vault-ink">
                  {formatCurrency(a.lifetimeVolume)}
                </p>
              </div>
              <div>
                <p className="label-eyebrow">Referrals</p>
                <p className="mt-1 font-mono num-mono text-sm text-vault-ink">
                  {formatNumber(a.lifetimeReferrals)}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {a.practiceAreas.slice(0, 3).map((area) => (
                <Tag key={area}>{area}</Tag>
              ))}
            </div>
          </Card>
        ))}
      </section>
    </PageShell>
  );
}

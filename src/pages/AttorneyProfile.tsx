import { useParams } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { Divider } from "../components/ui/Divider";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Tag } from "../components/ui/Tag";
import { attorneys } from "../lib/mockData";
import { formatCurrency, formatNumber } from "../lib/utils";

export default function AttorneyProfile() {
  const { id } = useParams();
  const attorney = attorneys.find((a) => a.id === id) ?? attorneys[0];

  return (
    <PageShell>
      <header className="flex items-start justify-between gap-10">
        <div>
          <p className="label-eyebrow">
            ROLODEX · ATTORNEY PROFILE · {attorney.city.toUpperCase()}
          </p>
          <h1 className="mt-4 font-display font-light text-6xl text-vault-ink tracking-tightest leading-[0.95]">
            {attorney.name}
          </h1>
          <p className="mt-3 text-lg text-vault-graphite">{attorney.firm}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge
              variant={
                attorney.tier === "platinum"
                  ? "forest"
                  : attorney.tier === "gold"
                  ? "gold"
                  : attorney.tier === "dormant"
                  ? "oxblood"
                  : "outline"
              }
            >
              {attorney.tier}
            </Badge>
            {attorney.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>
      </header>

      <div className="mt-12">
        <Divider label="PROFILE SUMMARY" />
      </div>

      <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="label-eyebrow">Lifetime Volume</p>
          <p className="mt-3 font-display font-light text-4xl num-mono text-vault-ink">
            {formatCurrency(attorney.lifetimeVolume)}
          </p>
        </Card>
        <Card>
          <p className="label-eyebrow">Lifetime Referrals</p>
          <p className="mt-3 font-display font-light text-4xl num-mono text-vault-ink">
            {formatNumber(attorney.lifetimeReferrals)}
          </p>
        </Card>
        <Card>
          <p className="label-eyebrow">Average Bond</p>
          <p className="mt-3 font-display font-light text-4xl num-mono text-vault-ink">
            {formatCurrency(attorney.averageBondSize)}
          </p>
        </Card>
      </section>

      <section className="mt-10">
        <Card padding="lg">
          <p className="label-eyebrow">UPCOMING BUILD</p>
          <h2 className="mt-3 font-display font-light text-3xl text-vault-ink tracking-tighter-alt">
            Full attorney profile experience shipping in upcoming build.
          </h2>
          <p className="mt-4 text-vault-graphite max-w-2xl leading-relaxed">
            Relationship timeline, referred bond ledger, enrichment signals,
            deposition calendar, and concierge action queue will assemble here.
          </p>
        </Card>
      </section>
    </PageShell>
  );
}

import { PageShell } from "../components/layout/PageShell";
import { Divider } from "../components/ui/Divider";
import { Card } from "../components/ui/Card";
import { StatTile } from "../components/ui/StatTile";
import { VaultSeal } from "../components/vault/VaultSeal";

const SPARK_VOLUME = [8, 9, 11, 10, 13, 14, 12, 15, 17, 16, 19, 21];
const SPARK_REFERRERS = [72, 74, 78, 81, 82, 84, 85, 86, 88, 87, 89, 89];
const SPARK_ACTIVE = [210, 214, 219, 223, 228, 232, 236, 239, 241, 244, 246, 247];
const SPARK_DORMANT = [48, 46, 44, 43, 41, 39, 38, 37, 36, 35, 34, 34];

export default function VaultHome() {
  return (
    <PageShell>
      <header className="flex items-start justify-between gap-10">
        <div>
          <p className="label-eyebrow">VAULT HOME · PRIVATE INTELLIGENCE</p>
          <h1 className="mt-4 font-display font-light text-6xl text-vault-ink tracking-tightest leading-[0.95]">
            Good evening, Jeffrey.
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

      <section className="mt-12">
        <Card padding="lg">
          <div className="flex items-start justify-between gap-8">
            <div className="max-w-2xl">
              <p className="label-eyebrow">NEXT BUILD</p>
              <h2 className="mt-3 font-display font-light text-3xl text-vault-ink tracking-tighter-alt">
                Full Vault Home experience shipping in next build.
              </h2>
              <p className="mt-4 text-vault-graphite leading-relaxed">
                Daily briefing. Reactivation queue. Relationship heatmap. Inbound
                signal timeline. All composed in the same editorial cadence as the
                foundation you are reading now.
              </p>
            </div>
            <div className="shrink-0 hidden md:block">
              <div className="h-28 w-28 border border-vault-hairline rounded-[6px] flex items-center justify-center">
                <span className="font-display text-5xl font-light text-vault-ink num-mono tracking-tighter-alt">
                  02
                </span>
              </div>
              <p className="label-eyebrow text-center mt-3">PROMPT SEQUENCE</p>
            </div>
          </div>
        </Card>
      </section>
    </PageShell>
  );
}

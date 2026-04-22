import { PageShell } from "../components/layout/PageShell";
import { Divider } from "../components/ui/Divider";
import { Card } from "../components/ui/Card";

export default function Pipeline() {
  return (
    <PageShell>
      <header>
        <p className="label-eyebrow">PIPELINE · RELATIONSHIP BOARD</p>
        <h1 className="mt-4 font-display font-light text-6xl text-vault-ink tracking-tightest leading-[0.95]">
          Pipeline
        </h1>
        <p className="mt-5 text-lg text-vault-graphite max-w-xl leading-relaxed">
          Full experience shipping in upcoming build.
        </p>
      </header>
      <div className="mt-12">
        <Divider label="PLANNED STAGES" />
      </div>
      <section className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
        {["Identified", "Introduced", "Engaged", "Referring", "At Risk"].map(
          (stage, i) => (
            <Card key={stage} padding="md" interactive>
              <p className="label-eyebrow">
                STAGE {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-display text-2xl text-vault-ink tracking-tighter-alt">
                {stage}
              </h3>
              <p className="mt-3 text-sm text-vault-graphite leading-relaxed">
                Columns, drag-to-stage, conversion velocity, and aging indicators
                render here in the pipeline build.
              </p>
            </Card>
          )
        )}
      </section>
    </PageShell>
  );
}

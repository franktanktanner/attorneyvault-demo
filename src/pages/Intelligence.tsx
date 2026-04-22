import { PageShell } from "../components/layout/PageShell";
import { Divider } from "../components/ui/Divider";
import { Card } from "../components/ui/Card";

export default function Intelligence() {
  return (
    <PageShell>
      <header>
        <p className="label-eyebrow">INTELLIGENCE · SIGNAL GRID</p>
        <h1 className="mt-4 font-display font-light text-6xl text-vault-ink tracking-tightest leading-[0.95]">
          Intelligence
        </h1>
        <p className="mt-5 text-lg text-vault-graphite max-w-xl leading-relaxed">
          Full experience shipping in upcoming build.
        </p>
      </header>
      <div className="mt-12">
        <Divider label="SIGNAL STREAMS" />
      </div>
      <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "COURT CONNECT",
            title: "Arraignment cadence, filing volume, venue shifts.",
          },
          {
            label: "RELATIONSHIP DRIFT",
            title: "Contact decay, referral tempo, silence thresholds.",
          },
          {
            label: "COMPETITIVE INDEX",
            title: "Market share signals across the six offices.",
          },
        ].map((s) => (
          <Card key={s.label} padding="md" interactive>
            <p className="label-eyebrow">{s.label}</p>
            <h3 className="mt-3 font-display text-2xl text-vault-ink tracking-tighter-alt leading-snug">
              {s.title}
            </h3>
          </Card>
        ))}
      </section>
    </PageShell>
  );
}

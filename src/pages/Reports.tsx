import { PageShell } from "../components/layout/PageShell";
import { Divider } from "../components/ui/Divider";
import { Card } from "../components/ui/Card";

export default function Reports() {
  return (
    <PageShell>
      <header>
        <p className="label-eyebrow">REPORTS · EDITORIAL EXPORTS</p>
        <h1 className="mt-4 font-display font-light text-6xl text-vault-ink tracking-tightest leading-[0.95]">
          Reports
        </h1>
        <p className="mt-5 text-lg text-vault-graphite max-w-xl leading-relaxed">
          Full experience shipping in upcoming build.
        </p>
      </header>
      <div className="mt-12">
        <Divider label="PLANNED EDITIONS" />
      </div>
      <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "QUARTERLY BRIEF",
            title: "Relationship state of the firm, one envelope, once per quarter.",
          },
          {
            label: "ATTORNEY LEDGER",
            title:
              "Per-attorney lifetime ledger: referrals, volume, touches, drift.",
          },
          {
            label: "OFFICE SNAPSHOT",
            title: "Per-office performance against the vault baseline.",
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

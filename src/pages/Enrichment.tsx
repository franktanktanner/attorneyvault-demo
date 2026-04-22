import { PageShell } from "../components/layout/PageShell";
import { Divider } from "../components/ui/Divider";
import { Card } from "../components/ui/Card";

export default function Enrichment() {
  return (
    <PageShell>
      <header>
        <p className="label-eyebrow">ENRICHMENT · VAULT SOURCING</p>
        <h1 className="mt-4 font-display font-light text-6xl text-vault-ink tracking-tightest leading-[0.95]">
          Enrichment
        </h1>
        <p className="mt-5 text-lg text-vault-graphite max-w-xl leading-relaxed">
          Full experience shipping in upcoming build.
        </p>
      </header>
      <div className="mt-12">
        <Divider label="ENRICHMENT PIPELINES" />
      </div>
      <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            label: "BAR REGISTRY",
            title: "State Bar of California · continuous membership sweep.",
            body: "Admissions, discipline flags, practice transitions, obituary scans.",
          },
          {
            label: "COURT DOCKETS",
            title: "PACER & county trial court daily reads.",
            body: "Counsel of record, filings, arraignment calendars, venue migration.",
          },
          {
            label: "EDITORIAL SOURCING",
            title: "LA Times, Daily Journal, Law.com, Recorder.",
            body: "Case coverage, partnership moves, firm formations, departures.",
          },
          {
            label: "HUMAN LAYER",
            title: "Concierge desk qualitative enrichment.",
            body: "Preferences, rituals, family context, trusted advisor circle.",
          },
        ].map((s) => (
          <Card key={s.label} padding="lg" interactive>
            <p className="label-eyebrow">{s.label}</p>
            <h3 className="mt-3 font-display text-2xl text-vault-ink tracking-tighter-alt">
              {s.title}
            </h3>
            <p className="mt-3 text-sm text-vault-graphite leading-relaxed">
              {s.body}
            </p>
          </Card>
        ))}
      </section>
    </PageShell>
  );
}

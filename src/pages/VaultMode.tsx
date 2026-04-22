import { PageShell } from "../components/layout/PageShell";
import { Divider } from "../components/ui/Divider";
import { Card } from "../components/ui/Card";
import { auditLogEntries } from "../lib/mockData";
import { formatRelativeTime } from "../lib/utils";

export default function VaultMode() {
  return (
    <PageShell>
      <header>
        <p className="label-eyebrow">VAULT MODE · SEALED ACCESS</p>
        <h1 className="mt-4 font-display font-light text-6xl text-vault-ink tracking-tightest leading-[0.95]">
          Vault Mode
        </h1>
        <p className="mt-5 text-lg text-vault-graphite max-w-xl leading-relaxed">
          Full experience shipping in upcoming build. Audit stream rendered from
          vault-local log.
        </p>
      </header>

      <div className="mt-12">
        <Divider label="LIVE AUDIT TRAIL" />
      </div>

      <section className="mt-10">
        <Card padding="none">
          <ul>
            {auditLogEntries.slice(0, 10).map((entry, i) => (
              <li
                key={entry.id}
                className={
                  i === 0
                    ? "px-8 py-5 flex items-center justify-between gap-6"
                    : "px-8 py-5 border-t border-vault-hairline flex items-center justify-between gap-6"
                }
              >
                <div className="flex items-center gap-6">
                  <span className="font-mono text-[11px] tracking-wider-alt text-vault-graphite">
                    {String(i + 1).padStart(3, "0")}
                  </span>
                  <div>
                    <p className="label-eyebrow-strong">{entry.action}</p>
                    <p className="mt-1 text-sm text-vault-ink">
                      {entry.target} · {entry.details}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="label-eyebrow">{entry.user}</p>
                  <p className="mt-1 label-eyebrow num-mono">
                    {formatRelativeTime(entry.timestamp)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </PageShell>
  );
}

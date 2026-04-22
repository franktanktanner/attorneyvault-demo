import { VaultPulse } from "./VaultPulse";

export function IntegrityBar() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-8 bg-vault-paper border-t border-vault-hairline z-40">
      <div className="h-full px-6 flex items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <VaultPulse color="forest" />
          <span className="label-eyebrow-strong">VAULT INTEGRITY 100%</span>
        </div>

        <div className="hidden md:flex items-center gap-4 label-eyebrow">
          <span>LAST BACKUP 2H AGO</span>
          <span className="text-vault-hairline-deep">·</span>
          <span>DATA POINTS 12,847</span>
          <span className="text-vault-hairline-deep">·</span>
          <span>ENCRYPTION AES-256</span>
        </div>

        <div className="label-eyebrow">
          EST. 2026 · BAD BOYS BAIL BONDS · PRIVATE INTELLIGENCE
        </div>
      </div>
    </footer>
  );
}

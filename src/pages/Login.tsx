import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-vault-obsidian text-vault-paper relative overflow-hidden flex flex-col">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"200\"><filter id=\"n\"><feTurbulence baseFrequency=\"0.9\" numOctaves=\"2\"/><feColorMatrix values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0\"/></filter><rect width=\"200\" height=\"200\" filter=\"url(%23n)\"/></svg>')",
        }}
      />

      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center max-w-2xl"
        >
          <div className="flex items-center gap-2 label-eyebrow text-vault-graphite-light">
            <span className="inline-block h-1 w-1 rounded-full bg-vault-gold" />
            EST. 2026
            <span>·</span>
            BAD BOYS BAIL BONDS
          </div>

          <h1 className="mt-10 font-display font-light text-6xl md:text-7xl text-vault-paper tracking-tightest leading-[0.95]">
            AttorneyVault
          </h1>

          <p className="mt-6 label-eyebrow text-vault-graphite-light">
            PRIVATE INTELLIGENCE · ENCRYPTED SESSION
          </p>

          <div className="mt-10 h-px w-24 bg-vault-graphite/40" />

          <p className="mt-10 font-display font-light text-lg text-vault-graphite-light max-w-md leading-relaxed">
            A closed system for attorney relationship capital. Built for a single
            principal. Audited. Encrypted. Quiet.
          </p>

          <div className="mt-14">
            <Button
              variant="secondary"
              size="lg"
              className="border-vault-paper text-vault-paper hover:bg-vault-paper hover:text-vault-ink"
              onClick={() => navigate("/vault")}
            >
              Enter Vault
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 pb-8 text-center label-eyebrow text-vault-graphite-light">
        EST. 2026 · BAD BOYS BAIL BONDS
      </div>
    </div>
  );
}

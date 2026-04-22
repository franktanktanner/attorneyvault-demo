import {
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  VaultDoor,
  type VaultDoorState,
} from "../components/vault/VaultDoor";
import { cn } from "../lib/utils";

type UnlockState = VaultDoorState;

const EASE_VAULT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const EASE_VAULT_SLOW: [number, number, number, number] = [0.16, 1, 0.3, 1];

const SEQUENCE_MS = {
  verifying: 1200,
  decrypting: 2000,
  decryptingSwap: 1000,
  opening: 800,
  unlocked: 400,
};
const SEQUENCE_TOTAL =
  SEQUENCE_MS.verifying +
  SEQUENCE_MS.decrypting +
  SEQUENCE_MS.opening +
  SEQUENCE_MS.unlocked;

const STATUS_COPY: Partial<Record<UnlockState, string[]>> = {
  verifying: ["VERIFYING OPERATOR CLEARANCE"],
  decrypting: [
    "DECRYPTING VAULT · AES-256",
    "CROSS-CHECKING AUDIT CHAIN",
  ],
  opening: ["VAULT UNSEALED"],
};

interface DarkInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function DarkInput({ label, id, className, ...rest }: DarkInputProps) {
  const reactId = useId();
  const inputId = id ?? `vault-dark-${reactId}`;
  const [focused, setFocused] = useState(false);

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="label-eyebrow text-vault-graphite-light block mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          autoComplete="off"
          spellCheck={false}
          {...rest}
          onFocus={(event) => {
            setFocused(true);
            rest.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            rest.onBlur?.(event);
          }}
          className={cn(
            "w-full bg-transparent border-0 border-b border-vault-graphite/60 px-0 py-2 font-sans text-sm text-vault-paper placeholder:text-vault-graphite focus:outline-none focus:ring-0 disabled:opacity-60 transition-colors duration-500 ease-vault",
            className
          )}
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute bottom-0 left-0 h-px bg-vault-gold transition-[width] duration-500 ease-vault",
            focused ? "w-full" : "w-0"
          )}
        />
      </div>
    </div>
  );
}

const columnVariants: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.12, delayChildren: 0.25 },
  },
};

const itemVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE_VAULT_SLOW },
  },
};

export default function Login() {
  const navigate = useNavigate();
  const [unlockState, setUnlockState] = useState<UnlockState>("idle");
  const [statusIndex, setStatusIndex] = useState(0);
  const [operatorId, setOperatorId] = useState("CJS-0001");
  const [vaultKey, setVaultKey] = useState("demomaster2026");
  const timeoutsRef = useRef<number[]>([]);
  const startedRef = useRef(false);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const startUnlock = () => {
    if (startedRef.current) return;
    startedRef.current = true;

    const schedule = (delay: number, fn: () => void) => {
      const id = window.setTimeout(fn, delay);
      timeoutsRef.current.push(id);
    };

    setUnlockState("verifying");
    setStatusIndex(0);

    schedule(SEQUENCE_MS.verifying, () => {
      setUnlockState("decrypting");
      setStatusIndex(0);
    });
    schedule(SEQUENCE_MS.verifying + SEQUENCE_MS.decryptingSwap, () => {
      setStatusIndex(1);
    });
    schedule(SEQUENCE_MS.verifying + SEQUENCE_MS.decrypting, () => {
      setUnlockState("opening");
      setStatusIndex(0);
    });
    schedule(
      SEQUENCE_MS.verifying + SEQUENCE_MS.decrypting + SEQUENCE_MS.opening,
      () => {
        setUnlockState("unlocked");
      }
    );
    schedule(SEQUENCE_TOTAL, () => {
      navigate("/vault");
    });
  };

  const skipIntro = () => navigate("/vault");

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && unlockState === "idle") {
      event.preventDefault();
      startUnlock();
    }
  };

  const isSequencing = unlockState !== "idle";
  const copy = STATUS_COPY[unlockState];
  const currentStatus = copy
    ? copy[Math.min(statusIndex, copy.length - 1)]
    : null;

  return (
    <div className="h-screen w-screen overflow-hidden bg-vault-obsidian text-vault-paper relative flex flex-col lg:flex-row">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"200\"><filter id=\"n\"><feTurbulence baseFrequency=\"0.9\" numOctaves=\"2\"/><feColorMatrix values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0\"/></filter><rect width=\"200\" height=\"200\" filter=\"url(%23n)\"/></svg>')",
        }}
      />
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          left: "-200px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "1200px",
          height: "1200px",
          background:
            "radial-gradient(circle, rgba(26, 61, 46, 0.08) 0%, rgba(26, 61, 46, 0) 60%)",
        }}
      />

      <div
        aria-hidden
        className="hidden lg:block absolute top-1 bottom-1 w-px bg-vault-graphite opacity-30 pointer-events-none z-10"
        style={{ left: "60%" }}
      />

      <div className="relative flex-1 lg:flex-none lg:w-[60%] flex flex-col items-center justify-center py-8 lg:py-0 min-h-[38vh] lg:min-h-screen">
        <VaultDoor
          state={unlockState}
          className="w-60 h-60 sm:w-80 sm:h-80 lg:w-[520px] lg:h-[520px]"
        />

        <div className="mt-6 h-5 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {currentStatus ? (
              <motion.span
                key={currentStatus}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE_VAULT }}
                className={cn(
                  "font-mono text-[11px] uppercase tracking-wider-alt",
                  unlockState === "opening"
                    ? "text-vault-gold"
                    : "text-vault-graphite-light"
                )}
              >
                {currentStatus}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        variants={columnVariants}
        initial="initial"
        animate="animate"
        className="relative flex-1 lg:flex-none lg:w-[40%] flex flex-col justify-center items-start px-8 sm:px-12 lg:px-16 py-10 lg:py-0 lg:min-h-screen gap-0"
      >
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-vault-gold vault-pulse" />
          <span className="label-eyebrow text-vault-graphite-light">
            EST. 2026 · BAD BOYS BAIL BONDS
          </span>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-14">
          <h1 className="font-display font-light text-5xl text-vault-paper tracking-tightest leading-[0.95]">
            AttorneyVault
          </h1>
          <p className="mt-3 label-eyebrow text-vault-graphite-light !tracking-widest-alt">
            PRIVATE INTELLIGENCE · ENCRYPTED SESSION
          </p>
          <div className="mt-6 h-px w-12 bg-vault-graphite" />
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="mt-8 text-vault-graphite-light text-base leading-relaxed max-w-md font-light"
        >
          A closed system for attorney relationship capital. Built for a single
          principal. Audited. Encrypted. Quiet.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-12 w-full max-w-md space-y-5"
        >
          <DarkInput
            label="Operator ID"
            value={operatorId}
            onChange={(event) => setOperatorId(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSequencing}
            placeholder="000-000-0000"
            tabIndex={1}
            autoFocus
          />
          <DarkInput
            label="Vault Key"
            type="password"
            value={vaultKey}
            onChange={(event) => setVaultKey(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSequencing}
            placeholder="•••••••••••"
            tabIndex={2}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 w-full max-w-md">
          <button
            type="button"
            tabIndex={3}
            onClick={startUnlock}
            disabled={isSequencing}
            className={cn(
              "relative w-full px-8 py-4 font-sans font-semibold text-[12px] uppercase tracking-wider-alt rounded-[2px] transition-colors duration-500 ease-vault overflow-hidden",
              isSequencing
                ? "bg-vault-paper/70 text-vault-ink cursor-not-allowed"
                : "bg-vault-paper text-vault-ink hover:bg-vault-gold hover:text-vault-paper"
            )}
          >
            <span className={cn(isSequencing && "opacity-60")}>
              {isSequencing ? "Unlocking Vault" : "Unlock Vault"}
            </span>
            {isSequencing ? (
              <motion.span
                aria-hidden
                className="absolute bottom-0 left-0 h-px bg-vault-forest"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: SEQUENCE_TOTAL / 1000,
                  ease: "linear",
                }}
              />
            ) : null}
          </button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-14 lg:mt-auto lg:pt-16 max-w-md"
        >
          <p className="label-eyebrow text-vault-graphite-light">
            AUTHORIZED PERSONNEL ONLY · ALL ACCESS IS LOGGED
          </p>
          <p className="mt-2 font-sans text-[10px] uppercase tracking-wider-alt text-vault-graphite font-medium leading-relaxed">
            BIOMETRIC FALLBACK AVAILABLE · SESSION EXPIRES AFTER 10 MINUTES OF
            INACTIVITY
          </p>
        </motion.div>
      </motion.div>

      <button
        type="button"
        tabIndex={4}
        onClick={skipIntro}
        className="absolute bottom-6 right-8 label-eyebrow text-vault-graphite-light hover:text-vault-paper transition-colors duration-500 ease-vault z-30"
      >
        SKIP INTRO →
      </button>

      <AnimatePresence>
        {unlockState === "unlocked" || unlockState === "opening" ? (
          <motion.div
            aria-hidden
            key="forest-wash"
            initial={{ opacity: 0 }}
            animate={{
              opacity: unlockState === "unlocked" ? 0.35 : 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_VAULT }}
            className="absolute inset-0 bg-vault-forest pointer-events-none z-20"
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

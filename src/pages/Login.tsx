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
  CinematicVault,
  type CinematicVaultState,
} from "../components/vault/CinematicVault";
import { cn } from "../lib/utils";

type UnlockState = CinematicVaultState;

const EASE_VAULT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const EASE_VAULT_SLOW: [number, number, number, number] = [0.16, 1, 0.3, 1];

const SEQUENCE_MS = {
  verifying: 600,
  decrypting: 1000,
  opening: 2000,
  unlocked: 300,
};
const PRE_UNLOCK_MS =
  SEQUENCE_MS.verifying + SEQUENCE_MS.decrypting + SEQUENCE_MS.opening;
const SEQUENCE_TOTAL = PRE_UNLOCK_MS + SEQUENCE_MS.unlocked;

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
  const [videoReady, setVideoReady] = useState(false);
  const [operatorId, setOperatorId] = useState("CJS-0001");
  const [vaultKey, setVaultKey] = useState("demomaster2026");
  const timeoutsRef = useRef<number[]>([]);
  const startedRef = useRef(false);

  useEffect(() => {
    const probe = document.createElement("video");
    probe.src = "/videos/vault-idle.mp4";
    probe.preload = "auto";
    probe.muted = true;
    probe.playsInline = true;

    const ready = () => setVideoReady(true);
    probe.addEventListener("canplaythrough", ready, { once: true });
    probe.addEventListener("loadeddata", ready, { once: true });

    const fallback = window.setTimeout(ready, 1500);

    return () => {
      probe.removeEventListener("canplaythrough", ready);
      probe.removeEventListener("loadeddata", ready);
      window.clearTimeout(fallback);
    };
  }, []);

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

    schedule(SEQUENCE_MS.verifying, () => {
      setUnlockState("decrypting");
    });
    schedule(SEQUENCE_MS.verifying + SEQUENCE_MS.decrypting, () => {
      setUnlockState("opening");
    });
    schedule(PRE_UNLOCK_MS, () => {
      setUnlockState("unlocked");
    });
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
  const rightPanelFading =
    unlockState === "opening" || unlockState === "unlocked";

  return (
    <div className="h-screen w-screen overflow-hidden bg-vault-obsidian text-vault-paper relative">
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
        className="hidden lg:block absolute top-4 bottom-4 w-px bg-vault-graphite opacity-30 pointer-events-none z-10"
        style={{ left: "65%" }}
      />

      <div className="relative h-full w-full flex flex-col lg:flex-row">
        <div className="relative flex-none h-[60%] max-[640px]:h-[45%] lg:h-screen lg:flex-none lg:w-[65%] bg-black">
          <AnimatePresence>
            {!videoReady ? (
              <motion.div
                key="loading"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE_VAULT }}
                className="absolute inset-0 flex items-center justify-center bg-black z-10"
              >
                <span className="label-eyebrow text-vault-graphite-light">
                  LOADING VAULT ENVIRONMENT
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {videoReady ? (
            <CinematicVault state={unlockState} className="absolute inset-0" />
          ) : null}
        </div>

        <motion.div
          variants={columnVariants}
          initial="initial"
          animate="animate"
          className="relative flex-1 lg:flex-none lg:w-[35%] flex flex-col justify-center items-start px-8 sm:px-12 lg:px-14 py-10 lg:pt-24 lg:pb-24 lg:min-h-screen"
          style={{
            opacity: rightPanelFading ? 0 : 1,
            transition: `opacity 0.4s cubic-bezier(0.25,0.1,0.25,1) ${
              unlockState === "opening" ? "0.5s" : "0s"
            }`,
          }}
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-vault-gold vault-pulse" />
            <span className="label-eyebrow text-vault-graphite-light">
              EST. 2026 · BAD BOYS BAIL BONDS
            </span>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-12">
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
            A closed system for attorney relationship capital. Built for a
            single principal. Audited. Encrypted. Quiet.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-12 w-full max-w-[400px] space-y-5"
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

          <motion.div
            variants={itemVariants}
            className="mt-8 w-full max-w-[400px]"
          >
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
                    duration: PRE_UNLOCK_MS / 1000,
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
      </div>

      <button
        type="button"
        tabIndex={4}
        onClick={skipIntro}
        className="absolute bottom-6 right-8 label-eyebrow text-vault-graphite-light hover:text-vault-paper transition-colors duration-500 ease-vault z-30"
      >
        SKIP INTRO →
      </button>

      <div className="pointer-events-none absolute bottom-6 left-0 right-0 flex justify-center z-20">
        <span className="label-eyebrow text-vault-graphite">
          EST. 2026 · BAD BOYS BAIL BONDS
        </span>
      </div>
    </div>
  );
}

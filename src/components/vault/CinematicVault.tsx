import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

export type CinematicVaultState =
  | "idle"
  | "verifying"
  | "decrypting"
  | "opening"
  | "unlocked";

interface CinematicVaultProps {
  state: CinematicVaultState;
  onUnlockComplete?: () => void;
  className?: string;
}

const GRAIN_SVG =
  "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"220\" height=\"220\"><filter id=\"g\"><feTurbulence baseFrequency=\"0.9\" numOctaves=\"2\" stitchTiles=\"stitch\"/><feColorMatrix values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0\"/></filter><rect width=\"220\" height=\"220\" filter=\"url(%23g)\"/></svg>')";

const SHAKE_X = [0, 5, -4, 5, -5, 3, -4, 4, -2, 1, 0];
const SHAKE_Y = [0, -3, 4, -5, 2, -4, 5, -2, 3, -1, 0];

export function CinematicVault({
  state,
  onUnlockComplete,
  className,
}: CinematicVaultProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (state === "idle") {
      firedRef.current = false;
      return;
    }
    if (state === "opening" && !firedRef.current && onUnlockComplete) {
      firedRef.current = true;
      const id = window.setTimeout(() => onUnlockComplete(), 2000);
      return () => window.clearTimeout(id);
    }
  }, [state, onUnlockComplete]);

  const showVerifying = state === "verifying";
  const showDecrypting = state === "decrypting";
  const showOpening = state === "opening";
  const showUnlocked = state === "unlocked";

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-black",
        className
      )}
    >
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: "center" }}
        animate={
          showOpening
            ? { x: SHAKE_X, y: SHAKE_Y, scale: 1.15 }
            : { x: 0, y: 0, scale: 1 }
        }
        transition={
          showOpening
            ? {
                x: { duration: 0.4, delay: 0.2, ease: "linear" },
                y: { duration: 0.4, delay: 0.2, ease: "linear" },
                scale: { duration: 2.0, ease: "easeInOut" },
              }
            : { duration: 0 }
        }
      >
        <video
          src="/videos/vault-idle.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            filter:
              "contrast(1.12) saturate(1.08) brightness(0.94) hue-rotate(-2deg)",
            animation: showOpening
              ? "none"
              : "cinematic-dolly 24s ease-in-out infinite alternate",
            willChange: "transform",
          }}
        />

        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.4) 100%)",
          }}
        />

        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: GRAIN_SVG }}
          animate={
            showOpening
              ? { opacity: [0.04, 0.12, 0.12, 0.04] }
              : { opacity: 0.04 }
          }
          transition={
            showOpening
              ? {
                  duration: 1.4,
                  times: [0, 0.08, 0.72, 1],
                  delay: 0.1,
                  ease: "linear",
                }
              : { duration: 0 }
          }
        />

        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(139,115,85,0.08) 100%)",
          }}
        />

        <AnimatePresence>
          {showDecrypting ? (
            <motion.div
              key="progress"
              aria-hidden
              className="absolute bottom-0 left-0 h-px bg-vault-gold pointer-events-none z-20"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.0, ease: "linear" }}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {showVerifying || showDecrypting ? (
            <motion.div
              key={showVerifying ? "verifying" : "decrypting"}
              aria-hidden
              className="absolute bottom-16 left-0 right-0 flex items-center justify-center pointer-events-none z-50 px-6"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <span
                className="font-mono text-[14px] uppercase tracking-wider-alt font-semibold text-vault-gold"
                style={{ textShadow: "0 0 12px rgba(212, 167, 87, 0.4)" }}
              >
                {showVerifying
                  ? "VERIFYING OPERATOR CLEARANCE"
                  : "DECRYPTING VAULT · AES-256"}
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {showOpening ? (
            <motion.div
              key="white-core"
              aria-hidden
              className="absolute inset-0 pointer-events-none z-30"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 2.5, 2.5],
                opacity: [0, 1, 0.8],
              }}
              transition={{
                duration: 0.4,
                times: [0, 0.6, 1],
                ease: "easeOut",
              }}
              style={{
                background:
                  "radial-gradient(circle at center, #FFFFFF 0%, #FFF4D6 30%, transparent 60%)",
                transformOrigin: "center",
              }}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {showOpening ? (
            <motion.div
              key="gold-burst"
              aria-hidden
              className="absolute inset-0 pointer-events-none z-30"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 5.0, 5.0],
                opacity: [0, 0.95, 0],
              }}
              transition={{
                duration: 1.1,
                delay: 0.1,
                times: [0, 0.7, 1],
                ease: "easeOut",
              }}
              style={{
                background:
                  "radial-gradient(circle at center, #D4A757 0%, #8B7355 20%, #5C3F22 50%, transparent 75%)",
                transformOrigin: "center",
              }}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {showOpening ? (
            <div
              key="ring-wrap"
              aria-hidden
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            >
              <motion.div
                className="rounded-full border-2 border-vault-gold"
                style={{
                  width: "15%",
                  aspectRatio: "1 / 1",
                  transformOrigin: "center",
                }}
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 6.0, opacity: 0 }}
                transition={{
                  duration: 1.3,
                  delay: 0.3,
                  ease: "easeOut",
                }}
              />
            </div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {showOpening ? (
            <div
              key="ring-wrap-2"
              aria-hidden
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            >
              <motion.div
                className="rounded-full border-2 border-vault-gold"
                style={{
                  width: "15%",
                  aspectRatio: "1 / 1",
                  transformOrigin: "center",
                }}
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 6.0, opacity: 0 }}
                transition={{
                  duration: 1.3,
                  delay: 0.5,
                  ease: "easeOut",
                }}
              />
            </div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {showOpening ? (
            <motion.div
              key="gold-wash"
              aria-hidden
              className="absolute inset-0 pointer-events-none bg-vault-gold z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.95 }}
              transition={{
                duration: 0.8,
                delay: 1.2,
                ease: "easeIn",
              }}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {showOpening ? (
            <motion.div
              key="black-fade"
              aria-hidden
              className="absolute inset-0 pointer-events-none bg-black z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.2,
                delay: 1.8,
                ease: "easeIn",
              }}
            />
          ) : null}
        </AnimatePresence>

        {showUnlocked ? (
          <div
            aria-hidden
            className="absolute inset-0 bg-black z-50 pointer-events-none"
          />
        ) : null}
      </motion.div>
    </div>
  );
}

export default CinematicVault;

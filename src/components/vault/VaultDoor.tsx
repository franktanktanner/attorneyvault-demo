import { useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { cn } from "../../lib/utils";

export type VaultDoorState =
  | "idle"
  | "verifying"
  | "decrypting"
  | "opening"
  | "unlocked";

export interface VaultDoorProps {
  state: VaultDoorState;
  onUnlockComplete?: () => void;
  className?: string;
}

const EASE_VAULT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const EASE_VAULT_SLOW: [number, number, number, number] = [0.16, 1, 0.3, 1];

const TICKS = Array.from({ length: 60 }, (_, i) => {
  const rad = ((i * 6) - 90) * (Math.PI / 180);
  const isMajor = i % 5 === 0;
  const innerR = isMajor ? 158 : 164;
  const outerR = 174;
  return {
    x1: Math.cos(rad) * innerR,
    y1: Math.sin(rad) * innerR,
    x2: Math.cos(rad) * outerR,
    y2: Math.sin(rad) * outerR,
    opacity: isMajor ? 0.75 : 0.38,
    strokeWidth: isMajor ? 1 : 0.6,
  };
});

const BOLTS = Array.from({ length: 8 }, (_, i) => {
  const rad = ((i * 45) - 90) * (Math.PI / 180);
  return {
    cx: Math.cos(rad) * 230,
    cy: Math.sin(rad) * 230,
  };
});

export function VaultDoor({
  state,
  onUnlockComplete,
  className,
}: VaultDoorProps) {
  const dialControls = useAnimationControls();
  const arcControls = useAnimationControls();
  const doorFaceControls = useAnimationControls();
  const flashControls = useAnimationControls();

  useEffect(() => {
    if (state === "idle") {
      doorFaceControls.set({ scale: 1, opacity: 1 });
      arcControls.set({ pathLength: 0, opacity: 0 });
      flashControls.set({ scale: 0, opacity: 0 });
      dialControls.set({ rotate: 0 });
      dialControls.start({
        rotate: 360,
        transition: { duration: 30, ease: "linear", repeat: Infinity },
      });
    } else if (state === "verifying") {
      dialControls.start({
        rotate: [0, 360],
        transition: { duration: 3, ease: "linear", repeat: Infinity },
      });
    } else if (state === "decrypting") {
      dialControls.start({
        rotate: [0, 360],
        transition: { duration: 1, ease: "linear", repeat: Infinity },
      });
      arcControls.start({
        pathLength: 1,
        opacity: 1,
        transition: { duration: 2, ease: EASE_VAULT },
      });
    } else if (state === "opening") {
      dialControls.stop();
      doorFaceControls.start({
        scale: 0,
        opacity: 0.15,
        transition: { duration: 0.8, ease: EASE_VAULT_SLOW },
      });
      flashControls.start({
        scale: [0, 3],
        opacity: [0, 0.55, 0],
        transition: { duration: 0.8, ease: EASE_VAULT_SLOW },
      });
    } else if (state === "unlocked") {
      onUnlockComplete?.();
    }
  }, [state, dialControls, arcControls, doorFaceControls, flashControls, onUnlockComplete]);

  const ledColor =
    state === "idle"
      ? "#7A1F1F"
      : state === "opening" || state === "unlocked"
      ? "#1A3D2E"
      : "#8B7355";

  return (
    <motion.svg
      className={cn("block", className)}
      viewBox="-290 -290 580 580"
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: state === "unlocked" ? 0 : 1,
      }}
      transition={{
        scale: { duration: 1.2, ease: EASE_VAULT_SLOW },
        opacity: { duration: 0.4, ease: EASE_VAULT },
      }}
    >
      <defs>
        <radialGradient
          id="door-glow"
          cx="0"
          cy="0"
          r="250"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#1A3D2E" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#1A3D2E" stopOpacity="0" />
        </radialGradient>
        <path
          id="door-label-top"
          d="M -110,-254 A 275,275 0 0 1 110,-254"
          fill="none"
        />
        <path
          id="door-label-right"
          d="M 254,-110 A 275,275 0 0 1 254,110"
          fill="none"
        />
        <path
          id="door-label-bottom"
          d="M 110,254 A 275,275 0 0 1 -110,254"
          fill="none"
        />
        <path
          id="door-label-left"
          d="M -254,110 A 275,275 0 0 1 -254,-110"
          fill="none"
        />
      </defs>

      <circle cx="0" cy="0" r="250" fill="url(#door-glow)" />

      <g className="hidden lg:inline">
        <text
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="8"
          letterSpacing="4"
          fontWeight="600"
          fill="#9B9B96"
        >
          <textPath
            href="#door-label-top"
            startOffset="50%"
            textAnchor="middle"
          >
            AV
          </textPath>
        </text>
        <text
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="7"
          letterSpacing="3.5"
          fontWeight="600"
          fill="#9B9B96"
        >
          <textPath
            href="#door-label-right"
            startOffset="50%"
            textAnchor="middle"
          >
            BAD BOYS BAIL BONDS
          </textPath>
        </text>
        <text
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="7"
          letterSpacing="3"
          fontWeight="600"
          fill="#9B9B96"
        >
          <textPath
            href="#door-label-bottom"
            startOffset="50%"
            textAnchor="middle"
          >
            SERIAL 0001 · EST MMXXVI
          </textPath>
        </text>
        <text
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="7"
          letterSpacing="3.5"
          fontWeight="600"
          fill="#9B9B96"
        >
          <textPath
            href="#door-label-left"
            startOffset="50%"
            textAnchor="middle"
          >
            PRIVATE INTELLIGENCE
          </textPath>
        </text>
      </g>

      <circle
        cx="0"
        cy="0"
        r="215"
        fill="none"
        stroke="#E8E6E0"
        strokeWidth="1"
        opacity="0.15"
        strokeDasharray="2 4"
      />

      <circle
        cx="0"
        cy="0"
        r="250"
        fill="none"
        stroke="#6B6B68"
        strokeWidth="1.5"
      />

      {BOLTS.map((b, i) => (
        <circle
          key={i}
          cx={b.cx}
          cy={b.cy}
          r="2"
          fill="#6B6B68"
          opacity="0.75"
        />
      ))}

      <g transform="rotate(-90 0 0)">
        <motion.circle
          cx="0"
          cy="0"
          r="250"
          fill="none"
          stroke="#8B7355"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={arcControls}
        />
      </g>

      <motion.g
        animate={doorFaceControls}
        initial={{ scale: 1, opacity: 1 }}
        style={{ transformOrigin: "center", transformBox: "fill-box" }}
      >
        <circle cx="0" cy="0" r="195" fill="#1C1C1A" />

        <circle
          cx="0"
          cy="0"
          r="180"
          fill="none"
          stroke="#E8E6E0"
          strokeWidth="0.5"
          opacity="0.08"
        />
        <circle
          cx="0"
          cy="0"
          r="160"
          fill="none"
          stroke="#E8E6E0"
          strokeWidth="0.5"
          opacity="0.08"
        />
        <circle
          cx="0"
          cy="0"
          r="140"
          fill="none"
          stroke="#E8E6E0"
          strokeWidth="0.5"
          opacity="0.08"
        />
        <circle
          cx="0"
          cy="0"
          r="120"
          fill="none"
          stroke="#E8E6E0"
          strokeWidth="0.5"
          opacity="0.08"
        />

        {TICKS.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke="#6B6B68"
            strokeWidth={t.strokeWidth}
            opacity={t.opacity}
          />
        ))}

        <motion.g
          animate={dialControls}
          initial={{ rotate: 0 }}
          style={{ transformOrigin: "center", transformBox: "fill-box" }}
        >
          <circle
            cx="0"
            cy="0"
            r="95"
            fill="#0F0F0E"
            stroke="#8B7355"
            strokeWidth="1"
            opacity="0.6"
          />
          <circle
            cx="0"
            cy="0"
            r="82"
            fill="none"
            stroke="#8B7355"
            strokeWidth="0.6"
            opacity="0.35"
            strokeDasharray="1 3"
          />
          <path d="M 0,-88 L -4.5,-76 L 4.5,-76 Z" fill="#8B7355" />
        </motion.g>

        <circle
          cx="0"
          cy="0"
          r="14"
          fill="#8B7355"
          stroke="#0F0F0E"
          strokeWidth="2"
        />

        <text
          x="0"
          y="5"
          textAnchor="middle"
          fontFamily="Fraunces, Georgia, serif"
          fontSize="15"
          fontWeight="400"
          fill="#0F0F0E"
        >
          V
        </text>
      </motion.g>

      <motion.circle
        cx="0"
        cy="0"
        r="100"
        fill="#1A3D2E"
        initial={{ scale: 0, opacity: 0 }}
        animate={flashControls}
        style={{ transformOrigin: "center", transformBox: "fill-box" }}
      />

      <circle
        cx="0"
        cy="-240"
        r="3"
        fill={ledColor}
        className="vault-pulse"
      />
    </motion.svg>
  );
}

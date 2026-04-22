import { useEffect, useMemo, useState } from "react";
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

const COLOR = {
  obsidian: "#0F0F0E",
  obsidianSoft: "#1C1C1A",
  graphite: "#6B6B68",
  graphiteLight: "#9B9B96",
  hairline: "#E8E6E0",
  paper: "#FAFAF7",
  gold: "#8B7355",
  goldLight: "#A89074",
  forest: "#1A3D2E",
  forestDeep: "#0F2A1F",
  oxblood: "#7A1F1F",
};

type LedKey = "oxblood" | "gold" | "forest" | "graphite";
const LED_FILL: Record<LedKey, string> = {
  oxblood: COLOR.oxblood,
  gold: COLOR.gold,
  forest: COLOR.forest,
  graphite: COLOR.graphite,
};
const LED_OPACITY: Record<LedKey, number> = {
  oxblood: 1,
  gold: 1,
  forest: 1,
  graphite: 0.3,
};

const TICKS = Array.from({ length: 60 }, (_, i) => {
  const rad = ((i * 6) - 90) * (Math.PI / 180);
  const isMajor = i % 5 === 0;
  const length = isMajor ? 12 : 6;
  const outerR = 225;
  const innerR = outerR - length;
  return {
    x1: Math.cos(rad) * innerR,
    y1: Math.sin(rad) * innerR,
    x2: Math.cos(rad) * outerR,
    y2: Math.sin(rad) * outerR,
    isMajor,
  };
});

const RIVETS = Array.from({ length: 12 }, (_, i) => {
  const rad = ((i * 30) - 90) * (Math.PI / 180);
  return {
    cx: Math.cos(rad) * 290,
    cy: Math.sin(rad) * 290,
  };
});

const TUMBLERS = Array.from({ length: 5 }, (_, i) => {
  const angleTopDeg = i * 72;
  const angleSvgDeg = angleTopDeg - 90;
  const rad = angleSvgDeg * (Math.PI / 180);
  return {
    cx: Math.cos(rad) * 130,
    cy: Math.sin(rad) * 130,
    rotationDeg: angleSvgDeg,
  };
});

const LEDS = [
  { cx: Math.cos((-120 * Math.PI) / 180) * 195, cy: Math.sin((-120 * Math.PI) / 180) * 195 },
  { cx: 0, cy: -195 },
  { cx: Math.cos((-60 * Math.PI) / 180) * 195, cy: Math.sin((-60 * Math.PI) / 180) * 195 },
];

const LED_PROGRESSIONS: LedKey[][] = [
  ["oxblood", "graphite", "graphite"],
  ["gold", "graphite", "graphite"],
  ["gold", "gold", "graphite"],
  ["forest", "forest", "forest"],
];

export function VaultDoorSVG({ state, onUnlockComplete, className }: VaultDoorProps) {
  const handleControls = useAnimationControls();
  const tickControls = useAnimationControls();
  const arcControls = useAnimationControls();
  const doorFaceControls = useAnimationControls();
  const burstControls = useAnimationControls();
  const shakeControls = useAnimationControls();
  const interiorControls = useAnimationControls();

  const [activeTumblers, setActiveTumblers] = useState(0);
  const [ledLevel, setLedLevel] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    const timers: number[] = [];
    const schedule = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(fn, ms));
    };

    if (state === "idle") {
      handleControls.stop();
      handleControls.set({ rotate: 0 });
      handleControls.start({
        rotate: [0, 2, 0, -2, 0],
        transition: {
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
        },
      });
      tickControls.stop();
      tickControls.set({ rotate: 0 });
      tickControls.start({
        rotate: 360,
        transition: {
          duration: 60,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        },
      });
      arcControls.set({ pathLength: 0, opacity: 0 });
      doorFaceControls.set({ rotateY: 0, opacity: 1 });
      burstControls.set({ scale: 0, opacity: 0 });
      interiorControls.set({ opacity: 0 });
      setActiveTumblers(0);
      setLedLevel(0);
    } else if (state === "verifying") {
      handleControls.stop();
      handleControls.start({
        rotate: 90,
        transition: { duration: 0.8, ease: EASE_VAULT },
      });
      setLedLevel(1);
    } else if (state === "decrypting") {
      handleControls.start({
        rotate: 270,
        transition: { duration: 1.6, ease: "linear" },
      });
      arcControls.start({
        pathLength: 1,
        opacity: 1,
        transition: { duration: 1.6, ease: EASE_VAULT },
      });
      for (let i = 0; i < 5; i++) {
        schedule(i * 320, () => setActiveTumblers(i + 1));
      }
      schedule(500, () => setLedLevel(2));
    } else if (state === "opening") {
      tickControls.stop();
      handleControls.start({
        rotate: 810,
        transition: { duration: 0.6, ease: EASE_VAULT },
      });
      schedule(200, () => {
        doorFaceControls.start({
          rotateY: -85,
          opacity: 0.3,
          transition: { duration: 0.6, ease: EASE_VAULT },
        });
      });
      schedule(400, () => {
        burstControls.start({
          scale: [0, 500],
          opacity: [0, 0.7, 0],
          transition: { duration: 0.4, ease: EASE_VAULT_SLOW },
        });
        interiorControls.start({
          opacity: 0.3,
          transition: { duration: 0.4, ease: EASE_VAULT },
        });
      });
      schedule(500, () => {
        shakeControls.start({
          x: [0, -2, 2, -1.5, 1.5, -0.5, 0.5, 0],
          y: [0, 1, -1.5, 2, -2, 0.5, -0.5, 0],
          transition: { duration: 0.15, ease: "linear" },
        });
      });
      setLedLevel(3);
    } else if (state === "unlocked") {
      onUnlockComplete?.();
    }

    return () => timers.forEach(window.clearTimeout);
  }, [
    state,
    handleControls,
    tickControls,
    arcControls,
    doorFaceControls,
    burstControls,
    shakeControls,
    interiorControls,
    onUnlockComplete,
  ]);

  const particles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        x: -320 + i * 90 + (Math.random() * 40 - 20),
        startY: 350,
        yDelta: -700,
        duration: 9 + Math.random() * 3,
        delay: i * 1.15,
        r: 0.7 + Math.random() * 0.6,
      })),
    []
  );

  const ledColors = LED_PROGRESSIONS[ledLevel];

  return (
    <motion.div
      animate={shakeControls}
      className={cn("relative flex items-center justify-center", className)}
      style={{ perspective: "1400px" }}
    >
      <motion.svg
        className="block w-full h-full"
        viewBox="-370 -370 740 740"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: state === "unlocked" ? 0 : 1,
        }}
        transition={{
          scale: { duration: 1.2, ease: EASE_VAULT_SLOW },
          opacity: { duration: 0.4, ease: EASE_VAULT },
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <defs>
          <linearGradient id="steel-frame" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLOR.graphite} />
            <stop offset="50%" stopColor={COLOR.graphiteLight} />
            <stop offset="100%" stopColor={COLOR.graphite} />
          </linearGradient>

          <radialGradient id="door-face-grad" cx="40%" cy="25%" r="75%">
            <stop offset="0%" stopColor={COLOR.obsidianSoft} />
            <stop offset="100%" stopColor={COLOR.obsidian} />
          </radialGradient>

          <radialGradient id="recess-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="55%" stopColor={COLOR.obsidian} stopOpacity="0" />
            <stop offset="100%" stopColor={COLOR.obsidian} stopOpacity="0.9" />
          </radialGradient>

          <radialGradient
            id="ambient-deep"
            cx="0"
            cy="0"
            r="600"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={COLOR.forest} stopOpacity="0.04" />
            <stop offset="100%" stopColor={COLOR.forest} stopOpacity="0" />
          </radialGradient>

          <radialGradient
            id="ambient-gold"
            cx="0"
            cy="0"
            r="400"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={COLOR.gold} stopOpacity="0.05" />
            <stop offset="100%" stopColor={COLOR.gold} stopOpacity="0" />
          </radialGradient>

          <radialGradient id="vault-interior" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLOR.goldLight} stopOpacity="0.65" />
            <stop offset="55%" stopColor={COLOR.gold} stopOpacity="0.35" />
            <stop offset="100%" stopColor={COLOR.forestDeep} stopOpacity="0" />
          </radialGradient>

          <filter id="highlight-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="tumbler-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="led-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2" />
          </filter>

          <path
            id="label-top-v2"
            d="M -140,-310 A 340,340 0 0 1 140,-310"
            fill="none"
          />
          <path
            id="label-right-v2"
            d="M 310,-140 A 340,340 0 0 1 310,140"
            fill="none"
          />
          <path
            id="label-bottom-v2"
            d="M -140,310 A 340,340 0 0 0 140,310"
            fill="none"
          />
          <path
            id="label-left-v2"
            d="M -310,140 A 340,340 0 0 1 -310,-140"
            fill="none"
          />
        </defs>

        <circle cx="0" cy="0" r="600" fill="url(#ambient-deep)" />
        <circle cx="0" cy="0" r="400" fill="url(#ambient-gold)" />

        <g className="hidden lg:inline">
          <text
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="9"
            letterSpacing="4"
            fontWeight="600"
            fill={COLOR.graphiteLight}
          >
            <textPath href="#label-top-v2" startOffset="50%" textAnchor="middle">
              AV
            </textPath>
          </text>
          <text
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="8"
            letterSpacing="3.5"
            fontWeight="600"
            fill={COLOR.graphiteLight}
          >
            <textPath
              href="#label-right-v2"
              startOffset="50%"
              textAnchor="middle"
            >
              BAD BOYS BAIL BONDS
            </textPath>
          </text>
          <text
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="8"
            letterSpacing="3"
            fontWeight="600"
            fill={COLOR.graphiteLight}
          >
            <textPath
              href="#label-bottom-v2"
              startOffset="50%"
              textAnchor="middle"
            >
              SERIAL 0001 · EST MMXXVI
            </textPath>
          </text>
          <text
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="8"
            letterSpacing="3.5"
            fontWeight="600"
            fill={COLOR.graphiteLight}
          >
            <textPath
              href="#label-left-v2"
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
          r="310"
          fill="none"
          stroke="url(#steel-frame)"
          strokeWidth="3"
        />

        {RIVETS.map((r, i) => (
          <g key={`rivet-${i}`}>
            <circle cx={r.cx} cy={r.cy} r="5" fill={COLOR.graphite} />
            <circle
              cx={r.cx - 1.5}
              cy={r.cy - 1.5}
              r="2"
              fill={COLOR.paper}
              opacity="0.22"
            />
          </g>
        ))}

        <circle
          cx="0"
          cy="0"
          r="275"
          fill={COLOR.obsidian}
          stroke={COLOR.graphite}
          strokeOpacity="0.3"
          strokeWidth="1"
        />
        <circle
          cx="0"
          cy="0"
          r="275"
          fill="url(#recess-shadow)"
          pointerEvents="none"
        />

        <g transform="rotate(-90 0 0)">
          <motion.circle
            cx="0"
            cy="0"
            r="310"
            fill="none"
            stroke={COLOR.gold}
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={arcControls}
          />
        </g>

        <motion.circle
          cx="0"
          cy="0"
          r="255"
          fill="url(#vault-interior)"
          initial={{ opacity: 0 }}
          animate={interiorControls}
        />

        <motion.g
          animate={doorFaceControls}
          initial={{ rotateY: 0, opacity: 1 }}
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            transformStyle: "preserve-3d",
          }}
        >
          <circle cx="0" cy="0" r="255" fill="url(#door-face-grad)" />

          <path
            d="M -200,-160 A 255,255 0 0 1 200,-160"
            fill="none"
            stroke={COLOR.paper}
            strokeOpacity="0.08"
            strokeWidth="2.5"
            filter="url(#highlight-blur)"
          />

          {[235, 210, 180, 150].map((radius) => {
            const chord = radius * 0.5;
            const chordY = -radius * 0.866;
            return (
              <g key={`etched-${radius}`}>
                <circle
                  cx="0"
                  cy="0"
                  r={radius}
                  fill="none"
                  stroke={COLOR.hairline}
                  strokeWidth="0.75"
                  opacity="0.12"
                />
                <path
                  d={`M ${-chord},${chordY} A ${radius},${radius} 0 0 1 ${chord},${chordY}`}
                  fill="none"
                  stroke={COLOR.paper}
                  strokeOpacity="0.05"
                  strokeWidth="0.8"
                />
              </g>
            );
          })}

          <motion.g
            animate={tickControls}
            initial={{ rotate: 0 }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            {TICKS.map((t, i) => (
              <line
                key={`tick-${i}`}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={t.isMajor ? COLOR.gold : COLOR.graphite}
                strokeOpacity={t.isMajor ? 0.6 : 0.4}
                strokeWidth={t.isMajor ? 1 : 0.6}
              />
            ))}
          </motion.g>

          {TUMBLERS.map((t, i) => {
            const active = i < activeTumblers;
            return (
              <g
                key={`tumbler-${i}`}
                transform={`translate(${t.cx} ${t.cy}) rotate(${t.rotationDeg})`}
              >
                {active ? (
                  <rect
                    x="-12"
                    y="-4"
                    width="24"
                    height="8"
                    rx="4"
                    fill={COLOR.gold}
                    opacity="0.65"
                    filter="url(#tumbler-glow)"
                  />
                ) : null}
                <motion.rect
                  x="-12"
                  y="-4"
                  width="24"
                  height="8"
                  rx="4"
                  fill={active ? COLOR.gold : COLOR.obsidianSoft}
                  stroke={active ? COLOR.goldLight : COLOR.graphite}
                  strokeOpacity={active ? 0.9 : 0.5}
                  strokeWidth="0.6"
                  initial={{ scale: 1 }}
                  animate={active ? { scale: [0.9, 1.15, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3, ease: EASE_VAULT_SLOW }}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                />
              </g>
            );
          })}

          <motion.g
            animate={handleControls}
            initial={{ rotate: 0 }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            <circle
              cx="0"
              cy="0"
              r="90"
              fill="none"
              stroke={COLOR.gold}
              strokeOpacity="0.8"
              strokeWidth="2.5"
            />

            {[0, 90, 180, 270].map((deg) => (
              <g key={`spoke-${deg}`} transform={`rotate(${deg})`}>
                <line
                  x1="30"
                  y1="0"
                  x2="85"
                  y2="0"
                  stroke={COLOR.gold}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <line
                  x1="32"
                  y1="-1.2"
                  x2="83"
                  y2="-1.2"
                  stroke={COLOR.goldLight}
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity="0.75"
                />
                <circle cx="85" cy="0" r="5" fill={COLOR.gold} />
              </g>
            ))}

            <circle
              cx="0"
              cy="0"
              r="30"
              fill={COLOR.gold}
              stroke={COLOR.obsidian}
              strokeWidth="3"
            />
            <line
              x1="-7"
              y1="0"
              x2="7"
              y2="0"
              stroke={COLOR.obsidian}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <line
              x1="0"
              y1="-7"
              x2="0"
              y2="7"
              stroke={COLOR.obsidian}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </motion.g>

          {LEDS.map((led, i) => {
            const key = ledColors[i];
            const color = LED_FILL[key];
            const opacity = LED_OPACITY[key];
            const pulsing = i === 0 && state === "idle";
            return (
              <g key={`led-${i}`}>
                <circle
                  cx={led.cx}
                  cy={led.cy}
                  r="6"
                  fill={color}
                  opacity={opacity * 0.45}
                  filter="url(#led-glow)"
                />
                <circle
                  cx={led.cx}
                  cy={led.cy}
                  r="4"
                  fill={color}
                  opacity={opacity}
                  className={pulsing ? "vault-pulse" : undefined}
                />
              </g>
            );
          })}
        </motion.g>

        <motion.g
          animate={burstControls}
          initial={{ scale: 0, opacity: 0 }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <circle cx="0" cy="0" r="1" fill={COLOR.goldLight} />
        </motion.g>

        {particles.map((p, i) => (
          <motion.g
            key={`particle-${i}`}
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: p.yDelta,
              opacity: [0, 0.25, 0.25, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
            }}
          >
            <circle cx={p.x} cy={p.startY} r={p.r} fill={COLOR.goldLight} />
          </motion.g>
        ))}
      </motion.svg>
    </motion.div>
  );
}

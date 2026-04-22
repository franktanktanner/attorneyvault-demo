import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export interface VaultSealProps {
  timestamp?: string;
  size?: number;
  className?: string;
}

const CIRCLE_TEXT = "· VERIFIED · AUTHENTICATED · VAULT CERTIFIED ";

export function VaultSeal({ timestamp, size = 48, className }: VaultSealProps) {
  const pathId = "vault-seal-path";
  const fontSize = Math.max(5, Math.round(size * 0.1));

  return (
    <div
      className={cn("inline-flex flex-col items-center gap-2", className)}
      style={{ width: size }}
    >
      <motion.div
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ rotate: 360, opacity: 1 }}
        transition={{
          rotate: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 0.4 },
        }}
        style={{ width: size, height: size }}
        className="relative"
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="overflow-visible"
        >
          <defs>
            <path
              id={pathId}
              d="M 50,50 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"
              fill="none"
            />
          </defs>
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="#E8E6E0"
            strokeWidth="1"
          />
          <circle
            cx="50"
            cy="50"
            r="33"
            fill="none"
            stroke="#1A3D2E"
            strokeWidth="1"
          />
          <circle cx="50" cy="50" r="16" fill="#1A3D2E" />
          <path
            d="M 44 50 L 48 54 L 56 46"
            fill="none"
            stroke="#FAFAF7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            fill="#6B6B68"
            fontFamily="Inter, sans-serif"
            fontSize={fontSize}
            fontWeight="600"
            letterSpacing="2"
            textRendering="geometricPrecision"
          >
            <textPath href={`#${pathId}`} startOffset="0">
              {CIRCLE_TEXT}
              {CIRCLE_TEXT}
            </textPath>
          </text>
        </svg>
      </motion.div>
      {timestamp ? (
        <span className="label-eyebrow num-mono text-vault-graphite">
          {timestamp}
        </span>
      ) : null}
    </div>
  );
}

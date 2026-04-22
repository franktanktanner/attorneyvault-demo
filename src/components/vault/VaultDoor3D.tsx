import {
  Suspense,
  useEffect,
  useRef,
  useState,
  Component,
  type ReactNode,
  type ErrorInfo,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Sparkles } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { motion } from "framer-motion";
import * as THREE from "three";
import { cn } from "../../lib/utils";
import { VaultDoorSVG } from "./VaultDoorSVG";

export type VaultDoorState =
  | "idle"
  | "verifying"
  | "decrypting"
  | "opening"
  | "unlocked";

export interface VaultDoor3DProps {
  state: VaultDoorState;
  onUnlockComplete?: () => void;
  className?: string;
}

const COLOR = {
  bg: "#050505",
  obsidian: "#0F0F0E",
  obsidianSoft: "#1A1A18",
  black: "#0A0A0A",
  gold: "#8B7355",
  goldHi: "#D4A757",
  goldWarm: "#4a3d2a",
  goldEmber: "#3a2e1a",
  forest: "#1A3D2E",
  keyLight: "#FFD89B",
  fillLight: "#6B8E9E",
  screwShadow: "#000000",
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

interface NumAnim {
  value: number;
  target: number;
  startValue: number;
  startTime: number;
  duration: number;
  easing: (t: number) => number;
  active: boolean;
}

function makeAnim(initial: number): NumAnim {
  return {
    value: initial,
    target: initial,
    startValue: initial,
    startTime: 0,
    duration: 0,
    easing: easeOut,
    active: false,
  };
}

function startAnim(
  anim: NumAnim,
  target: number,
  duration: number,
  easing: (t: number) => number,
  startTime: number
) {
  anim.startValue = anim.value;
  anim.target = target;
  anim.startTime = startTime;
  anim.duration = duration;
  anim.easing = easing;
  anim.active = true;
}

function tickAnim(anim: NumAnim, currentTime: number): number {
  if (!anim.active) return anim.value;
  const raw = (currentTime - anim.startTime) / anim.duration;
  if (raw >= 1) {
    anim.value = anim.target;
    anim.active = false;
    return anim.value;
  }
  const progress = Math.max(0, raw);
  anim.value =
    anim.startValue +
    (anim.target - anim.startValue) * anim.easing(progress);
  return anim.value;
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.1} color={COLOR.forest} />
      <hemisphereLight args={[COLOR.obsidian, COLOR.obsidianSoft, 0.2]} />
      <directionalLight
        position={[5, 4, 6]}
        color={COLOR.keyLight}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <directionalLight
        position={[-4, 2, 3]}
        color={COLOR.fillLight}
        intensity={0.4}
      />
      <spotLight
        position={[0, 1, -3]}
        color={COLOR.gold}
        intensity={2.0}
        angle={0.6}
        penumbra={0.5}
        target-position={[0, 0, 0]}
      />
    </>
  );
}

function CameraController({ state }: { state: VaultDoorState }) {
  const { camera } = useThree();
  const camZ = useRef(makeAnim(7));
  const shakeUntilRef = useRef(0);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
    const now = performance.now() / 1000;

    if (state === "idle") {
      startAnim(camZ.current, 7, 0.8, easeInOut, now);
    } else if (state === "verifying") {
      // hold
    } else if (state === "decrypting") {
      startAnim(camZ.current, 5.5, 1.6, easeOut, now);
    } else if (state === "opening") {
      startAnim(camZ.current, 4.5, 0.6, easeOut, now);
      const shakeTimer = window.setTimeout(() => {
        shakeUntilRef.current = performance.now() / 1000 + 0.25;
      }, 400);
      return () => window.clearTimeout(shakeTimer);
    } else if (state === "unlocked") {
      startAnim(camZ.current, 2.5, 0.4, easeOut, now);
    }
  }, [state]);

  useFrame(({ clock }) => {
    const now = performance.now() / 1000;
    tickAnim(camZ.current, now);

    const breathing =
      stateRef.current === "idle"
        ? Math.sin(clock.elapsedTime / 4) * 0.2
        : 0;

    let shakeX = 0;
    let shakeY = 0;
    if (now < shakeUntilRef.current) {
      shakeX = (Math.random() - 0.5) * 0.12;
      shakeY = (Math.random() - 0.5) * 0.12;
    }

    camera.position.set(
      2.5 + shakeX,
      0.5 + shakeY,
      camZ.current.value + breathing
    );
    camera.lookAt(0, 0, 0);
  });

  return null;
}

interface RivetProps {
  angle: number;
}

function Rivet({ angle }: RivetProps) {
  const x = Math.cos(angle) * 2.85;
  const y = Math.sin(angle) * 2.85;
  return (
    <mesh position={[x, y, 0.32]} scale={[1, 1, 0.6]} castShadow>
      <sphereGeometry args={[0.09, 20, 14]} />
      <meshStandardMaterial
        color={COLOR.gold}
        metalness={1.0}
        roughness={0.25}
        emissive={COLOR.goldWarm}
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}

interface TumblerProps {
  index: number;
  active: boolean;
}

function Tumbler({ index, active }: TumblerProps) {
  const angleTopCw = (index * 72 * Math.PI) / 180;
  const x = Math.sin(angleTopCw) * 1.4;
  const y = Math.cos(angleTopCw) * 1.4;
  const meshRef = useRef<THREE.Mesh>(null);
  const scaleAnim = useRef(makeAnim(1));

  useEffect(() => {
    if (active) {
      const now = performance.now() / 1000;
      scaleAnim.current.value = 0.9;
      startAnim(scaleAnim.current, 1.3, 0.15, easeOut, now);
      const timer = window.setTimeout(() => {
        const t2 = performance.now() / 1000;
        startAnim(scaleAnim.current, 1.0, 0.15, easeInOut, t2);
      }, 150);
      return () => window.clearTimeout(timer);
    } else {
      scaleAnim.current.value = 1;
      scaleAnim.current.active = false;
    }
  }, [active]);

  useFrame(() => {
    if (meshRef.current) {
      const now = performance.now() / 1000;
      tickAnim(scaleAnim.current, now);
      meshRef.current.scale.setScalar(scaleAnim.current.value);
    }
  });

  return (
    <group position={[x, y, 0.35]} rotation={[0, 0, -angleTopCw]}>
      <mesh ref={meshRef} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.28, 20]} />
        <meshStandardMaterial
          color={active ? COLOR.gold : COLOR.obsidianSoft}
          metalness={active ? 1.0 : 0.9}
          roughness={active ? 0.2 : 0.4}
          emissive={active ? COLOR.goldHi : "#000000"}
          emissiveIntensity={active ? 2.0 : 0}
        />
      </mesh>
      {active ? (
        <pointLight
          color={COLOR.goldHi}
          intensity={1.5}
          distance={1.2}
          decay={2}
        />
      ) : null}
    </group>
  );
}

function VaultDoorMesh({ state, onUnlockComplete }: VaultDoor3DProps) {
  const hingeRef = useRef<THREE.Group>(null);
  const handleRef = useRef<THREE.Group>(null);
  const burstRef = useRef<THREE.Mesh>(null);
  const burstMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const interiorLightRef = useRef<THREE.PointLight>(null);
  const stateRef = useRef(state);

  const handleRotZ = useRef(makeAnim(0));
  const hingeRotY = useRef(makeAnim(0));
  const burstScale = useRef(makeAnim(0));
  const burstOpacity = useRef(makeAnim(0));
  const interiorIntensity = useRef(makeAnim(0));

  const [activeTumblers, setActiveTumblers] = useState(0);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    stateRef.current = state;
    const now = performance.now() / 1000;
    const schedule = (ms: number, fn: () => void) => {
      timersRef.current.push(window.setTimeout(fn, ms));
    };

    if (state === "idle") {
      startAnim(handleRotZ.current, 0, 0.8, easeInOut, now);
      startAnim(hingeRotY.current, 0, 0.8, easeInOut, now);
      startAnim(burstScale.current, 0, 0.3, easeOut, now);
      startAnim(burstOpacity.current, 0, 0.3, easeOut, now);
      startAnim(interiorIntensity.current, 0, 0.3, easeOut, now);
      setActiveTumblers(0);
    } else if (state === "verifying") {
      startAnim(
        handleRotZ.current,
        handleRotZ.current.value + Math.PI / 2,
        0.8,
        easeOut,
        now
      );
    } else if (state === "decrypting") {
      startAnim(
        handleRotZ.current,
        handleRotZ.current.value + Math.PI,
        1.6,
        easeInOut,
        now
      );
      for (let i = 0; i < 5; i++) {
        schedule(i * 320, () => {
          setActiveTumblers((prev) => Math.max(prev, i + 1));
        });
      }
    } else if (state === "opening") {
      startAnim(
        handleRotZ.current,
        handleRotZ.current.value + 3 * Math.PI,
        0.6,
        easeOut,
        now
      );
      schedule(200, () => {
        const t2 = performance.now() / 1000;
        startAnim(
          hingeRotY.current,
          -(95 * Math.PI) / 180,
          0.6,
          easeInOut,
          t2
        );
      });
      schedule(400, () => {
        const t2 = performance.now() / 1000;
        startAnim(burstScale.current, 8, 0.4, easeOut, t2);
        startAnim(burstOpacity.current, 0.8, 0.15, easeOut, t2);
        startAnim(interiorIntensity.current, 5, 0.4, easeOut, t2);
      });
      schedule(550, () => {
        const t3 = performance.now() / 1000;
        startAnim(burstOpacity.current, 0, 0.25, easeOut, t3);
      });
    } else if (state === "unlocked") {
      if (onUnlockComplete) {
        schedule(400, () => onUnlockComplete());
      }
    }

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [state, onUnlockComplete]);

  useFrame(({ clock }) => {
    const now = performance.now() / 1000;
    tickAnim(handleRotZ.current, now);
    tickAnim(hingeRotY.current, now);
    tickAnim(burstScale.current, now);
    tickAnim(burstOpacity.current, now);
    tickAnim(interiorIntensity.current, now);

    if (handleRef.current) {
      const breathing =
        stateRef.current === "idle"
          ? Math.sin(clock.elapsedTime / 2) * 0.035
          : 0;
      handleRef.current.rotation.z = handleRotZ.current.value + breathing;
    }

    if (hingeRef.current) {
      hingeRef.current.rotation.y = hingeRotY.current.value;
    }

    if (burstRef.current) {
      burstRef.current.scale.setScalar(Math.max(0.0001, burstScale.current.value));
      burstRef.current.visible = burstScale.current.value > 0.01;
    }

    if (burstMatRef.current) {
      burstMatRef.current.opacity = burstOpacity.current.value;
    }

    if (interiorLightRef.current) {
      interiorLightRef.current.intensity = interiorIntensity.current.value;
    }
  });

  const rivetAngles = Array.from(
    { length: 12 },
    (_, i) => (i * Math.PI * 2) / 12 - Math.PI / 2
  );

  return (
    <group>
      {/* Outer stationary frame */}
      <mesh receiveShadow>
        <torusGeometry args={[3.2, 0.45, 48, 128]} />
        <meshStandardMaterial
          color={COLOR.black}
          metalness={0.95}
          roughness={0.45}
        />
      </mesh>

      {/* Interior glow (behind door, reveals on opening) */}
      <pointLight
        ref={interiorLightRef}
        position={[0, 0, -1.2]}
        color={COLOR.goldHi}
        intensity={0}
        distance={12}
        decay={2}
      />

      {/* Door body, hinged on the left edge */}
      <group ref={hingeRef} position={[-3, 0, 0]}>
        <group position={[3, 0, 0]}>
          {/* Main cylinder body */}
          <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[3, 3, 0.6, 96]} />
            <meshStandardMaterial
              color={COLOR.obsidian}
              metalness={0.9}
              roughness={0.55}
            />
          </mesh>

          {/* Etched concentric rings on front face */}
          {[2.7, 2.4, 2.0, 1.6, 1.2].map((radius) => (
            <mesh key={radius} position={[0, 0, 0.3]}>
              <torusGeometry args={[radius, 0.018, 10, 96]} />
              <meshStandardMaterial
                color={COLOR.obsidianSoft}
                metalness={0.85}
                roughness={0.3}
              />
            </mesh>
          ))}

          {/* Gold rivets */}
          {rivetAngles.map((angle, i) => (
            <Rivet key={i} angle={angle} />
          ))}

          {/* Tumblers */}
          {Array.from({ length: 5 }, (_, i) => (
            <Tumbler key={i} index={i} active={i < activeTumblers} />
          ))}

          {/* Handle wheel */}
          <group ref={handleRef}>
            {/* Rim */}
            <mesh castShadow position={[0, 0, 0.35]}>
              <torusGeometry args={[0.9, 0.08, 20, 64]} />
              <meshStandardMaterial
                color={COLOR.gold}
                metalness={1.0}
                roughness={0.25}
              />
            </mesh>

            {/* Hub */}
            <mesh
              castShadow
              position={[0, 0, 0.4]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.35, 0.35, 0.15, 40]} />
              <meshStandardMaterial
                color={COLOR.gold}
                metalness={1.0}
                roughness={0.15}
                emissive={COLOR.goldEmber}
                emissiveIntensity={0.25}
              />
            </mesh>

            {/* Spokes with grip nubs */}
            {[0, 90, 180, 270].map((deg) => {
              const angle = (deg * Math.PI) / 180;
              return (
                <group key={deg} rotation={[0, 0, angle]}>
                  <mesh castShadow position={[0.615, 0, 0.35]}>
                    <boxGeometry args={[0.53, 0.09, 0.07]} />
                    <meshStandardMaterial
                      color={COLOR.gold}
                      metalness={1.0}
                      roughness={0.25}
                    />
                  </mesh>
                  <mesh castShadow position={[0.87, 0, 0.35]}>
                    <sphereGeometry args={[0.09, 16, 12]} />
                    <meshStandardMaterial
                      color={COLOR.gold}
                      metalness={1.0}
                      roughness={0.25}
                    />
                  </mesh>
                </group>
              );
            })}

            {/* Center screw disc */}
            <mesh position={[0, 0, 0.485]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.11, 0.11, 0.02, 24]} />
              <meshStandardMaterial
                color={COLOR.black}
                metalness={0.9}
                roughness={0.4}
              />
            </mesh>
            {/* Cross slot */}
            <mesh position={[0, 0, 0.497]}>
              <boxGeometry args={[0.16, 0.015, 0.006]} />
              <meshBasicMaterial color={COLOR.screwShadow} />
            </mesh>
            <mesh position={[0, 0, 0.497]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.16, 0.015, 0.006]} />
              <meshBasicMaterial color={COLOR.screwShadow} />
            </mesh>
          </group>

          {/* Engraved AV monogram above the handle */}
          <Text
            position={[0, 1.75, 0.34]}
            fontSize={0.22}
            color={COLOR.gold}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.25}
            outlineWidth={0}
          >
            AV
          </Text>

          {/* Gold burst (triggered on opening) */}
          <mesh ref={burstRef} position={[0, 0, 0.6]} visible={false}>
            <sphereGeometry args={[1, 48, 32]} />
            <meshStandardMaterial
              ref={burstMatRef}
              color={COLOR.goldHi}
              emissive={COLOR.goldHi}
              emissiveIntensity={3.0}
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>

      {/* Ambient dust motes */}
      <Sparkles
        count={14}
        scale={[6, 4, 6]}
        size={3}
        speed={0.15}
        color={COLOR.goldHi}
        opacity={0.45}
      />
    </group>
  );
}

class Canvas3DErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("VaultDoor3D WebGL error", error, info);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-vault-gold vault-pulse" />
      <span className="label-eyebrow text-vault-graphite-light">
        LOADING VAULT ENVIRONMENT
      </span>
    </div>
  );
}

export function VaultDoor3D({
  state,
  onUnlockComplete,
  className,
}: VaultDoor3DProps) {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setFadeIn(true), 140);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div
      className={cn("relative w-full h-full overflow-hidden", className)}
      style={{ backgroundColor: COLOR.bg }}
    >
      <Canvas3DErrorBoundary
        fallback={
          <div className="absolute inset-0 flex items-center justify-center">
            <VaultDoorSVG
              state={state}
              onUnlockComplete={onUnlockComplete}
              className="w-80 h-80 md:w-[420px] md:h-[420px] lg:w-[520px] lg:h-[520px]"
            />
          </div>
        }
      >
        <Suspense fallback={<LoadingOverlay />}>
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: fadeIn ? 1 : 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Canvas
              dpr={[1, 2]}
              shadows
              gl={{
                antialias: true,
                powerPreference: "high-performance",
                alpha: false,
              }}
              camera={{ position: [2.5, 0.5, 7], fov: 35 }}
            >
              <color attach="background" args={[COLOR.bg]} />
              <fogExp2 attach="fog" args={[COLOR.bg, 0.035]} />

              <Lighting />
              <CameraController state={state} />
              <VaultDoorMesh
                state={state}
                onUnlockComplete={onUnlockComplete}
              />

              <EffectComposer multisampling={0}>
                <Bloom
                  luminanceThreshold={0.65}
                  luminanceSmoothing={0.3}
                  intensity={0.9}
                  mipmapBlur
                />
                <Vignette offset={0.35} darkness={0.7} />
                <ChromaticAberration
                  offset={new THREE.Vector2(0.0005, 0.0005)}
                  blendFunction={BlendFunction.NORMAL}
                  radialModulation={false}
                  modulationOffset={0}
                />
                <Noise opacity={0.02} premultiply />
              </EffectComposer>
            </Canvas>
          </motion.div>
        </Suspense>
      </Canvas3DErrorBoundary>
    </div>
  );
}

export default VaultDoor3D;

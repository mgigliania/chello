"use client";

import {
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type RefObject,
} from "react";

const POINTS = 12;
const SIZE = 100;
const CENTER = SIZE / 2;

/**
 * Two overlapping sine waves around a 12-point ring, smoothed through the
 * midpoints so the silhouette never shows a corner. Energy widens the second
 * wave, which reads as the orb leaning into whoever is talking.
 */
function blobPath(phase: number, energy: number): string {
  const points: Array<[number, number]> = [];
  for (let index = 0; index < POINTS; index += 1) {
    const angle = (index / POINTS) * Math.PI * 2;
    const wave =
      Math.sin(angle * 3 + phase) * 0.021 +
      Math.cos(angle * 2 - phase * 0.7) * (0.012 + energy * 0.025);
    const radius = SIZE * (0.47 + wave);
    points.push([
      CENTER + Math.cos(angle) * radius,
      CENTER + Math.sin(angle) * radius,
    ]);
  }

  const mid = (a: [number, number], b: [number, number]) =>
    [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as [number, number];

  const first = mid(points[POINTS - 1], points[0]);
  let path = `M${first[0].toFixed(2)},${first[1].toFixed(2)}`;
  for (let index = 0; index < POINTS; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % POINTS];
    const target = mid(current, next);
    path += ` Q${current[0].toFixed(2)},${current[1].toFixed(2)} ${target[0].toFixed(2)},${target[1].toFixed(2)}`;
  }
  return `${path} Z`;
}

export type OrbMood = "idle" | "listening" | "speaking" | "thinking";

interface Props {
  mood: OrbMood;
  /** 0–1. A ref is preferred for live values: the animation reads it each
   *  frame, so the orb can react without re-rendering its parent. */
  energy?: number | RefObject<number>;
  className?: string;
}

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(callback: () => void) {
  const query = window.matchMedia(REDUCED_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

export function Orb({ mood, energy = 0, className }: Props) {
  const id = useId().replace(/:/g, "");
  const pathRef = useRef<SVGPathElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const reduced = useSyncExternalStore(
    subscribeToMotionPreference,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );

  // The animation loop must not restart when mood or energy changes, so both
  // are read through refs that are refreshed after render.
  const energyRef = useRef<number | RefObject<number>>(energy);
  const moodRef = useRef<OrbMood>(mood);

  useEffect(() => {
    energyRef.current = energy;
  }, [energy]);

  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    if (reduced) {
      pathRef.current?.setAttribute("d", blobPath(0, 0));
      return;
    }

    let frame = 0;
    let smoothed = 0;
    let last = 0;

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      // 30fps is plenty for a shape this soft, and halves the work on phones.
      if (now - last < 33) return;
      last = now;

      const source = energyRef.current;
      const live = typeof source === "number" ? source : (source.current ?? 0);
      const target = moodRef.current === "idle" ? 0 : live;
      smoothed += (target - smoothed) * 0.18;

      const seconds = now / 1000;
      const phase = seconds * 0.72;
      pathRef.current?.setAttribute("d", blobPath(phase, smoothed));

      const float = Math.sin(seconds * 0.9) * 1.6;
      const spin = Math.sin(phase * 0.5) * 3;
      const scale = 1 + smoothed * 0.045;
      groupRef.current?.setAttribute(
        "transform",
        `translate(${CENTER} ${CENTER + float}) rotate(${spin}) scale(${scale}) translate(${-CENTER} ${-CENTER})`,
      );
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  const listening = mood === "listening";

  return (
    <svg
      viewBox={`-14 -14 ${SIZE + 28} ${SIZE + 28}`}
      className={className}
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={`${id}-clip`}>
          <path ref={pathRef} d={blobPath(0, 0)} />
        </clipPath>
        <linearGradient id={`${id}-base`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFEFDC" />
          <stop offset="36%" stopColor="#D79BF2" />
          <stop offset="70%" stopColor="#6A44E8" />
          <stop offset="100%" stopColor="#38208F" />
        </linearGradient>
        <radialGradient id={`${id}-rose`}>
          <stop offset="0%" stopColor="#FF9EC4" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FF9EC4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-peach`}>
          <stop offset="0%" stopColor="#FFC58C" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFC58C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-core`}>
          <stop offset="0%" stopColor="#9E72FF" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#8E6CFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-dot`}>
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F4D9E5" />
          <stop offset="100%" stopColor="#C7A6F5" />
        </radialGradient>
        <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* Contact shadow keeps the orb sitting in the page rather than floating. */}
      <ellipse
        cx={CENTER}
        cy={CENTER + 47}
        rx={28}
        ry={4}
        fill="#6E4FE0"
        opacity="0.14"
        filter={`url(#${id}-shadow)`}
      />

      {listening && (
        <>
          <circle
            cx={CENTER}
            cy={CENTER}
            r={53}
            fill="none"
            stroke="#6E4FE0"
            strokeWidth="0.6"
            opacity="0.2"
            className="halo"
            style={{ transformOrigin: "center" }}
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={59}
            fill="none"
            stroke="#6E4FE0"
            strokeWidth="0.6"
            opacity="0.1"
            className="halo"
            style={{ transformOrigin: "center", animationDelay: "0.5s" }}
          />
        </>
      )}

      <g ref={groupRef}>
        <g clipPath={`url(#${id}-clip)`}>
          <rect x="0" y="0" width={SIZE} height={SIZE} fill={`url(#${id}-base)`} />
          <ellipse
            cx={70}
            cy={26}
            rx={34}
            ry={30}
            fill={`url(#${id}-rose)`}
            filter={`url(#${id}-soft)`}
          />
          <ellipse
            cx={24}
            cy={72}
            rx={32}
            ry={28}
            fill={`url(#${id}-peach)`}
            filter={`url(#${id}-soft)`}
          />
          <ellipse cx={46} cy={52} rx={40} ry={36} fill={`url(#${id}-core)`} />
          {/* Specular highlight — the single cue that reads as glass. */}
          <ellipse
            cx={32}
            cy={24}
            rx={19}
            ry={6}
            fill="#FFFFFF"
            opacity="0.5"
            transform="rotate(-28 32 24)"
            filter={`url(#${id}-soft)`}
          />
        </g>
      </g>

      <circle cx={CENTER + 55} cy={CENTER - 24} r={3.4} fill={`url(#${id}-dot)`} />
      <circle cx={CENTER - 54} cy={CENTER + 26} r={2} fill="#E6D8FA" />
    </svg>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  label?: string;
  accent?: string; // CSS color for --accent
};

/** Animated circular readiness gauge — sweeps + counts up on mount. */
export default function ReadinessRing({
  value,
  size = 104,
  stroke = 6,
  label = "READY",
  accent,
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const dur = 1200;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(eased * value));
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size, ...(accent ? ({ "--accent": accent } as React.CSSProperties) : {}) }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle
          className="ring-prog"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <b className="font-display text-[1.3rem] text-ink leading-none">{shown}%</b>
        <span className="eyebrow mt-1 !text-[0.5rem]">{label}</span>
      </div>
    </div>
  );
}

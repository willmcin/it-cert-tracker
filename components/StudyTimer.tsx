"use client";

import { useState, useEffect, useRef } from "react";
import type { StudySession } from "@/hooks/useCertProgress";

type Props = {
  totalMinutes: number;
  onSessionComplete: (session: StudySession) => void;
};

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatTotal(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function StudyTimer({ totalMinutes, onSessionComplete }: Props) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now() - elapsed * 1000;
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // elapsed is intentionally read once on start; including it would reset the interval each tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function handleStop() {
    setRunning(false);
    const minutes = Math.max(1, Math.round(elapsed / 60));
    onSessionComplete({
      date: new Date().toISOString().slice(0, 10),
      durationMinutes: minutes,
    });
    setElapsed(0);
  }

  function handleDiscard() {
    setRunning(false);
    setElapsed(0);
  }

  return (
    <div className="panel panel-accent flex items-center gap-4 p-4" style={{ "--accent": running ? "var(--color-go)" : "var(--color-cyan)" } as React.CSSProperties}>
      <div className="flex-1">
        <p className="eyebrow mb-1 flex items-center gap-2">
          {running && <span className="w-1.5 h-1.5 rounded-full bg-go mc-dot" />}
          MISSION CLOCK
        </p>
        <p className={`text-3xl font-display tabular-nums ${running ? "text-go" : "text-dim"}`} style={running ? { textShadow: "0 0 12px rgba(127,255,176,.4)" } : undefined}>
          {formatElapsed(elapsed)}
        </p>
      </div>

      <div className="text-right border-r border-line pr-4">
        <p className="eyebrow mb-1">ON CONSOLE</p>
        <p className="text-sm font-medium text-ink">
          {totalMinutes > 0 ? formatTotal(totalMinutes) : "—"}
        </p>
      </div>

      <div className="flex gap-2">
        {!running ? (
          <button onClick={() => setRunning(true)} className="btn btn-active">
            {elapsed > 0 ? "▸ Resume" : "▸ Start"}
          </button>
        ) : (
          <>
            <button onClick={handleStop} className="btn btn-go">
              ■ Log
            </button>
            <button onClick={handleDiscard} className="btn">
              Discard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

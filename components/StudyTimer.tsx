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
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/60 border border-gray-700">
      <div className="flex-1">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Study Timer</p>
        <p className={`text-2xl font-mono font-bold ${running ? "text-white" : "text-gray-400"}`}>
          {formatElapsed(elapsed)}
        </p>
      </div>

      <div className="text-right">
        <p className="text-xs text-gray-500 mb-0.5">Total studied</p>
        <p className="text-sm font-semibold text-gray-300">
          {totalMinutes > 0 ? formatTotal(totalMinutes) : "—"}
        </p>
      </div>

      <div className="flex gap-2">
        {!running ? (
          <button
            onClick={() => setRunning(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            {elapsed > 0 ? "Resume" : "Start"}
          </button>
        ) : (
          <>
            <button
              onClick={handleStop}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
            >
              Log
            </button>
            <button
              onClick={handleDiscard}
              className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm transition-colors"
            >
              Discard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

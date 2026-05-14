"use client";

import { useState, useEffect, useCallback } from "react";

export type CertStatus = "not-started" | "in-progress" | "passed";

export type CertEntry = {
  status: CertStatus;
  topicProgress: Record<string, boolean>;
  notes: string;
  targetDate?: string;
  passedDate?: string;
};

export type ProgressMap = Record<string, CertEntry>;

const STORAGE_KEY = "cert-tracker-progress";

function defaultEntry(): CertEntry {
  return { status: "not-started", topicProgress: {}, notes: "" };
}

function load(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(data: ProgressMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useCertProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    setProgress(load());
  }, []);

  const getEntry = useCallback(
    (certId: string): CertEntry => progress[certId] ?? defaultEntry(),
    [progress]
  );

  const updateEntry = useCallback(
    (certId: string, patch: Partial<CertEntry>) => {
      setProgress((prev) => {
        const updated = {
          ...prev,
          [certId]: { ...(prev[certId] ?? defaultEntry()), ...patch },
        };
        save(updated);
        return updated;
      });
    },
    []
  );

  const setTopicDone = useCallback(
    (certId: string, topicId: string, done: boolean) => {
      setProgress((prev) => {
        const entry = prev[certId] ?? defaultEntry();
        const topicProgress = { ...entry.topicProgress, [topicId]: done };
        const updated = { ...prev, [certId]: { ...entry, topicProgress } };
        save(updated);
        return updated;
      });
    },
    []
  );

  const topicCompletionRate = useCallback(
    (certId: string, topics: string[]): number => {
      if (topics.length === 0) return 0;
      const entry = progress[certId];
      if (!entry) return 0;
      const done = topics.filter((t) => entry.topicProgress[t]).length;
      return Math.round((done / topics.length) * 100);
    },
    [progress]
  );

  return { progress, getEntry, updateEntry, setTopicDone, topicCompletionRate };
}

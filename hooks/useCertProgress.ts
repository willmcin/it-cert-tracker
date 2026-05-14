"use client";

import { useState, useEffect, useCallback } from "react";

export type CertStatus = "not-started" | "in-progress" | "passed";

export type ScoreEntry = {
  date: string;
  score: number;
};

export type CertEntry = {
  status: CertStatus;
  topicProgress: Record<string, boolean>;
  notes: string;
  targetDate?: string;
  passedDate?: string;
  scoreLog?: ScoreEntry[];
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

  const addScore = useCallback((certId: string, score: ScoreEntry) => {
    setProgress((prev) => {
      const entry = prev[certId] ?? defaultEntry();
      const scoreLog = [...(entry.scoreLog ?? []), score];
      const updated = { ...prev, [certId]: { ...entry, scoreLog } };
      save(updated);
      return updated;
    });
  }, []);

  const removeScore = useCallback((certId: string, index: number) => {
    setProgress((prev) => {
      const entry = prev[certId] ?? defaultEntry();
      const scoreLog = (entry.scoreLog ?? []).filter((_, i) => i !== index);
      const updated = { ...prev, [certId]: { ...entry, scoreLog } };
      save(updated);
      return updated;
    });
  }, []);

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

  const exportData = useCallback((): string => {
    return JSON.stringify(progress, null, 2);
  }, [progress]);

  const importData = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as ProgressMap;
      save(parsed);
      setProgress(parsed);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    progress,
    getEntry,
    updateEntry,
    setTopicDone,
    addScore,
    removeScore,
    topicCompletionRate,
    exportData,
    importData,
  };
}

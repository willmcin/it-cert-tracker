"use client";

import { useState, useEffect, useCallback } from "react";

export type CertStatus = "not-started" | "in-progress" | "passed";

export type ScoreEntry = {
  date: string;
  score: number;
};

export type StudySession = {
  date: string;
  durationMinutes: number;
};

export type CustomCard = {
  id: string;
  question: string;
  answer: string;
};

export type CertEntry = {
  status: CertStatus;
  topicProgress: Record<string, boolean>;
  weakTopics: Record<string, boolean>;
  notes: string;
  targetDate?: string;
  passedDate?: string;
  scoreLog?: ScoreEntry[];
  sessions?: StudySession[];
  customCards?: CustomCard[];
  knownCards?: Record<string, boolean>;
};

export type ProgressMap = Record<string, CertEntry>;

const STORAGE_KEY = "cert-tracker-progress";

function defaultEntry(): CertEntry {
  return { status: "not-started", topicProgress: {}, weakTopics: {}, notes: "" };
}

function load(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProgressMap;
    // backfill weakTopics for entries saved before this field existed
    for (const key of Object.keys(parsed)) {
      if (!parsed[key].weakTopics) parsed[key].weakTopics = {};
    }
    return parsed;
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
        const existing = prev[certId] ?? defaultEntry();
        const merged = { ...existing, ...patch };
        // auto-stamp passedDate when transitioning to passed
        if (patch.status === "passed" && !existing.passedDate) {
          merged.passedDate = new Date().toISOString().slice(0, 10);
        }
        // clear passedDate if un-passing
        if (patch.status && patch.status !== "passed") {
          merged.passedDate = undefined;
        }
        const updated = { ...prev, [certId]: merged };
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

  const toggleWeakTopic = useCallback(
    (certId: string, topicId: string) => {
      setProgress((prev) => {
        const entry = prev[certId] ?? defaultEntry();
        const weakTopics = {
          ...entry.weakTopics,
          [topicId]: !entry.weakTopics?.[topicId],
        };
        const updated = { ...prev, [certId]: { ...entry, weakTopics } };
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

  const addSession = useCallback((certId: string, session: StudySession) => {
    setProgress((prev) => {
      const entry = prev[certId] ?? defaultEntry();
      const sessions = [...(entry.sessions ?? []), session];
      const updated = { ...prev, [certId]: { ...entry, sessions } };
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

  const totalStudyMinutes = useCallback(
    (certId: string): number =>
      (progress[certId]?.sessions ?? []).reduce((sum, s) => sum + s.durationMinutes, 0),
    [progress]
  );

  const addCustomCard = useCallback((certId: string, card: CustomCard) => {
    setProgress((prev) => {
      const entry = prev[certId] ?? defaultEntry();
      const customCards = [...(entry.customCards ?? []), card];
      const updated = { ...prev, [certId]: { ...entry, customCards } };
      save(updated);
      return updated;
    });
  }, []);

  const removeCustomCard = useCallback((certId: string, cardId: string) => {
    setProgress((prev) => {
      const entry = prev[certId] ?? defaultEntry();
      const customCards = (entry.customCards ?? []).filter((c) => c.id !== cardId);
      const updated = { ...prev, [certId]: { ...entry, customCards } };
      save(updated);
      return updated;
    });
  }, []);

  const toggleKnownCard = useCallback((certId: string, cardId: string) => {
    setProgress((prev) => {
      const entry = prev[certId] ?? defaultEntry();
      const knownCards = { ...entry.knownCards, [cardId]: !entry.knownCards?.[cardId] };
      const updated = { ...prev, [certId]: { ...entry, knownCards } };
      save(updated);
      return updated;
    });
  }, []);

  const studyStreak = useCallback((): number => {
    const dates = new Set<string>();
    for (const entry of Object.values(progress)) {
      for (const session of entry.sessions ?? []) {
        dates.add(session.date);
      }
    }
    if (dates.size === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // start from today; if today has no session, allow streak to still be alive from yesterday
    const startOffset = dates.has(today.toISOString().slice(0, 10)) ? 0 : 1;
    let streak = 0;
    for (let i = startOffset; ; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (!dates.has(d.toISOString().slice(0, 10))) break;
      streak++;
    }
    return streak;
  }, [progress]);

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
    toggleWeakTopic,
    addScore,
    removeScore,
    addSession,
    topicCompletionRate,
    totalStudyMinutes,
    addCustomCard,
    removeCustomCard,
    toggleKnownCard,
    studyStreak,
    exportData,
    importData,
  };
}

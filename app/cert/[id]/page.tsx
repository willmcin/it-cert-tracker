"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import certs from "@/data/certs";
import { useCertProgress } from "@/hooks/useCertProgress";
import type { CertStatus } from "@/hooks/useCertProgress";
import StudyTimer from "@/components/StudyTimer";
import MarkdownNotes from "@/components/MarkdownNotes";

const STATUS_OPTIONS: { value: CertStatus; label: string }[] = [
  { value: "not-started", label: "Not Started" },
  { value: "in-progress", label: "In Progress" },
  { value: "passed", label: "Passed" },
];

const RESOURCE_ICONS: Record<string, string> = {
  video: "▶",
  docs: "📄",
  practice: "✎",
  book: "📖",
};

function scoreColor(score: number, passingScore: number, maxScore: number) {
  const pct = score / maxScore;
  const passPct = passingScore / maxScore;
  if (pct >= passPct) return "text-green-400";
  if (pct >= passPct - 0.1) return "text-yellow-400";
  return "text-red-400";
}

function expiryDetails(passedDate: string, validityYears: number) {
  const expiry = new Date(passedDate + "T00:00:00");
  expiry.setFullYear(expiry.getFullYear() + validityYears);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((expiry.getTime() - today.getTime()) / 86_400_000);
  const color =
    daysLeft < 90 ? "text-red-400" : daysLeft < 365 ? "text-yellow-400" : "text-green-400";
  return {
    date: expiry.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    daysLeft,
    color,
  };
}

export default function CertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const cert = certs.find((c) => c.id === id)!;
  if (!cert) return notFound();

  const {
    getEntry,
    updateEntry,
    setTopicDone,
    toggleWeakTopic,
    topicCompletionRate,
    addScore,
    removeScore,
    addSession,
    totalStudyMinutes,
  } = useCertProgress();

  const entry = getEntry(cert.id);
  const rate = topicCompletionRate(cert.id, cert.topics);
  const studyMinutes = totalStudyMinutes(cert.id);

  const [newScore, setNewScore] = useState("");
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 10));

  function handleAddScore() {
    const val = parseInt(newScore, 10);
    if (isNaN(val) || val < 0 || val > cert.maxScore) return;
    addScore(cert.id, { date: newDate, score: val });
    setNewScore("");
  }

  const scores = entry.scoreLog ?? [];
  const trend =
    scores.length >= 2 ? scores[scores.length - 1].score - scores[0].score : null;

  const expiry =
    entry.status === "passed" && entry.passedDate
      ? expiryDetails(entry.passedDate, cert.validityYears ?? 3)
      : null;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-300">
          ← Back to Roadmap
        </Link>
        <Link
          href={`/cert/${cert.id}/flashcards`}
          className="text-sm px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          🃏 Flashcards
        </Link>
      </div>

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
          {cert.vendor} {cert.examCode && `· ${cert.examCode}`}
        </p>
        <h1 className="text-3xl font-bold text-white">{cert.name}</h1>
        <p className="text-gray-400 mt-2">{cert.description}</p>
      </div>

      {/* Study timer */}
      <section className="mb-8">
        <StudyTimer
          totalMinutes={studyMinutes}
          onSessionComplete={(session) => addSession(cert.id, session)}
        />
      </section>

      {/* Status */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Status</h2>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateEntry(cert.id, { status: opt.value })}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                entry.status === opt.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {entry.status !== "not-started" && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 bg-gray-800 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${rate}%` }}
              />
            </div>
            <span className="text-sm text-gray-400">{rate}%</span>
          </div>
        )}

        {expiry && (
          <div className={`mt-3 text-sm ${expiry.color}`}>
            Cert valid until {expiry.date}
            <span className="text-gray-500 ml-2 text-xs">
              ({expiry.daysLeft > 0 ? `${expiry.daysLeft} days remaining` : "expired"})
            </span>
          </div>
        )}
      </section>

      {/* Topics */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-1">
          Exam Topics
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          Flag topics you&apos;re struggling with using the ⚑ button.
        </p>
        <ul className="space-y-2">
          {cert.topics.map((topic) => {
            const done = !!entry.topicProgress[topic];
            const weak = !!entry.weakTopics?.[topic];
            return (
              <li key={topic} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={topic}
                  checked={done}
                  onChange={(e) => setTopicDone(cert.id, topic, e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-500 cursor-pointer shrink-0"
                />
                <label
                  htmlFor={topic}
                  className={`flex-1 text-sm cursor-pointer select-none ${
                    done
                      ? "line-through text-gray-500"
                      : weak
                      ? "text-orange-300"
                      : "text-gray-200"
                  }`}
                >
                  {topic}
                </label>
                <button
                  onClick={() => toggleWeakTopic(cert.id, topic)}
                  title={weak ? "Remove weak flag" : "Flag as weak area"}
                  className={`text-sm transition-colors shrink-0 ${
                    weak ? "text-orange-400" : "text-gray-600 hover:text-gray-400"
                  }`}
                >
                  ⚑
                </button>
              </li>
            );
          })}
        </ul>
        {Object.values(entry.weakTopics ?? {}).some(Boolean) && (
          <p className="mt-3 text-xs text-orange-400/70">
            {Object.values(entry.weakTopics).filter(Boolean).length} weak area
            {Object.values(entry.weakTopics).filter(Boolean).length !== 1 ? "s" : ""} flagged
          </p>
        )}
      </section>

      {/* Practice scores */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Practice Scores
          </h2>
          {trend !== null && (
            <span className={`text-xs font-medium ${trend >= 0 ? "text-green-400" : "text-red-400"}`}>
              {trend >= 0 ? "+" : ""}{trend} pts from first attempt
            </span>
          )}
        </div>

        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
              <th className="text-left pb-2">Date</th>
              <th className="text-left pb-2">Score</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {/* Pass threshold row */}
            <tr className="border-b border-dashed border-red-900/60">
              <td className="py-1.5 text-xs text-red-400/70 italic">Pass threshold</td>
              <td className="py-1.5 text-xs font-semibold text-red-400/70">
                {cert.passingScore} / {cert.maxScore}
              </td>
              <td />
            </tr>
            {scores.map((s, i) => (
              <tr key={i} className="border-b border-gray-800/50">
                <td className="py-2 text-gray-400">{s.date}</td>
                <td className={`py-2 font-semibold ${scoreColor(s.score, cert.passingScore, cert.maxScore)}`}>
                  {s.score} / {cert.maxScore}
                </td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => removeScore(cert.id, i)}
                    className="text-gray-600 hover:text-red-400 transition-colors text-xs"
                  >
                    remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex gap-2 items-center flex-wrap">
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
          />
          <input
            type="number"
            min={0}
            max={cert.maxScore}
            value={newScore}
            onChange={(e) => setNewScore(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddScore()}
            placeholder={`Score / ${cert.maxScore}`}
            className="w-32 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleAddScore}
            disabled={!newScore}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Log score
          </button>
        </div>
      </section>

      {/* Target date */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
          Target Exam Date
        </h2>
        <input
          type="date"
          value={entry.targetDate ?? ""}
          onChange={(e) => updateEntry(cert.id, { targetDate: e.target.value })}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
        />
      </section>

      {/* Notes */}
      <section className="mb-8">
        <MarkdownNotes
          value={entry.notes}
          onChange={(notes) => updateEntry(cert.id, { notes })}
        />
      </section>

      {/* Resources */}
      <section>
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
          Study Resources
        </h2>
        <ul className="space-y-2">
          {cert.resources.map((r) => (
            <li key={r.url}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors group"
              >
                <span className="text-lg">{RESOURCE_ICONS[r.type]}</span>
                <span className="flex-1 text-sm text-gray-200 group-hover:text-white">
                  {r.title}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    r.free ? "bg-green-600 text-white" : "bg-gray-600 text-white"
                  }`}
                >
                  {r.free ? "Free" : "Paid"}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

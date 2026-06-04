"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import certs from "@/data/certs";
import { useCertProgress } from "@/hooks/useCertProgress";
import type { CertStatus } from "@/hooks/useCertProgress";
import StudyTimer from "@/components/StudyTimer";
import MarkdownNotes from "@/components/MarkdownNotes";
import { VENDOR_ACCENT } from "@/lib/theme";

const STATUS_OPTIONS: { value: CertStatus; label: string }[] = [
  { value: "not-started", label: "Not Started" },
  { value: "in-progress", label: "In Progress" },
  { value: "passed", label: "Passed" },
];

const RESOURCE_ICONS: Record<string, string> = {
  video: "▶",
  docs: "▤",
  practice: "✎",
  book: "❑",
};

function scoreColor(score: number, passingScore: number, maxScore: number) {
  const pct = score / maxScore;
  const passPct = passingScore / maxScore;
  if (pct >= passPct) return "text-go";
  if (pct >= passPct - 0.1) return "text-amber";
  return "text-alert";
}

function expiryDetails(passedDate: string, validityYears: number) {
  const expiry = new Date(passedDate + "T00:00:00");
  expiry.setFullYear(expiry.getFullYear() + validityYears);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((expiry.getTime() - today.getTime()) / 86_400_000);
  const color =
    daysLeft < 90 ? "text-alert" : daysLeft < 365 ? "text-amber" : "text-go";
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
  const cert = certs.find((c) => c.id === id);

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

  const [newScore, setNewScore] = useState("");
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 10));

  if (!cert) return notFound();

  const entry = getEntry(cert.id);
  const rate = topicCompletionRate(cert.id, cert.topics);
  const studyMinutes = totalStudyMinutes(cert.id);

  const handleAddScore = () => {
    const val = parseInt(newScore, 10);
    if (isNaN(val) || val < 0 || val > cert.maxScore) return;
    addScore(cert.id, { date: newDate, score: val });
    setNewScore("");
  };

  const scores = entry.scoreLog ?? [];
  const trend =
    scores.length >= 2 ? scores[scores.length - 1].score - scores[0].score : null;

  const expiry =
    entry.status === "passed" && entry.passedDate
      ? expiryDetails(entry.passedDate, cert.validityYears ?? 3)
      : null;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6 text-[11px] uppercase tracking-[0.16em]">
        <Link href="/" className="text-dim hover:text-ink transition-colors">
          ◂ Mission Control
        </Link>
        <Link href={`/cert/${cert.id}/flashcards`} className="btn !text-[10px] !py-1.5">
          ⬢ Flashcards
        </Link>
      </div>

      <div className="panel panel-accent relative px-5 py-5 mb-8" style={{ "--accent": VENDOR_ACCENT[cert.vendor] } as React.CSSProperties}>
        <span className="tick tick-tr" />
        <p className="eyebrow mb-1.5">
          {cert.vendor} {cert.examCode && `· ${cert.examCode}`}
        </p>
        <h1 className="font-display text-2xl text-ink leading-tight">{cert.name}</h1>
        <p className="text-[13px] text-dim mt-2.5 leading-relaxed">{cert.description}</p>
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
        <h2 className="eyebrow mb-3">MISSION STATUS</h2>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateEntry(cert.id, { status: opt.value })}
              className={`btn ${entry.status === opt.value ? "btn-active" : ""}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {entry.status !== "not-started" && (
          <div className="mt-4 flex items-center gap-3">
            <div className="bar flex-1">
              <i style={{ width: `${rate}%` }} />
            </div>
            <span className="text-sm text-cyan font-medium tabular-nums">{rate}%</span>
          </div>
        )}

        {expiry && (
          <div className={`mt-3 text-[12px] uppercase tracking-wide ${expiry.color}`}>
            CERT VALID UNTIL {expiry.date}
            <span className="text-faint ml-2">
              ({expiry.daysLeft > 0 ? `${expiry.daysLeft}D REMAINING` : "EXPIRED"})
            </span>
          </div>
        )}
      </section>

      {/* Topics */}
      <section className="mb-8">
        <h2 className="eyebrow mb-1">
          SYSTEM CHECKS // {cert.topics.length} SUBSYSTEMS
        </h2>
        <p className="text-[11px] text-faint mb-3 uppercase tracking-wide">
          Flag subsystems you&apos;re struggling with using the ⚑ button.
        </p>
        <ul className="panel divide-y divide-line">
          {cert.topics.map((topic) => {
            const done = !!entry.topicProgress[topic];
            const weak = !!entry.weakTopics?.[topic];
            return (
              <li key={topic} className="flex items-center gap-3 px-4 py-2.5">
                <input
                  type="checkbox"
                  id={topic}
                  checked={done}
                  onChange={(e) => setTopicDone(cert.id, topic, e.target.checked)}
                  className="w-4 h-4 accent-cyan cursor-pointer shrink-0"
                />
                <label
                  htmlFor={topic}
                  className={`flex-1 text-[13px] cursor-pointer select-none ${
                    done
                      ? "line-through text-faint"
                      : weak
                      ? "text-amber"
                      : "text-ink"
                  }`}
                >
                  {topic}
                </label>
                <button
                  onClick={() => toggleWeakTopic(cert.id, topic)}
                  title={weak ? "Remove weak flag" : "Flag as weak area"}
                  className={`text-sm transition-colors shrink-0 ${
                    weak ? "text-amber" : "text-faint hover:text-dim"
                  }`}
                >
                  ⚑
                </button>
              </li>
            );
          })}
        </ul>
        {Object.values(entry.weakTopics ?? {}).some(Boolean) && (
          <p className="mt-3 text-[11px] uppercase tracking-wide text-amber/80">
            ⚑ {Object.values(entry.weakTopics).filter(Boolean).length} weak area
            {Object.values(entry.weakTopics).filter(Boolean).length !== 1 ? "s" : ""} flagged
          </p>
        )}
      </section>

      {/* Practice scores */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="eyebrow">PRACTICE TELEMETRY</h2>
          {trend !== null && (
            <span className={`text-[11px] uppercase tracking-wide font-medium ${trend >= 0 ? "text-go" : "text-alert"}`}>
              {trend >= 0 ? "▴ +" : "▾ "}{trend} PTS FROM FIRST RUN
            </span>
          )}
        </div>

        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="eyebrow border-b border-line">
              <th className="text-left pb-2 font-normal">Date</th>
              <th className="text-left pb-2 font-normal">Score</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {/* Pass threshold row */}
            <tr className="border-b border-dashed border-alert/40">
              <td className="py-1.5 text-[11px] text-alert/70 uppercase tracking-wide">Pass threshold</td>
              <td className="py-1.5 text-[11px] font-semibold text-alert/70 tabular-nums">
                {cert.passingScore} / {cert.maxScore}
              </td>
              <td />
            </tr>
            {scores.map((s, i) => (
              <tr key={i} className="border-b border-line/50">
                <td className="py-2 text-dim tabular-nums">{s.date}</td>
                <td className={`py-2 font-semibold tabular-nums ${scoreColor(s.score, cert.passingScore, cert.maxScore)}`}>
                  {s.score} / {cert.maxScore}
                </td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => removeScore(cert.id, i)}
                    className="text-faint hover:text-alert transition-colors text-[11px] uppercase tracking-wide"
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
            className="field"
          />
          <input
            type="number"
            min={0}
            max={cert.maxScore}
            value={newScore}
            onChange={(e) => setNewScore(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddScore()}
            placeholder={`Score / ${cert.maxScore}`}
            className="field w-32"
          />
          <button onClick={handleAddScore} disabled={!newScore} className="btn btn-active">
            ▴ Log score
          </button>
        </div>
      </section>

      {/* Target date */}
      <section className="mb-8">
        <h2 className="eyebrow mb-3">LAUNCH WINDOW // TARGET DATE</h2>
        <input
          type="date"
          value={entry.targetDate ?? ""}
          onChange={(e) => updateEntry(cert.id, { targetDate: e.target.value })}
          className="field"
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
        <h2 className="eyebrow mb-3">SUPPLY DEPOT // STUDY RESOURCES</h2>
        <ul className="space-y-2">
          {cert.resources.map((r) => (
            <li key={r.url}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="panel flex items-center gap-3 p-3 hover:border-cyan-dim hover:-translate-y-0.5 transition-all group"
              >
                <span className="text-cyan text-base">{RESOURCE_ICONS[r.type]}</span>
                <span className="flex-1 text-[13px] text-dim group-hover:text-ink transition-colors">
                  {r.title}
                </span>
                <span className={`badge ${r.free ? "text-go" : "text-faint"}`}>
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

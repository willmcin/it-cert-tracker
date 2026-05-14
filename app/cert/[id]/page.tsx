"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import certs from "@/data/certs";
import { useCertProgress } from "@/hooks/useCertProgress";
import type { CertStatus } from "@/hooks/useCertProgress";

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

export default function CertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const cert = certs.find((c) => c.id === id);
  if (!cert) notFound();

  const { getEntry, updateEntry, setTopicDone, topicCompletionRate } = useCertProgress();
  const entry = getEntry(cert.id);
  const rate = topicCompletionRate(cert.id, cert.topics);

  return (
    <div className="max-w-2xl">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 mb-6 inline-block">
        ← Back to Roadmap
      </Link>

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
          {cert.vendor} {cert.examCode && `· ${cert.examCode}`}
        </p>
        <h1 className="text-3xl font-bold text-white">{cert.name}</h1>
        <p className="text-gray-400 mt-2">{cert.description}</p>
      </div>

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
      </section>

      {/* Topics */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
          Exam Topics
        </h2>
        <ul className="space-y-2">
          {cert.topics.map((topic) => (
            <li key={topic} className="flex items-center gap-3">
              <input
                type="checkbox"
                id={topic}
                checked={!!entry.topicProgress[topic]}
                onChange={(e) => setTopicDone(cert.id, topic, e.target.checked)}
                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
              />
              <label
                htmlFor={topic}
                className={`text-sm cursor-pointer select-none ${
                  entry.topicProgress[topic] ? "line-through text-gray-500" : "text-gray-200"
                }`}
              >
                {topic}
              </label>
            </li>
          ))}
        </ul>
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
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Notes</h2>
        <textarea
          value={entry.notes}
          onChange={(e) => updateEntry(cert.id, { notes: e.target.value })}
          rows={4}
          placeholder="Study notes, weak areas, reminders…"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
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

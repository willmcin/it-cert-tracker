"use client";

import certs, { ROADMAP_ORDER } from "@/data/certs";
import { useCertProgress } from "@/hooks/useCertProgress";
import CertCard from "@/components/CertCard";
import ExportImport from "@/components/ExportImport";
import StudyHeatmap from "@/components/StudyHeatmap";

export default function DashboardPage() {
  const { getEntry, topicCompletionRate, totalStudyMinutes, studyStreak, progress } = useCertProgress();

  const orderedCerts = ROADMAP_ORDER.map((id) => certs.find((c) => c.id === id)!).filter(Boolean);

  const passedIds = new Set(
    Object.entries(progress)
      .filter(([, e]) => e.status === "passed")
      .map(([id]) => id)
  );

  const totalPassed = passedIds.size;
  const totalCerts = orderedCerts.length;
  const allMinutes = orderedCerts.reduce((sum, c) => sum + totalStudyMinutes(c.id), 0);
  const totalHours = Math.floor(allMinutes / 60);
  const totalMins = allMinutes % 60;
  const streak = studyStreak();

  // aggregate study minutes per calendar day across all certs
  const minutesByDay: Record<string, number> = {};
  for (const entry of Object.values(progress)) {
    for (const session of entry.sessions ?? []) {
      minutesByDay[session.date] = (minutesByDay[session.date] ?? 0) + session.durationMinutes;
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Cert Roadmap</h1>
            <p className="text-gray-400">
              {totalPassed} of {totalCerts} certifications earned
              {allMinutes > 0 && (
                <span className="ml-3 text-gray-500">
                  · {totalHours > 0 ? `${totalHours}h ${totalMins > 0 ? `${totalMins}m` : ""}` : `${totalMins}m`} total study time
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {streak > 0 && (
              <div className="text-right">
                <p className={`text-2xl font-bold ${streak >= 7 ? "text-orange-400" : "text-yellow-400"}`}>
                  {streak} day{streak === 1 ? "" : "s"}
                </p>
                <p className="text-xs text-gray-500">study streak 🔥</p>
              </div>
            )}
            <ExportImport />
          </div>
        </div>
        <div className="mt-3 w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.round((totalPassed / totalCerts) * 100)}%` }}
          />
        </div>
      </div>

      <StudyHeatmap data={minutesByDay} />

      <div className="grid gap-4 sm:grid-cols-2">
        {orderedCerts.map((cert) => {
          const entry = getEntry(cert.id);
          const rate = topicCompletionRate(cert.id, cert.topics);
          const locked = cert.prerequisites.some((pid) => !passedIds.has(pid));
          const minutes = totalStudyMinutes(cert.id);
          return (
            <CertCard
              key={cert.id}
              cert={cert}
              entry={entry}
              completionRate={rate}
              locked={locked}
              studyMinutes={minutes}
            />
          );
        })}
      </div>
    </div>
  );
}

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

  const fleetReadiness = Math.round((totalPassed / totalCerts) * 100);

  return (
    <div>
      <section className="panel relative mb-8 px-6 py-7">
        <span className="tick tick-tl" />
        <span className="tick tick-tr" />
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="eyebrow mb-2">CERTIFICATION // MISSION CONTROL</p>
            <h1 className="font-display text-2xl sm:text-3xl text-ink leading-tight">
              FLEET <span className="text-amber" style={{ textShadow: "var(--glow-amber)" }}>OVERVIEW</span>
            </h1>
            <p className="text-[12px] text-dim mt-2.5 tracking-wide">
              {totalPassed} OF {totalCerts} MISSIONS COMPLETE
              {allMinutes > 0 && (
                <span className="ml-2 text-faint">
                  · {totalHours > 0 ? `${totalHours}H ${totalMins > 0 ? `${totalMins}M` : ""}` : `${totalMins}M`} ON CONSOLE
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-6">
            {streak > 0 && (
              <div className="text-right border-r border-line pr-6">
                <p className="font-display text-2xl text-amber" style={{ textShadow: "var(--glow-amber)" }}>
                  {streak}
                </p>
                <p className="eyebrow mt-1">DAY STREAK{streak >= 7 ? " ◆" : ""}</p>
              </div>
            )}
            <div className="text-right">
              <p className="font-display text-3xl text-cyan" style={{ textShadow: "var(--glow-cyan)" }}>
                {String(fleetReadiness).padStart(2, "0")}%
              </p>
              <p className="eyebrow mt-1">FLEET READY</p>
            </div>
          </div>
        </div>
        <div className="bar mt-5">
          <i style={{ width: `${fleetReadiness}%`, "--accent": "var(--color-go)" } as React.CSSProperties} />
        </div>
        <div className="mt-5 flex justify-end">
          <ExportImport />
        </div>
      </section>

      <StudyHeatmap data={minutesByDay} />

      <p className="eyebrow mb-3 mt-2">ACTIVE MISSIONS // {totalCerts} TRACKED</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {orderedCerts.map((cert, i) => {
          const entry = getEntry(cert.id);
          const rate = topicCompletionRate(cert.id, cert.topics);
          const prereqsMet = cert.prerequisites.every((pid) => passedIds.has(pid));
          const minutes = totalStudyMinutes(cert.id);
          return (
            <div key={cert.id} className="mc-rise" style={{ animationDelay: `${i * 70}ms` }}>
              <CertCard
                cert={cert}
                entry={entry}
                completionRate={rate}
                prereqsMet={prereqsMet}
                studyMinutes={minutes}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

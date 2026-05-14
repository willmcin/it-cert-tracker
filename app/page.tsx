"use client";

import certs, { ROADMAP_ORDER } from "@/data/certs";
import { useCertProgress } from "@/hooks/useCertProgress";
import CertCard from "@/components/CertCard";

export default function DashboardPage() {
  const { getEntry, topicCompletionRate, progress } = useCertProgress();

  const orderedCerts = ROADMAP_ORDER.map((id) => certs.find((c) => c.id === id)!).filter(Boolean);

  const passedIds = new Set(
    Object.entries(progress)
      .filter(([, e]) => e.status === "passed")
      .map(([id]) => id)
  );

  const totalPassed = passedIds.size;
  const totalCerts = orderedCerts.length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Cert Roadmap</h1>
        <p className="text-gray-400">
          {totalPassed} of {totalCerts} certifications earned
        </p>
        <div className="mt-3 w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.round((totalPassed / totalCerts) * 100)}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {orderedCerts.map((cert) => {
          const entry = getEntry(cert.id);
          const rate = topicCompletionRate(cert.id, cert.topics);
          const locked = cert.prerequisites.some((pid) => !passedIds.has(pid));
          return (
            <CertCard
              key={cert.id}
              cert={cert}
              entry={entry}
              completionRate={rate}
              locked={locked}
            />
          );
        })}
      </div>
    </div>
  );
}

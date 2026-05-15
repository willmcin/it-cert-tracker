"use client";

import Link from "next/link";
import certs, { ROADMAP_ORDER } from "@/data/certs";
import type { Cert } from "@/data/certs";
import { useCertProgress } from "@/hooks/useCertProgress";

const VENDOR_COLORS: Record<Cert["vendor"], string> = {
  CompTIA: "text-red-400",
  Cisco: "text-blue-400",
  AWS: "text-orange-400",
};

export default function WeakTopicsPage() {
  const { getEntry } = useCertProgress();

  const sections = ROADMAP_ORDER
    .map((id) => certs.find((c) => c.id === id)!)
    .filter(Boolean)
    .map((cert) => {
      const entry = getEntry(cert.id);
      const weak = cert.topics.filter((t) => entry.weakTopics?.[t]);
      return { cert, weak };
    })
    .filter(({ weak }) => weak.length > 0);

  const totalWeak = sections.reduce((sum, { weak }) => sum + weak.length, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Weak Topics</h1>
      <p className="text-gray-400 mb-8">
        {totalWeak > 0
          ? `${totalWeak} flagged topic${totalWeak === 1 ? "" : "s"} across ${sections.length} cert${sections.length === 1 ? "" : "s"} — drill these before exam day.`
          : "No weak topics flagged yet. Use the ⚑ button on a cert's topic list to flag areas you're struggling with."}
      </p>

      {sections.length > 0 && (
        <div className="space-y-8">
          {sections.map(({ cert, weak }) => (
            <section key={cert.id}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white">
                  <span className={`mr-2 text-sm font-normal ${VENDOR_COLORS[cert.vendor]}`}>
                    {cert.vendor}
                  </span>
                  {cert.name}
                </h2>
                <Link
                  href={`/cert/${cert.id}`}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Go to cert →
                </Link>
              </div>
              <ul className="space-y-2">
                {weak.map((topic) => (
                  <li
                    key={topic}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 border border-orange-900/40"
                  >
                    <span className="text-orange-400 text-sm shrink-0">⚑</span>
                    <span className="text-sm text-orange-200">{topic}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

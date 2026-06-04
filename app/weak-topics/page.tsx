"use client";

import Link from "next/link";
import certs, { ROADMAP_ORDER } from "@/data/certs";
import { useCertProgress } from "@/hooks/useCertProgress";
import { VENDOR_TEXT } from "@/lib/theme";

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
      <p className="eyebrow mb-1.5">ANOMALY REPORT</p>
      <h1 className="font-display text-2xl text-ink mb-2">WEAK TOPICS</h1>
      <p className="text-[12px] text-dim uppercase tracking-wide mb-8 leading-relaxed">
        {totalWeak > 0
          ? `${totalWeak} flagged subsystem${totalWeak === 1 ? "" : "s"} across ${sections.length} mission${sections.length === 1 ? "" : "s"} — drill these before launch.`
          : "No anomalies flagged. Use the ⚑ button on a cert's system-check list to flag areas you're struggling with."}
      </p>

      {sections.length > 0 && (
        <div className="space-y-8">
          {sections.map(({ cert, weak }) => (
            <section key={cert.id}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-base text-ink flex items-center gap-2">
                  <span className={`eyebrow ${VENDOR_TEXT[cert.vendor]}`}>{cert.vendor}</span>
                  {cert.name}
                </h2>
                <Link
                  href={`/cert/${cert.id}`}
                  className="eyebrow hover:text-ink transition-colors"
                >
                  Go to mission ▸
                </Link>
              </div>
              <ul className="space-y-2">
                {weak.map((topic) => (
                  <li
                    key={topic}
                    className="panel panel-accent flex items-center gap-3 px-4 py-3"
                    style={{ "--accent": "var(--color-amber)" } as React.CSSProperties}
                  >
                    <span className="text-amber text-sm shrink-0">⚑</span>
                    <span className="text-[13px] text-amber">{topic}</span>
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

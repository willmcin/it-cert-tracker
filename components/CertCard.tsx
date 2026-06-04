"use client";

import Link from "next/link";
import type { Cert } from "@/data/certs";
import type { CertEntry } from "@/hooks/useCertProgress";
import { VENDOR_ACCENT } from "@/lib/theme";
import ReadinessRing from "@/components/ReadinessRing";

const STATUS_BADGE: Record<CertEntry["status"], { cls: string; label: string }> = {
  "not-started": { cls: "text-faint", label: "STANDBY" },
  "in-progress": { cls: "text-amber", label: "TRAINING" },
  passed: { cls: "text-go", label: "GO" },
};

const VENDOR_TEXT: Record<Cert["vendor"], string> = {
  CompTIA: "text-amber",
  Cisco: "text-cyan",
  AWS: "text-violet",
};

type Props = {
  cert: Cert;
  entry: CertEntry;
  completionRate: number;
  prereqsMet: boolean;
  studyMinutes: number;
};

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function expiryInfo(passedDate: string, validityYears: number) {
  const expiry = new Date(passedDate + "T00:00:00");
  expiry.setFullYear(expiry.getFullYear() + validityYears);
  const daysLeft = daysUntil(expiry.toISOString().slice(0, 10));
  const color =
    daysLeft < 90 ? "text-alert" : daysLeft < 365 ? "text-amber" : "text-go";
  const label =
    daysLeft < 0
      ? "CERT EXPIRED"
      : `RENEW BY ${expiry.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase()}`;
  return { color, label };
}

export default function CertCard({ cert, entry, completionRate, prereqsMet, studyMinutes }: Props) {
  const days =
    entry.targetDate && entry.status !== "passed" ? daysUntil(entry.targetDate) : null;
  const expiry =
    entry.status === "passed" && entry.passedDate
      ? expiryInfo(entry.passedDate, cert.validityYears ?? 3)
      : null;

  const status = STATUS_BADGE[entry.status];
  const accent = VENDOR_ACCENT[cert.vendor];
  const readiness = entry.status === "passed" ? 100 : completionRate;

  return (
    <Link
      href={`/cert/${cert.id}`}
      className="panel panel-accent group block p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-dim hover:shadow-[0_18px_50px_-24px_rgba(57,224,208,0.5)]"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={`eyebrow ${VENDOR_TEXT[cert.vendor]}`}>{cert.vendor}</p>
          <h2 className="font-display text-[0.95rem] text-ink mt-1.5 leading-snug">{cert.name}</h2>
          {cert.examCode && (
            <p className="text-[11px] text-faint mt-1 truncate">{cert.examCode}</p>
          )}
        </div>
        <span className={`badge shrink-0 ${status.cls}`}>{status.label}</span>
      </div>

      <p className="text-[12px] text-dim mt-2.5 line-clamp-2 leading-relaxed">
        {cert.description}
      </p>

      {entry.status !== "not-started" && (
        <div className="flex items-center gap-4 mt-4">
          <ReadinessRing value={readiness} size={76} stroke={5} accent={accent} />
          <div className="flex-1 space-y-2.5">
            <div>
              <div className="flex justify-between eyebrow mb-1">
                <span>System checks</span>
                <span className="text-dim">{completionRate}%</span>
              </div>
              <div className="bar">
                <i style={{ width: `${completionRate}%`, "--accent": accent } as React.CSSProperties} />
              </div>
            </div>
            {studyMinutes > 0 && (
              <p className="text-[11px] text-faint tracking-wide">
                ◷ {formatMinutes(studyMinutes)} logged
              </p>
            )}
          </div>
        </div>
      )}

      {days !== null && (
        <p
          className={`mt-3.5 text-[11px] uppercase tracking-[0.12em] ${
            days < 0 ? "text-alert" : days <= 7 ? "text-amber" : "text-dim"
          }`}
        >
          {days < 0
            ? `▾ Launch window missed ${Math.abs(days)}d ago`
            : days === 0
            ? "▴ Launch today"
            : `▴ T-minus ${days} day${days === 1 ? "" : "s"} to launch`}
        </p>
      )}

      {expiry && (
        <p className={`mt-3.5 text-[11px] uppercase tracking-[0.12em] ${expiry.color}`}>
          {expiry.label}
        </p>
      )}

      {!prereqsMet && cert.prerequisites.length > 0 && (
        <p className="mt-3.5 text-[11px] uppercase tracking-[0.14em] text-faint flex items-center gap-1.5">
          <span>◇ SUGGESTED PREP ·</span>
          {cert.prerequisites
            .map((id) => id.replace("comptia-", "").replace("cisco-", "").replace("aws-", ""))
            .join(", ")}
        </p>
      )}
    </Link>
  );
}

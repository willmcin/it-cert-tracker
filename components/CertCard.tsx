"use client";

import Link from "next/link";
import type { Cert } from "@/data/certs";
import type { CertEntry } from "@/hooks/useCertProgress";

const STATUS_STYLES: Record<CertEntry["status"], string> = {
  "not-started": "bg-gray-700 text-gray-300",
  "in-progress": "bg-blue-900 text-blue-300",
  passed: "bg-green-900 text-green-300",
};

const STATUS_LABELS: Record<CertEntry["status"], string> = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  passed: "Passed",
};

const VENDOR_COLORS: Record<Cert["vendor"], string> = {
  CompTIA: "text-red-400",
  Cisco: "text-blue-400",
  AWS: "text-orange-400",
};

type Props = {
  cert: Cert;
  entry: CertEntry;
  completionRate: number;
  locked: boolean;
};

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
    daysLeft < 90 ? "text-red-400" : daysLeft < 365 ? "text-yellow-400" : "text-green-400";
  const label =
    daysLeft < 0
      ? "Cert expired"
      : `Renew by ${expiry.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
  return { color, label };
}

export default function CertCard({ cert, entry, completionRate, locked }: Props) {
  const days =
    entry.targetDate && entry.status !== "passed"
      ? daysUntil(entry.targetDate)
      : null;
  const expiry =
    entry.status === "passed" && entry.passedDate
      ? expiryInfo(entry.passedDate, cert.validityYears ?? 3)
      : null;

  return (
    <Link
      href={locked ? "#" : `/cert/${cert.id}`}
      className={`block rounded-xl border p-5 transition-all ${
        locked
          ? "border-gray-800 opacity-50 cursor-not-allowed"
          : "border-gray-700 hover:border-gray-500 hover:bg-gray-900"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${VENDOR_COLORS[cert.vendor]}`}>
            {cert.vendor}
          </p>
          <h2 className="text-lg font-bold text-white">{cert.name}</h2>
          {cert.examCode && (
            <p className="text-xs text-gray-500 mt-0.5">{cert.examCode}</p>
          )}
          <p className="text-sm text-gray-400 mt-2 line-clamp-2">{cert.description}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[entry.status]}`}
        >
          {STATUS_LABELS[entry.status]}
        </span>
      </div>

      {entry.status !== "not-started" && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Topics completed</span>
            <span>{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}

      {days !== null && (
        <p className={`mt-3 text-xs font-medium ${days < 0 ? "text-red-400" : days <= 7 ? "text-yellow-400" : "text-gray-400"}`}>
          {days < 0
            ? `Exam date passed ${Math.abs(days)}d ago`
            : days === 0
            ? "Exam today!"
            : `${days} day${days === 1 ? "" : "s"} until exam`}
        </p>
      )}

      {expiry && (
        <p className={`mt-3 text-xs font-medium ${expiry.color}`}>{expiry.label}</p>
      )}

      {locked && (
        <p className="mt-3 text-xs text-gray-500">
          Requires:{" "}
          {cert.prerequisites
            .map((id) => id.replace("comptia-", "").replace("cisco-", "").replace("aws-", ""))
            .join(", ")}
        </p>
      )}
    </Link>
  );
}

"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function MarkdownNotes({ value, onChange }: Props) {
  const [editing, setEditing] = useState(!value);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="eyebrow">LOG // NOTES</h2>
        <div className="flex overflow-hidden border border-line text-[11px] uppercase tracking-wider">
          <button
            onClick={() => setEditing(true)}
            className={`px-3 py-1 transition-colors ${
              editing ? "bg-cyan text-bg font-medium" : "bg-transparent text-dim hover:text-ink"
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setEditing(false)}
            className={`px-3 py-1 transition-colors ${
              !editing ? "bg-cyan text-bg font-medium" : "bg-transparent text-dim hover:text-ink"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {editing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          placeholder="Study notes, weak areas, reminders… (supports **markdown**)"
          className="field w-full resize-none"
        />
      ) : value ? (
        <div className="prose prose-invert prose-sm max-w-none panel px-4 py-3 min-h-[6rem]
          prose-headings:text-ink prose-headings:font-display
          prose-p:text-dim
          prose-a:text-cyan prose-a:no-underline hover:prose-a:underline
          prose-strong:text-ink
          prose-code:text-amber prose-code:bg-panel2 prose-code:px-1
          prose-pre:bg-panel2 prose-pre:border prose-pre:border-line
          prose-ul:text-dim prose-ol:text-dim
          prose-li:marker:text-cyan-dim
          prose-blockquote:border-cyan-dim prose-blockquote:text-dim">
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full min-h-[6rem] panel border-dashed text-[11px] uppercase tracking-wider text-faint hover:text-dim hover:border-cyan-dim transition-colors flex items-center justify-center"
        >
          ⊕ Click to add log entry
        </button>
      )}
    </div>
  );
}

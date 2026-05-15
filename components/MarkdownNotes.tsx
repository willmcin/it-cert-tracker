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
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Notes</h2>
        <div className="flex rounded-lg overflow-hidden border border-gray-700 text-xs">
          <button
            onClick={() => setEditing(true)}
            className={`px-3 py-1 transition-colors ${
              editing ? "bg-gray-700 text-white" : "bg-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setEditing(false)}
            className={`px-3 py-1 transition-colors ${
              !editing ? "bg-gray-700 text-white" : "bg-transparent text-gray-500 hover:text-gray-300"
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
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none font-mono"
        />
      ) : value ? (
        <div className="prose prose-invert prose-sm max-w-none bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 min-h-[6rem]
          prose-headings:text-gray-100
          prose-p:text-gray-300
          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-gray-100
          prose-code:text-blue-300 prose-code:bg-gray-900 prose-code:px-1 prose-code:rounded
          prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700
          prose-ul:text-gray-300 prose-ol:text-gray-300
          prose-li:marker:text-gray-500
          prose-blockquote:border-gray-600 prose-blockquote:text-gray-400">
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full min-h-[6rem] bg-gray-800 border border-gray-700 border-dashed rounded-lg text-sm text-gray-600 hover:text-gray-400 hover:border-gray-500 transition-colors flex items-center justify-center"
        >
          Click to add notes
        </button>
      )}
    </div>
  );
}

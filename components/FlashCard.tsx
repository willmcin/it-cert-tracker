"use client";

type Props = {
  question: string;
  answer: string;
  known: boolean;
  flipped: boolean;
  index: number;
  total: number;
  onFlip: () => void;
  onKnown: () => void;
  onNext: () => void;
  onPrev: () => void;
};

export default function FlashCard({ question, answer, known, flipped, index, total, onFlip, onKnown, onNext, onPrev }: Props) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Counter */}
      <p className="eyebrow tabular-nums">
        CARD {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        {known && <span className="ml-2 text-go">● KNOWN</span>}
      </p>

      {/* Card */}
      <div
        className="w-full max-w-xl cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={onFlip}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "240px",
          }}
        >
          {/* Front */}
          <div
            className="panel panel-accent absolute inset-0 flex flex-col items-center justify-center p-8"
            style={{ backfaceVisibility: "hidden", "--accent": "var(--color-amber)" } as React.CSSProperties}
          >
            <p className="eyebrow text-amber mb-4">▸ QUERY</p>
            <p className="text-lg text-ink text-center font-medium leading-relaxed">{question}</p>
            <p className="mt-6 eyebrow text-faint">Click or press Space to decrypt</p>
          </div>

          {/* Back */}
          <div
            className="panel panel-accent absolute inset-0 flex flex-col items-start justify-center p-8"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", "--accent": "var(--color-cyan)" } as React.CSSProperties}
          >
            <p className="eyebrow text-cyan mb-4">▸ RESPONSE</p>
            <p className="text-sm text-ink leading-relaxed whitespace-pre-line">{answer}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button onClick={onPrev} className="btn">
          ◂ Prev
        </button>

        <button onClick={onKnown} className={`btn ${known ? "" : "btn-go"}`}>
          {known ? "Unmark known" : "● Got it"}
        </button>

        <button onClick={onNext} className="btn">
          Next ▸
        </button>
      </div>

      {/* Keyboard hints */}
      <div className="flex gap-4 eyebrow">
        <span><kbd className="px-1.5 py-0.5 bg-panel2 border border-line text-dim">Space</kbd> flip</span>
        <span><kbd className="px-1.5 py-0.5 bg-panel2 border border-line text-dim">←</kbd><kbd className="px-1.5 py-0.5 bg-panel2 border border-line text-dim ml-1">→</kbd> nav</span>
        <span><kbd className="px-1.5 py-0.5 bg-panel2 border border-line text-dim">K</kbd> known</span>
      </div>
    </div>
  );
}

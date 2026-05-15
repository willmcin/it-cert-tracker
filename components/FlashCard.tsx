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
      <p className="text-sm text-gray-500">
        {index + 1} / {total}
        {known && <span className="ml-2 text-green-400 font-medium">✓ Known</span>}
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
            className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-2xl bg-gray-800 border border-gray-700"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-xs text-blue-400 uppercase tracking-wider mb-4 font-semibold">Question</p>
            <p className="text-lg text-white text-center font-medium leading-relaxed">{question}</p>
            <p className="mt-6 text-xs text-gray-500">Click or press Space to reveal</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col items-start justify-center p-8 rounded-2xl bg-gray-900 border border-blue-800"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-xs text-green-400 uppercase tracking-wider mb-4 font-semibold">Answer</p>
            <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{answer}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button
          onClick={onPrev}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 transition-colors"
        >
          ← Prev
        </button>

        <button
          onClick={onKnown}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            known
              ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
              : "bg-green-700 text-white hover:bg-green-600"
          }`}
        >
          {known ? "Unmark known" : "✓ Got it"}
        </button>

        <button
          onClick={onNext}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Keyboard hints */}
      <div className="flex gap-4 text-xs text-gray-600">
        <span><kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 font-mono">Space</kbd> flip</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 font-mono">←</kbd><kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 font-mono ml-1">→</kbd> navigate</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 font-mono">K</kbd> mark known</span>
      </div>
    </div>
  );
}

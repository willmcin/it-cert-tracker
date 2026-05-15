"use client";

import { use, useState, useMemo, useEffect, useCallback } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import certs from "@/data/certs";
import builtinCards from "@/data/flashcards";
import { useCertProgress } from "@/hooks/useCertProgress";
import type { CustomCard } from "@/hooks/useCertProgress";
import FlashCard from "@/components/FlashCard";

type Filter = "all" | "learning" | "known";

export default function FlashcardsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const cert = certs.find((c) => c.id === id)!;
  if (!cert) return notFound();

  const { getEntry, addCustomCard, removeCustomCard, toggleKnownCard } = useCertProgress();
  const entry = getEntry(cert.id);

  const [filter, setFilter] = useState<Filter>("all");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");

  const builtin = builtinCards[cert.id] ?? [];
  const custom = entry.customCards ?? [];
  const allCards = [...builtin, ...custom];
  const knownCards = entry.knownCards ?? {};

  const filtered = useMemo(() => {
    const base = allCards.filter((c) => {
      if (filter === "known") return knownCards[c.id];
      if (filter === "learning") return !knownCards[c.id];
      return true;
    });
    if (!shuffled) return base;
    // seeded shuffle so it stays stable until re-shuffled
    const arr = [...base];
    let seed = shuffleSeed;
    for (let i = arr.length - 1; i > 0; i--) {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      const j = Math.abs(seed) % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, shuffled, shuffleSeed, entry]);

  const knownCount = allCards.filter((c) => knownCards[c.id]).length;
  const current = filtered[Math.min(cardIndex, filtered.length - 1)];

  const goNext = useCallback(() => {
    setFlipped(false);
    setCardIndex((i) => (i + 1) % filtered.length);
  }, [filtered.length]);

  const goPrev = useCallback(() => {
    setFlipped(false);
    setCardIndex((i) => (i - 1 + filtered.length) % filtered.length);
  }, [filtered.length]);

  const handleKnownAndNext = useCallback(() => {
    if (!current) return;
    toggleKnownCard(cert.id, current.id);
    setFlipped(false);
    setCardIndex((i) => (i + 1) % filtered.length);
  }, [current, cert.id, filtered.length, toggleKnownCard]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (filtered.length === 0) return;
      if (e.key === " " || e.code === "Space") { e.preventDefault(); setFlipped((f) => !f); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      else if (e.key === "k" || e.key === "K") { e.preventDefault(); handleKnownAndNext(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered.length, goNext, goPrev, handleKnownAndNext]);

  function handleAddCard() {
    if (!newQ.trim() || !newA.trim()) return;
    const card: CustomCard = {
      id: `custom-${cert.id}-${Date.now()}`,
      question: newQ.trim(),
      answer: newA.trim(),
    };
    addCustomCard(cert.id, card);
    setNewQ("");
    setNewA("");
    setShowAddForm(false);
  }

  return (
    <div className="max-w-2xl">
      <Link href={`/cert/${cert.id}`} className="text-sm text-gray-500 hover:text-gray-300 mb-6 inline-block">
        ← Back to {cert.name}
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Flashcards</h1>
        <p className="text-gray-400">
          {cert.name} · {knownCount} / {allCards.length} known
        </p>
        {allCards.length > 0 && (
          <div className="mt-2 w-full bg-gray-800 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.round((knownCount / allCards.length) * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Filter tabs + shuffle */}
      {allCards.length > 0 && (
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {(["all", "learning", "known"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setCardIndex(0); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {f === "all" ? `All (${allCards.length})` : f === "learning" ? `Still learning (${allCards.length - knownCount})` : `Known (${knownCount})`}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            {shuffled && (
              <button
                onClick={() => { setShuffleSeed((s) => s + 1); setCardIndex(0); }}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Reshuffle
              </button>
            )}
            <button
              onClick={() => { setShuffled((s) => !s); setShuffleSeed((s) => s + 1); setCardIndex(0); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                shuffled
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              ⇄ Shuffle
            </button>
          </div>
        </div>
      )}

      {/* Card */}
      {filtered.length > 0 && current ? (
        <FlashCard
          key={current.id}
          question={current.question}
          answer={current.answer}
          known={!!knownCards[current.id]}
          flipped={flipped}
          index={Math.min(cardIndex, filtered.length - 1)}
          total={filtered.length}
          onFlip={() => setFlipped((f) => !f)}
          onKnown={handleKnownAndNext}
          onNext={goNext}
          onPrev={goPrev}
        />
      ) : (
        <div className="text-center py-16 text-gray-500">
          {filter === "known" ? "No cards marked as known yet." : filter === "learning" ? "No cards left to learn — nice work!" : "No cards yet."}
        </div>
      )}

      {/* Custom cards */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Your Cards {custom.length > 0 && `(${custom.length})`}
          </h2>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            + Add card
          </button>
        </div>

        {showAddForm && (
          <div className="mb-4 p-4 rounded-xl bg-gray-800 border border-gray-700 space-y-3">
            <textarea
              value={newQ}
              onChange={(e) => setNewQ(e.target.value)}
              rows={2}
              placeholder="Question"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
            />
            <textarea
              value={newA}
              onChange={(e) => setNewA(e.target.value)}
              rows={3}
              placeholder="Answer"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCard}
                disabled={!newQ.trim() || !newA.trim()}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-1.5 rounded-lg bg-gray-700 text-gray-300 text-sm hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {custom.length > 0 && (
          <ul className="space-y-2">
            {custom.map((card) => (
              <li key={card.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-gray-800 border border-gray-700">
                <p className="text-sm text-gray-300 flex-1">{card.question}</p>
                <button
                  onClick={() => removeCustomCard(cert.id, card.id)}
                  className="text-xs text-gray-600 hover:text-red-400 transition-colors shrink-0"
                >
                  remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

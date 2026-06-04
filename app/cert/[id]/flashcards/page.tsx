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
  const cert = certs.find((c) => c.id === id);

  const { getEntry, addCustomCard, removeCustomCard, toggleKnownCard } = useCertProgress();

  const [filter, setFilter] = useState<Filter>("all");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");

  const entry = cert ? getEntry(cert.id) : undefined;
  const builtin = cert ? builtinCards[cert.id] ?? [] : [];
  const custom = entry?.customCards ?? [];
  const allCards = [...builtin, ...custom];
  const knownCards = entry?.knownCards ?? {};

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
    if (!cert || !current) return;
    toggleKnownCard(cert.id, current.id);
    setFlipped(false);
    setCardIndex((i) => (i + 1) % filtered.length);
  }, [current, cert, filtered.length, toggleKnownCard]);

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

  if (!cert) return notFound();

  const handleAddCard = () => {
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
  };

  return (
    <div className="max-w-2xl">
      <Link href={`/cert/${cert.id}`} className="eyebrow hover:text-ink transition-colors mb-6 inline-block">
        ◂ Back to {cert.name}
      </Link>

      <div className="mb-8">
        <p className="eyebrow mb-1.5">DRILL SEQUENCE</p>
        <h1 className="font-display text-2xl text-ink mb-1">FLASHCARDS</h1>
        <p className="text-[12px] text-dim uppercase tracking-wide tabular-nums">
          {cert.name} · {knownCount} / {allCards.length} KNOWN
        </p>
        {allCards.length > 0 && (
          <div className="bar mt-3">
            <i style={{ width: `${Math.round((knownCount / allCards.length) * 100)}%`, "--accent": "var(--color-go)" } as React.CSSProperties} />
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
              className={`btn ${filter === f ? "btn-active" : ""}`}
            >
              {f === "all" ? `All (${allCards.length})` : f === "learning" ? `Learning (${allCards.length - knownCount})` : `Known (${knownCount})`}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            {shuffled && (
              <button
                onClick={() => { setShuffleSeed((s) => s + 1); setCardIndex(0); }}
                className="eyebrow hover:text-ink transition-colors"
              >
                Reshuffle
              </button>
            )}
            <button
              onClick={() => { setShuffled((s) => !s); setShuffleSeed((s) => s + 1); setCardIndex(0); }}
              className={`btn ${shuffled ? "btn-active" : ""}`}
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
        <div className="text-center py-16 eyebrow">
          {filter === "known" ? "No cards marked as known yet." : filter === "learning" ? "No cards left to learn — nice work!" : "No cards yet."}
        </div>
      )}

      {/* Custom cards */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="eyebrow">
            CUSTOM CARDS {custom.length > 0 && `// ${custom.length}`}
          </h2>
          <button onClick={() => setShowAddForm((v) => !v)} className="btn btn-active !text-[10px] !py-1.5">
            + Add card
          </button>
        </div>

        {showAddForm && (
          <div className="panel mb-4 p-4 space-y-3">
            <textarea
              value={newQ}
              onChange={(e) => setNewQ(e.target.value)}
              rows={2}
              placeholder="Question"
              className="field w-full resize-none"
            />
            <textarea
              value={newA}
              onChange={(e) => setNewA(e.target.value)}
              rows={3}
              placeholder="Answer"
              className="field w-full resize-none"
            />
            <div className="flex gap-2">
              <button onClick={handleAddCard} disabled={!newQ.trim() || !newA.trim()} className="btn btn-active">
                Save
              </button>
              <button onClick={() => setShowAddForm(false)} className="btn">
                Cancel
              </button>
            </div>
          </div>
        )}

        {custom.length > 0 && (
          <ul className="space-y-2">
            {custom.map((card) => (
              <li key={card.id} className="panel flex items-start justify-between gap-3 p-3">
                <p className="text-[13px] text-dim flex-1">{card.question}</p>
                <button
                  onClick={() => removeCustomCard(cert.id, card.id)}
                  className="text-[11px] uppercase tracking-wide text-faint hover:text-alert transition-colors shrink-0"
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

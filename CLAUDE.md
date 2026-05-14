# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

A personal IT certification roadmap and study tracker. The user is pursuing: CompTIA A+, Network+, Security+, Cisco CCNA, and AWS vendor certifications. The site tracks study progress per cert and provides curated study resources.

## Tech Stack

- **Framework:** Next.js (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Data persistence:** `localStorage` — no backend, no auth
- **Package manager:** npm

## Commands

```bash
npm run dev       # start dev server at localhost:3000
npm run build     # production build
npm run lint      # ESLint
npm run typecheck # tsc --noEmit
```

## Architecture

### Data Model (localStorage)

Progress is stored under a single key `cert-tracker-progress` as JSON:

```ts
type CertProgress = {
  [certId: string]: {
    status: 'not-started' | 'in-progress' | 'passed';
    topicProgress: { [topicId: string]: boolean }; // checked off topics
    notes: string;
    targetDate?: string; // ISO date string
    passedDate?: string;
  };
};
```

Cert definitions (IDs, names, topics, resource links) live in `data/certs.ts` as static data — they are never written to localStorage.

### Cert Roadmap

`data/certs.ts` is the source of truth for the cert catalog. It also exports `ROADMAP_ORDER` (an ordered array of cert IDs) which drives the dashboard sort order. Each cert entry includes:
- `id`, `name`, `vendor` (CompTIA / Cisco / AWS)
- `topics[]` — ordered list of exam domain topics
- `resources[]` — links to free/paid study material (official docs, Professor Messer, etc.)
- `prerequisites[]` — cert IDs that should be completed first (drives the roadmap ordering)

### Page Structure (App Router)

```
app/
  page.tsx              # Dashboard — cert roadmap overview with progress bars
  cert/[id]/
    page.tsx            # Per-cert detail: topics checklist, resources, notes
  resources/
    page.tsx            # Aggregated study links across all certs
```

### State Management

A `useCertProgress` hook in `hooks/useCertProgress.ts` encapsulates all reads/writes to localStorage. Components never call `localStorage` directly.

### Roadmap Ordering

The dashboard renders certs in a suggested study order derived from the `prerequisites` graph in `certs.ts`. The recommended path is: A+ → Network+ → Security+ → CCNA → AWS certs.

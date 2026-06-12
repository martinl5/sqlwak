# SQLwak Repository Improvement Plan

A comprehensive, prioritized plan to improve SQLwak in two dimensions: **accuracy/effectiveness**
(does the game judge SQL correctly and teach well?) and **design** (architecture, code quality,
maintainability, UX). Findings reference current code as of this writing (63 levels, Next.js 16,
React 19, sql.js, Zustand).

---

## Implementation Status

Implemented in this PR:

- **Phase 1 — Correctness core (done):** read-only query guard + seed snapshot/reset (1.1),
  order-aware comparison with `orderMatters` override and top-level-ORDER-BY inference (1.2),
  cached expected results (1.3), exact strings / relative float epsilon / case-insensitive
  column names (1.4), specific failure messages per mismatch class (1.5), epoch tags fixed on
  levels 51–54 (part of 1.6).
- **Phase 2 — Safety net (done):** Vitest level-integrity suite covering all 63 levels +
  validator unit tests (270 tests), GitHub Actions CI running lint, typecheck, tests, build
  (2.1–2.3).
- **Phase 3 — Architecture (mostly done):** sql.js self-hosted from the npm package via a
  sync script — no more CDN/version drift (3.1); single `src/lib/progression.ts` consumed
  everywhere, all hardcoded epoch/XP/max-level copies deleted (3.2); dead NextAuth wiring,
  unused types, unused `p5` dependency, no-op callbacks, and the `sqlawk` name typo removed
  (3.3); seed extracted to `src/lib/seed.ts` for Node test reuse.

Implemented in the follow-up PR:

- **Remainder of 1.6:** level 49 rewritten with the `AVG(x²) − AVG(x)²` variance identity
  (no more correlated subqueries); seed-scaffold whitespace normalized.
- **2.4:** store tests for XP accrual, streak, navigation history, and reset — which surfaced
  and fixed three real bugs (XP farming by replaying levels, `currentLevel` advancing past the
  final level, and back-navigation never consuming history).
- **3.4 (partial):** `levels.ts` split into per-epoch modules under `src/data/levels/`.
- **Pillar 4:** escalating disclosure (expected result *shape* revealed after 3 failed
  attempts), dialog semantics/focus/Escape handling for the modal and level navigator,
  aria-labels on icon buttons, and a stacking responsive layout below the `lg` breakpoint.
- **Pillar 5:** MIT LICENSE, CONTRIBUTING.md with a level-authoring guide.

Implemented since (iteration 8):

- **4.5 (partial):** the anti-join syllabus gap is closed — level 66 teaches the
  `LEFT JOIN … IS NULL` anti-join, level 67 teaches correlated `NOT EXISTS` (and the
  `NOT IN` NULL trap). Remaining 4.5 gaps: a dedicated date-functions drill and earlier
  `CASE` exposure are partially covered by existing levels (28, 38, 62, 65) — revisit
  only if player feedback shows a hole.

Still open: build-time expected results (3.4 — deprioritized: the level-up modal now
deliberately reveals the model answer after a win, so hiding solutions from the bundle
buys nothing), the expected-vs-actual value diff (4.1 — the shape reveal shipped; a
value-level diff is a deliberate product decision), and a deeper mobile/touch pass (4.4).

---

## Current State Snapshot

| Area | State |
|------|-------|
| Levels | 63 hand-written levels in `src/data/levels.ts` (~76 KB single file) |
| Validation | Result-set comparison: user query vs. solution query, both run live (`src/lib/validator.ts`) |
| Database | In-memory sql.js, seeded in `src/lib/db.ts`, loaded from **CDN (v1.8.0)** |
| Tests | **None** |
| CI | **None** (no `.github/workflows`) |
| Auth | NextAuth wired (`src/lib/auth.ts`, API route) but **never used** by the app |
| State | Zustand + localStorage persistence (`src/store/useGameStore.ts`) |

The core asset of this repo is the level catalog plus the validator. Neither has any automated
safeguard, and the validator has several correctness holes. That is where the plan starts.

---

## Pillar 1 — Validation Accuracy (highest priority)

The validator is the "grader" of the game. Every false negative frustrates a learner who wrote
correct SQL; every false positive teaches them something wrong.

### 1.1 Protect the database from mutation
`executeQuery()` (`src/lib/db.ts:453`) passes raw user SQL to `db.exec()` with no restrictions.
A user can run `DROP TABLE customers`, `DELETE FROM accounts`, or `UPDATE …` and silently corrupt
the in-memory database **for the rest of the session** — every subsequent level then validates
against corrupted data, because the solution query also runs on the mutated DB.

- Reject non-read-only statements before execution (sql.js exposes `stmt.sql`/authorizer-style
  checks; minimally, parse for a leading `SELECT`/`WITH` and reject multi-statement input).
- Add a **"Reset database"** action in the UI as a safety valve.
- Snapshot the seeded DB (`db.export()`) once after seeding so reset is instant
  (`new SQL.Database(snapshot)`) instead of re-running all seed SQL.

### 1.2 Make row-order comparison intentional
`compareResults()` (`src/lib/validator.ts:64`) compares rows positionally. Levels whose task text
doesn't demand ordering still fail users who omit/choose a different `ORDER BY`, and only pass
today because SQLite happens to return insertion order.

- Add an `orderMatters: boolean` field to `Level`. When `false`, compare results as multisets
  (canonicalize rows, sort both sides, then compare).
- Audit all 63 levels: set `orderMatters: true` only where the description explicitly asks for
  ordering; reword descriptions that are ambiguous.

### 1.3 Run the solution query against pristine data, once
Today the solution re-executes on every attempt, on the same (possibly mutated) DB.

- Compute each level's expected result **once** against a known-good DB and cache it
  (or, longer term, generate expected results at build time from `levels.ts` + seed — see 3.4).
  This makes validation immune to user-side mutation and halves query work per attempt.

### 1.4 Tighten value comparison
`valuesEqual()` (`src/lib/validator.ts:78`):
- String comparison is `toLowerCase().trim()` — `'active'` passes for `'Active'`, which teaches
  learners that SQL string filters are case-insensitive (SQLite's `=` is not). Make string
  comparison exact by default, with an optional per-level relaxation if ever needed.
- Float tolerance is absolute (`< 0.0001`); fine for small values but wrong shape for monetary
  aggregates in the millions. Use a relative epsilon (`abs(a-b) <= max(1e-9, 1e-6 * max(|a|,|b|))`).
- Column-name comparison is exact and case-sensitive. Compare case-insensitively (SQL identifiers
  are case-insensitive), and produce a **specific** error when only the alias/column names differ.

### 1.5 Actionable failure messages
All logic failures return the same string: *"Check your WHERE conditions and filters"*
(`validator.ts:32`) — even when the real problem is a wrong column count, a missing alias, or a
wrong row count. Return a structured failure reason:
- wrong number of columns / wrong column names (name them),
- wrong row count (got N, expected M),
- values differ (optionally point at the first differing row/column),
- SQL error (pass through the engine message, as today).

### 1.6 Fix level-data inconsistencies
- **Epoch mismatch:** levels 51–55 are tagged `epoch: 'Intermediate'`/mixed in `levels.ts`, but the
  UI computes epoch from the level id (`id > 40 ⇒ Expert`) in `SQLPanel.tsx:55` and
  `useGameStore.ts:155`. The displayed rank and the data disagree. Make `level.epoch` the single
  source of truth and delete the id-based functions (see 3.2).
- **Level 49 (z-score)** uses correlated subqueries inside a CTE where window functions would be
  the idiomatic (and taught-elsewhere-in-the-game) pattern — simplify the solution and hint.
- Audit seed-query blanks for consistent formatting (some have trailing-space `WHERE `, others
  empty clause bodies) so the scaffold reads uniformly.

---

## Pillar 2 — Tests and CI (the safety net)

There are zero tests and no CI. With 63 solution queries and hand-maintained seed data, regressions
are invisible until a player hits them.

### 2.1 Level-integrity test suite (biggest win per hour invested)
Run sql.js in Node (the npm package works server-side) against the real seed, and for **every**
level assert:
1. `solutionQuery` executes without error;
2. it returns at least one row (a 0-row expected result almost always means a data/level bug);
3. the result is **deterministic** (re-run twice, compare) — catches missing `ORDER BY` with ties;
4. `seedQuery` is not accidentally a complete, passing answer.

This single test file would have caught the epoch/data drift and will protect every future level.

### 2.2 Validator unit tests
Cover `compareResults`/`valuesEqual`: ordering, float tolerance, NULLs, case sensitivity, column
mismatch — including the regressions fixed in Pillar 1.

### 2.3 GitHub Actions
One workflow on PR + main: `npm ci`, `eslint`, `tsc --noEmit`, `vitest run`, `next build`.
(Vitest is the natural choice here: ESM-native, fast, no config friction with Next 16/TS.)

### 2.4 Store tests (small, later)
XP accrual, streak, persistence partialize shape, `goToPreviousLevel` edge cases.

---

## Pillar 3 — Architecture & Code Quality

### 3.1 Bundle sql.js instead of loading 1.8.0 from a CDN
`db.ts:7-21` injects a `<script>` from cdnjs pinned to **1.8.0**, while `package.json` declares
`sql.js: ^1.14.1` (unused at runtime). Problems: version drift vs. the types, a runtime dependency
on a third-party CDN (offline/outage/CSP/supply-chain), and an `any`-cast on `window`.
Use the npm package with the wasm served from `/public` (or `locateFile` → static asset). Delete
the hand-rolled loader and the custom `sql.js.d.ts` shims where the package types suffice.

### 3.2 One progression module
The epoch boundaries and XP table are written out at least four times:
`useGameStore.ts:78` (XP), `SQLPanel.tsx:31,55` (XP + epoch), `useGameStore.ts:155` (epoch),
`LevelProgressMap.tsx:8` (`EPOCH_STARTS` hardcoded `{16,31,41}`), plus a hardcoded `/ 63` max-level
in `GameProvider.tsx`. Create `src/lib/progression.ts` exporting `epochOf(level)`, `xpFor(level)`,
`MAX_LEVEL = levels.length`, and epoch boundary metadata **derived from `levels.ts`** — then delete
every local copy. Adding level 64 should require touching exactly one file.

### 3.3 Remove dead code
- **Auth:** `src/lib/auth.ts` + `src/app/api/auth/[...nextauth]/route.ts` + `next-auth`/`@auth/core`
  deps are wired but never used (PRODUCT.md explicitly says "No signup, no backend"). Delete them —
  or, if auth is on the roadmap, move to a feature branch. Shipping a dead beta dependency
  (`next-auth@5.0.0-beta`) is pure risk.
- Unused types in `src/types/index.ts` (bird/weather-era remnants), the empty `onSuccess` callback
  threaded through `GameProvider → SQLPanel`, and the silent `catch (_) {}` blocks in `SQLPanel`.
- Fix the package name typo: `"name": "sqlawk"` → `"sqlwak"`.

### 3.4 Split `levels.ts`; consider build-time expected results
76 KB and growing linearly. Split into per-epoch modules (`levels/foundational.ts`, …) re-exported
from an index, and move the `Level` validation (unique ids, contiguous, valid epoch) into the test
suite. Longer term: a build step that executes every solution against the seed and emits
`expected-results.json`, so the client never needs the solution text at all (also stops
view-source answer leaking, if that's a concern worth caring about for a free game).

### 3.5 Type and lint hygiene
- Monaco refs are `useRef<unknown>` with structural casts at every call site (`SQLPanel.tsx:91`).
  Use `editor.IStandaloneCodeEditor` from `monaco-editor` types.
- ESLint: add `@typescript-eslint/no-unused-vars`-level rules beyond `next/core-web-vitals`;
  consider `noUncheckedIndexedAccess` in tsconfig once the seed arrays are refactored.
- `p5` + `@types/p5` are heavy; if `FlockCanvas` uses plain canvas 2D (it appears to), drop the
  p5 dependency entirely — it's ~1 MB of dead weight if unused, and lazy-load the canvas component
  either way.

---

## Pillar 4 — Learning Effectiveness & UX

### 4.1 Feedback that teaches
With Pillar 1's structured failures in place:
- Show a compact expected-vs-actual diff (column headers + first mismatching rows) after a failed
  attempt, instead of only a toast. PRODUCT.md says "no hand-holding after the first hint" — a
  diff is information, not hand-holding; it's what a real analyst gets from a failing test.
- Escalating hints: hint after attempt 1 (current behavior), offer to reveal expected *shape*
  (columns + row count) after attempt 3.

### 4.2 Progress and navigation coherence
- Decide intentionally between free navigation (current) and gated unlocks; if free stays, mark
  "skipped ahead" levels visually in `LevelNavigator`/`LevelProgressMap` rather than implying lock.
- Derive epoch dividers in `LevelProgressMap` from level data (3.2) so new sections render correctly.

### 4.3 Accessibility (PRODUCT.md promises WCAG AA)
- Add `aria-label`s and focus management to `LevelNavigator`, `FlockStatus`, and the snippet
  buttons; ensure the level-up modal traps focus and closes on Escape.
- Keep honoring `prefers-reduced-motion` (recently added) in any new animation work.

### 4.4 Mobile/responsive pass
The three-panel terminal layout should degrade deliberately (editor-first stacking) — worth an
explicit audit since the audience includes commute-time interview preppers.

### 4.5 Content roadmap (after the safety net exists)
- Fill genuine syllabus gaps before adding more expert windows: `LEFT JOIN`/NULL handling drills,
  `CASE` basics earlier, date functions, `EXISTS`/anti-joins.
- A short "level authoring guide" (description style, ordering rules, `orderMatters`, seed-query
  conventions) so future levels stay consistent — the test suite from 2.1 enforces the rest.

---

## Pillar 5 — Repo Hygiene & Docs

- README: "50+ levels" → keep evergreen ("60+" or computed badge); document local dev
  (`npm install && npm run dev`), and the test command once it exists.
- Add `CONTRIBUTING.md` covering the level authoring guide and the CI gates.
- Keep `evolution_log.md` (it's good practice) but link it from the README.
- Add a `LICENSE` file — the repo currently has none, which technically means "all rights
  reserved" for a project whose README invites the public to play.

---

## Phased Roadmap

| Phase | Scope | Items | Effort |
|-------|-------|-------|--------|
| **1. Correctness core** | Validator + DB safety | 1.1, 1.2, 1.3, 1.4, 1.5 | ~2–3 days |
| **2. Safety net** | Tests + CI | 2.1, 2.2, 2.3 | ~1–2 days |
| **3. Data & dedup** | Level fixes + progression module + sql.js bundling | 1.6, 3.1, 3.2, 3.3 | ~2 days |
| **4. UX & a11y** | Feedback diff, navigation, accessibility | 4.1, 4.2, 4.3 | ~2–3 days |
| **5. Scale & polish** | Level split, build-time results, content, docs | 3.4, 3.5, 4.4, 4.5, Pillar 5 | ongoing |

Sequencing rationale: Phase 1 fixes what players feel most (wrong grading); Phase 2 locks in those
fixes and protects all 63 levels before any refactor; Phase 3's refactors are then safe to do;
Phases 4–5 build on a trustworthy core.

### Quick wins (can ship immediately, independent of phases)
1. Reject non-`SELECT`/`WITH` statements in `executeQuery` (one guard clause). 
2. Replace hardcoded `/ 63` and `EPOCH_STARTS` with values derived from `levels.length`.
3. Fix `epoch` tags on levels 51–55.
4. Delete unused auth code + `next-auth`/`@auth/core` dependencies.
5. Fix the `sqlawk` package-name typo and add a LICENSE.

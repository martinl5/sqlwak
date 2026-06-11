# LCB Evolution Log

Each entry records one autonomous improvement iteration.

---

## Iteration 6 — 2026-06-11

### [UI/UX Improvements]

- **First-time Onboarding Overlay** (`OnboardingOverlay.tsx`, `useGameStore.ts`, `GameProvider.tsx`):
  A 3-step maritime-themed welcome overlay shown to new players on their first visit (tracked via `hasSeenOnboarding` persisted in the Zustand store).
  - **Step 1 — Welcome**: LCB brand introduction with an anchor SVG icon, contextualising the player as an LCB data analyst navigating maritime data.
  - **Step 2 — SQL + XP mechanics**: Editor usage (⌘↵ to run), epoch progression (Foundational → Expert), XP earning explained.
  - **Step 3 — Navigation guide**: Schema panel, level map strip, hint system.
  - **Visual design**: Gold top-bar gradient, step indicator dots (active dot expands to 18 px pill), circular icon container with gold border, `framer-motion` spring entrance + key-swapped exit animations per step, backdrop blur at 82% black opacity. "Skip" link for returning users who reset data. "Set Sail! ⚓" CTA on final step.
  - **Persistence**: `hasSeenOnboarding: boolean` added to `GameState` interface, store default, and `partialize` list — survives page reloads; new players always see the overlay.
  - Overlay renders above the level-up modal (z-index 60) and appears 600 ms after DB ready state to avoid collision with the loading screen.

### [Game Design Tweaks]

- **Level 64** *(Expert, difficulty 4)* — "Loan Book Risk Tranching (NTILE)":
  Teaches `NTILE(4) OVER (ORDER BY principal_amount DESC)` — the equal-count bucketing function used for Basel III capital adequacy reporting, VaR tranching, and ABS/CDO structuring at sovereign wealth funds and investment banks. CTE assigns each of 15 loans to one of 4 tranches (4-4-4-3 distribution). Outer query aggregates per tranche: loan_count, avg_principal, avg_rate_pct, total_exposure, default_count. Result reveals tranche 1 = four large grade-A home loans ($1.6M total, 0 defaults); tranche 3 = the only Default (loan 8, grade D); tranche 4 = three small high-rate personal loans. No new data needed; uses existing `loans` table.

- **Level 65** *(Expert, difficulty 4)* — "Monthly Portfolio Cash Flow & Running Balance":
  Teaches `SUM(net_flow) OVER (ORDER BY month ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)` — the universal running-total pattern underpinning every treasury ledger, account statement, and real-time P&L feed. CTE aggregates 150 transactions by month (Jan–Jun 2024) into total_credits, total_debits, net_flow. Outer query adds the cumulative running_net_balance. The explicit `ROWS UNBOUNDED PRECEDING` frame is pedagogically important: without it, the default RANGE frame can give non-deterministic results on ties. The result shows 6 rows with the cumulative net position across the portfolio. No new data needed; uses existing `transactions` table.

### [Database & Code Optimizations]

- **`hasSeenOnboarding` state field** added to `GameState`, initialized `false`, persisted in `lcb-analytics-storage` localStorage key — zero-cost addition to existing Zustand `persist` middleware config.
- **`nextHintKey` sentinel array** in `LevelUpModal.tsx` extended from `[..., 63]` to `[..., 63, 64, 65]`; default fallback updated from `63` → `65`; `EPOCH_NEXT_HINT` map extended with entries for levels 64 and 65.
- **No new DB tables or seed rows** — both new levels run cleanly against the existing `loans` and `transactions` tables.

---

## Iteration 5 — 2026-06-08

### [UI/UX Improvements]

- **Level Progress Map Strip** (`LevelProgressMap.tsx`, `GameProvider.tsx`, `globals.css`): A persistent 22-px horizontal strip inserted between the epoch breadcrumb and the main content area. Shows all 63 levels as small clickable tiles (9×14px each), colour-coded by status:
  - Current level: gold with `@keyframes levelMapPulse` glow animation (box-shadow pulse, 1.8 s).
  - Completed levels: green (#22c55e) at 72% opacity.
  - Future levels: near-invisible dark at 22% opacity.
  - Thin 1-px vertical dividers at epoch boundaries (before levels 16, 31, 41).
  - Each tile is a `<button>` with `title` and `aria-label` for keyboard accessibility; clicking navigates directly to that level.
  - Strip is horizontally scrollable with `scrollbarWidth: none` so it stays visually clean.
  - This is the "sticky progress sidebar with level map" item from the UI/UX rotation.

- **LevelNavigator level count fix** (`LevelNavigator.tsx`): Replaced the hardcoded `/ 57` progress counter and `(completedLevels.length / 57) * 100` width calculation with dynamic `levels.length` — navigator will always reflect the current total without manual updates.

### [Game Design Tweaks]

- **Level 62** *(Expert, difficulty 4)* — "Monthly Payment Channel Mix (Pivot)":
  Teaches the standard SQL pivot pattern using conditional aggregation — the only cross-dialect approach (no PIVOT keyword in SQLite, Spark SQL, BigQuery standard SQL). Groups transactions by month and pivots five payment channels (PayNow, FAST, GIRO, Card, ATM) into columns using `COUNT(CASE WHEN channel = '...' THEN 1 END)`. Returns 6 rows (Jan–Jun 2024) showing how channel volume rotates through the data. Directly mirrors the "cross-tab / pivot" pattern used in product-analytics, digital-banking, and e-commerce DS work at FAANG and fintech institutions. No new DB data needed.

- **Level 63** *(Expert, difficulty 4)* — "Cargo Revenue Rolling 3-Month Volatility":
  Implements population standard deviation using the algebraic identity σ = √(AVG(x²) − AVG(x)²) via window functions — the standard approach when the dialect lacks STDDEV (SQLite, legacy Spark SQL, Redshift without extensions). CTE aggregates monthly cargo revenue into USD millions. Outer query applies `AVG(rev) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)` for the moving average and the same frame for `AVG(rev*rev) − AVG(rev)²` inside SQRT for rolling volatility. Returns 6 rows revealing the April 2024 volatility spike (σ ≈ 5.4 M USD) driven by large crude-oil shipments, then a June drop (σ ≈ 6.5 M USD). This exact identity appears in quant-finance rolling-risk computations, real-time anomaly-detection pipelines, and DS interviews at FAANG/sovereign funds.

### [Database & Code Optimizations]

- **New index** `idx_transactions_channel ON transactions(channel)` — speeds up the `channel =` filter in Level 62's conditional aggregation scan.
- **Level count references updated** throughout: `GameProvider.tsx` header `/ 61` → `/ 63`; epoch breadcrumb Expert max `61` → `63`; `LevelUpModal.tsx` completion guard `currentLevel < 61` → `< 63`; `nextHintKey` sentinel array extended to `[..., 63]`; EPOCH_NEXT_HINT entries added for levels 61 and 63.

---

## Iteration 4 — 2026-06-07

### [UI/UX Improvements]

- **Doubloon XP reward float animation** (`SQLPanel.tsx`, `globals.css`): On every correct query submission, a `+N ⬡ XP` badge floats upward from the Run button with a gold glow text-shadow and cubic-bezier easing, then fades out over 1.6 s. Amount is epoch-based: Foundational=+10, Intermediate=+15, Advanced=+20, Expert=+30. Implemented via `@keyframes doubloonFloat` + `.doubloon-float` CSS class; `doubloonAmt` state cleared on `animationend` so re-submissions trigger a fresh animation.
- **"+N XP Earned" badge in LevelUpModal** (`LevelUpModal.tsx`): A new gold-bordered badge (⬡ icon + "+N XP Earned" text) appears between the Career Level and Next Level Hint sections of the completion modal, with a spring-bounce entrance animation (delay 0.48 s). The `epochXpEarned()` helper derives XP from the completed level using the same thresholds as the Zustand store.
- **Epoch breadcrumb max updated** (`GameProvider.tsx`): Expert epoch max bumped 59 → 61; level count header updated `/59` → `/61`.
- **LevelUpModal next-hint map updated**: entries added for levels 59 and 61; "all levels complete" sentinel moved to level 61.

### [Game Design Tweaks]

- **Level 60** *(Expert, difficulty 4)* — "Vessel Maintenance Window Planner (LEAD)":
  Teaches `LEAD(departure_date) OVER (PARTITION BY vessel_id ORDER BY departure_date)` in a CTE to find the next voyage date per vessel. Outer query computes `CAST(JULIANDAY(next_departure) - JULIANDAY(departure_date) AS INTEGER)` as idle_days and filters `WHERE next_departure IS NOT NULL`. Returns 13 rows across vessels 1–10 (vessels 1–3 have 3 voyages each, vessels 4–10 have 2). Mirrors the LEAD look-ahead pattern used in product-analytics session segmentation, quant-finance trade-settlement gap detection, and operational scheduling at large institutions. Uses existing `cargo_shipments` + `vessels` data — no new rows needed.
- **Level 61** *(Expert, difficulty 4)* — "Segment Balance Median (Window-Based)":
  Implements the canonical window-based median when PERCENTILE_CONT is unavailable (SQLite, SparkSQL dialects). CTE joins `accounts` to `customers`, computes `ROW_NUMBER() OVER (PARTITION BY c.segment ORDER BY a.balance)` and `COUNT(*) OVER (PARTITION BY c.segment)`. Outer query: `WHERE rn IN ((cnt+1)/2, (cnt+2)/2)`, `GROUP BY segment`, `AVG(balance)`. Returns median balance per segment (Private, Priority, SME, Mass) ordered by median_balance DESC. This exact pattern appears in FAANG and quant-finance DS interviews whenever the interviewer specifies a dialect without built-in percentile functions.

### [Database & Code Optimizations]

- **`epochXpEarned()` pure helper** added to `LevelUpModal.tsx` (file-scope, not exported) — single source of truth for the per-level XP display in the modal. Mirrors `completeLevel`'s inline threshold logic without coupling to the Zustand store.
- **`epochXp()` pure helper** added to `SQLPanel.tsx` (file-scope) — used by `handleExecute` to determine doubloon float amount; `currentLevel` added to `useCallback` dependency array (removes pre-existing missing-dep lint warning).
- **No new DB tables or seed rows** — both new levels run cleanly against existing `cargo_shipments`, `vessels`, `accounts`, and `customers` data.

---

## Iteration 3 — 2026-06-07

### [UI/UX Improvements]

- **Thematic Harbour Master error toasts** (`SQLPanel.tsx`): Replaced the plain red error bar with a styled "Harbour Master Report" toast:
  - Displays an anchor icon (⚓) + bold gold "HARBOUR MASTER REPORT" heading, then the SQL error in red monospace.
  - Slides up with `toastSlideUp` keyframe animation (0.28s).
  - Auto-dismisses after 7 seconds; includes a manual × dismiss button.
  - Imports `Anchor`, `X` from lucide-react for consistent icon style.
- **Animated query result row reveals** (`DataPreview.tsx`): Query result rows now stagger in with a `fadeInRow` keyframe (left-slide + fade). A `resultVersion` counter triggers re-animation on every new result set (not just on first mount). First 21 rows stagger at 22 ms intervals; subsequent rows appear immediately.
- **Epoch Breadcrumb Strip** (`GameProvider.tsx`): A new 26-px header strip between the brand bar and the main content area shows the four epoch stages (Foundational → Intermediate → Advanced → Expert) as a compact breadcrumb:
  - Current epoch: gold + bold + `▶` prefix.
  - Completed epochs: green + `✓` prefix at 75% opacity.
  - Upcoming epochs: muted grey at 40% opacity.
  - Uses `Fragment` from React for correct `key` on separator elements.
- **Level count** updated from `/57` → `/59` in the header.

### [Game Design Tweaks]

- **Level 58** *(Expert, difficulty 4)* — "Digital Onboarding A/B Test: Conversion Analysis":
  Uses `ab_test_group` column (added in Iteration 2). Measures account-activation conversion rate per group (accounts opened ≥ 2022-01-01). Pattern: `LEFT JOIN` + `COUNT(DISTINCT CASE WHEN ... END)` + `ROUND(100.0 * ... / ..., 1)`, grouped by `ab_test_group`. Expected result: Group A = 40.0%, Group B = 20.0%. Covers the canonical product-analytics / DS interview A/B test computation pattern.
- **Level 59** *(Expert, difficulty 4)* — "Month-over-Month Cargo Revenue Growth (LAG)":
  Two-CTE approach: first CTE aggregates monthly cargo revenue via `STRFTIME('%Y-%m', departure_date)`, second CTE adds `LAG(monthly_revenue_usd) OVER (ORDER BY month)`, outer query computes `mom_growth_pct`. Teaches the LAG() window function as used in financial MoM trend reporting; the result set clearly shows a dramatic April 2024 revenue spike (+96.7%) from large crude oil shipments, and a June slump (-71.7%) from a single departure — pedagogically authentic.

### [Database & Code Optimizations]

- **New index** `idx_accounts_opened_date ON accounts(opened_date)` — speeds up the date-filter in Level 58's LEFT JOIN + CASE WHEN scan.
- **`LevelUpModal` hint map** extended: entry for levels 57–58 now reads "A/B test analysis, LAG/LEAD window functions"; new entry for 59 says "all current levels complete".
- **`nextHintKey` sentinel** updated from `57` → `59`; `currentLevel < 57` guard updated to `< 59`.

---

## Iteration 2 — 2026-06-05

### [UI/UX Improvements]

- **Gamification — XP bar + streak counter** (new, previously undone):
  - Added `totalXp` and `currentStreak` fields to the Zustand game store (persisted via localStorage).
  - XP is awarded on every level completion: Foundational=10 XP, Intermediate=15 XP, Advanced=20 XP, Expert=30 XP.
  - Header now shows: `XP <value>` with a slim gold progress bar (fills each 100 XP milestone) and a 🔥 streak badge showing consecutive completions.
  - Streak badge only appears when streak > 0; styled in orange with subtle glow to distinguish from the gold palette.
  - XP bar animates with `transition-all duration-500` on each successful query.
  - `resetGame` clears both XP and streak.
- **Level count** updated from `/55` (stale from iteration 1) to `/57` in header, LevelNavigator progress bar, and LevelUpModal hint map.
- **LevelUpModal** "next level hint" extended to cover levels 51-57 with Maritime and Senior DS thematic descriptions.

### [Game Design Tweaks]

- **Level 56** *(Expert)* — "Voyage Revenue 7-Day Moving Average": CTE aggregates daily departure revenue, then outer SELECT applies `AVG(...) OVER (ORDER BY departure_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)`. Teaches the CTE + explicit window frame pattern used in time-series analytics at FAANG/quant shops.
- **Level 57** *(Expert)* — "Top-2 Voyages per Cargo Type": CTE with `DENSE_RANK() OVER (PARTITION BY cargo_type ORDER BY cargo_value_usd DESC)` joined to `vessels`, outer query filters `WHERE revenue_rank <= 2`. Classic top-N-per-group interview pattern (FAANG, quant finance).

### [Database & Code Optimizations]

- **`ab_test_group` column added to `customers`**: alternating 'A'/'B' across 20 customers, supporting future A/B experimentation challenges. Column has `DEFAULT 'A'`.
- **Two new indexes**: `idx_shipments_departure ON cargo_shipments(departure_date)` (speeds up time-series window queries in levels 43, 56) and `idx_customers_ab_group ON customers(ab_test_group)` (prepared for A/B level).
- **Type-safe seed update**: customer insert now explicitly binds `ab_test_group` per row.

---

## Iteration 1 — 2026-06-05

### [Game Design Tweaks]

- **Added 5 new SQL challenges** (levels 51–55) spanning the Intermediate → Expert difficulty arc, all themed around LCB's maritime Trade Finance division:
  - **Level 51** *(Intermediate)*: "LCB Fleet Registry" — basic SELECT + ORDER BY on the new `vessels` table.
  - **Level 52** *(Intermediate)*: "Delayed Cargo Alert" — JOIN `cargo_shipments` to `vessels`, filter by status.
  - **Level 53** *(Advanced)*: "Trade Finance Utilisation Rate" — single CTE aggregating `trade_finance_facilities`, compute utilisation % per customer.
  - **Level 54** *(Advanced)*: "Vessel Cargo Revenue Ranking" — CTE + `RANK() OVER (PARTITION BY vessel_type)` to rank vessels within their type.
  - **Level 55** *(Expert)*: "Port Throughput Analysis" — dual-CTE with `UNION ALL` to combine origin/destination ports, then `RANK() OVER` on aggregated values.
- **Updated header**: level counter now reads "/ 55" to reflect the expanded level set.
- **SchemaViewer**: three new table entries (`vessels`, `cargo_shipments`, `trade_finance_facilities`) with full column descriptions and sample queries.

### [Database & Code Optimizations]

- **Three new tables added** to `src/lib/db.ts`:
  - `vessels` (12 rows) — merchant fleet: Container, Bulk Carrier, Tanker, RORO types; SGP/PAN/LBR/MHL/BHS flag states; 6 vessels owned by existing LCB customers.
  - `cargo_shipments` (25 rows) — voyages between Singapore, Port Klang, Bangkok, Jakarta, Ho Chi Minh City and global destinations (Rotterdam, Hamburg, LA, Sydney, Shanghai, Busan, Dubai); 3 Delayed, 5 In Transit, 17 Arrived.
  - `trade_finance_facilities` (15 rows) — Letters of Credit, Shipping Guarantees, Trade Loans, Bills Discount; mix of Active and Expired; utilisation rates from 40% to 93%.
- **5 new indexes** on the maritime tables for query performance: `idx_vessels_type`, `idx_shipments_vessel`, `idx_shipments_status`, `idx_tff_customer`, `idx_tff_status`.
- Seed data uses TypeScript typed tuple arrays for compile-time safety.

---

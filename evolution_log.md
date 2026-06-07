# LCB Evolution Log

Each entry records one autonomous improvement iteration.

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

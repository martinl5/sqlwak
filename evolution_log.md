# LCB Evolution Log

Each entry records one autonomous improvement iteration.

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

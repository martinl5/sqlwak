# LCB Evolution Log

Each entry records one autonomous improvement iteration.

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

## Iteration 2 — 2026-06-06

### [UI/UX Improvements]

- **XP Progress Bar** (gamification): Added a compact XP bar row between the header and content area in `GameProvider.tsx`. Displays current rank (`Analyst → Senior Analyst → VP Analytics → Managing Director`), gold gradient progress fill, XP-to-next-rank countdown, and transition animation (700ms ease).
- **Streak Counter**: Displayed as `🔥 N` badge (amber border/background) in the XP bar row when the player has consecutively completed 2+ levels. Streak resets when the player manually navigates via LevelNavigator (`setCurrentLevel`). Persisted across page refreshes.
- **Doubloon Reward Animation**: Floating `+N ⬡` gold text animates upward and fades out (1.6s) immediately when a query validates correctly in `SQLPanel.tsx`. Amount reflects epoch XP (100/200/300/400). Gold glow text-shadow for visual punch.
- **Level count updated**: Header and LevelNavigator progress bar updated from `/ 55` → `/ 57`.

### [Game Design Tweaks]

- **Level 56** *(Expert)*: "Voyage Revenue Moving Average" — CTE computes freight revenue as 3% of cargo value for Arrived shipments; outer query applies `AVG(...) OVER (ORDER BY departure_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)`. Teaches explicit ROWS frame syntax, mirrors quant-finance moving-average patterns.
- **Level 57** *(Expert)*: "Loan Book Risk Tranching" — CTE uses `NTILE(4) OVER (ORDER BY principal_amount DESC)` to bucket active loans into Senior/Mezzanine A/Mezzanine B/Junior tranches, then aggregates exposure and rate. Mirrors ABS/CLO waterfall analysis used in sell-side and sovereign-fund DS interviews.

### [Database & Code Optimizations]

- **10 additional `cargo_shipments` rows** (2023-07 to 2023-12, all `Arrived`) for a richer time series supporting Level 56's moving-average window. Total rows: 25 → 35.
- **New index** `idx_shipments_depart ON cargo_shipments(departure_date)` — optimises Level 56 `ORDER BY departure_date` window scan.
- **`epochXpGain(level)`** exported from `useGameStore.ts` as a pure utility; used by `completeLevel` action and `SQLPanel` reward animation — single source of truth for XP values.

---

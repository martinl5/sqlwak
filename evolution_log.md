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

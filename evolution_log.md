# LCB Evolution Log

Each entry records one autonomous improvement iteration.

---

## Iteration 14 — 2026-07-13

### [UI/UX Improvements]

- **Rank Promotion Banner** (`RankPromotionBanner.tsx`, `GameProvider.tsx`): When a player's XP crosses a career-rank threshold (Graduate Analyst → Senior Analyst → VP, Data & Analytics → Managing Director), an animated maritime-themed promotion notification slides in from the top-center of the screen. Design details:
  - Spring-animated entrance (`stiffness: 320, damping: 26`) slides the card down from 80 px above the viewport and out the same way on dismiss.
  - Gold top accent stripe + `box-shadow: 0 8px 40px rgba(0,0,0,0.7)` give depth without blocking gameplay.
  - The rank-appropriate icon (⚓ / 🧭 / 🏅) spins 720° on entry via `framer-motion` (2 full rotations, ease-out, 1.2 s) — a single deliberate motion moment rather than ambient animation.
  - A depleting gold countdown bar across the bottom auto-dismisses after 6 seconds; a dismiss `×` button and click-anywhere-to-close ensure no accidental blockers.
  - Each rank has bespoke flavour text linking the player's SQL skill set to the promotion (`fleet's risk dashboards`, `LCB analytics fleet is yours to command`).
  - Detection in `GameProvider.tsx` via `useRef<string | null>` tracking the previous rank name, compared against `rankInfo(totalXp).name` on every XP change. Promotion fires only when `prevRank !== null` (ignores the initial render).
  - Implements the "gamification: rank tiers" rotation item, giving the career-rank ladder (added in iter-7) its missing feedback loop.

### [Game Design Tweaks]

- **Level 76** *(Expert, difficulty 4)* — "Monthly Revenue Completeness Check (WITH RECURSIVE)": Introduces the `WITH RECURSIVE` date-spine pattern — the first use of recursive CTEs in the entire level catalog. The recursive CTE `months(month)` seeds with `'2024-01'` and advances by one calendar month via `STRFTIME('%Y-%m', DATE(month || '-01', '+1 month'))` with `WHERE month < '2024-06'` as the termination guard. A second CTE `monthly_revenue` aggregates `cargo_shipments` by month. The outer query LEFT JOINs the spine to actual revenue, using `COALESCE` for zero-fill and a `CASE WHEN r.month IS NULL` for a `'No shipments'` / `'Active'` status flag. Returns 6 rows — Jan through Jun 2024, all Active (the data has complete coverage, proving the check works correctly). The pedagogical point: a plain `GROUP BY` silently hides zero-activity periods; date spines make gaps explicit. This pattern is foundational in every BI pipeline at FAANG, digital banks, and sovereign wealth funds — used in Looker measures, Redshift/Snowflake time-spine logic, and MAS reporting gap-detection pipelines.

- **Level 77** *(Expert, difficulty 4)* — "Fleet Voyage Bookends (FIRST_VALUE + LAST_VALUE)": Teaches `FIRST_VALUE` and `LAST_VALUE` window functions with the critical **window-frame gotcha**. `LAST_VALUE` with its default frame `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` returns the current row's value, not the partition's last — a common production bug. The solution requires the explicit frame `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`. The level uses a single CTE `voyage_data` computing all four window expressions together (`FIRST_VALUE`, `LAST_VALUE`, `COUNT(*) OVER`, `ROW_NUMBER() OVER`), then the outer query deduplicates with `WHERE rn = 1`. Returns 12 rows — one per vessel, ordered by `vessel_id`. Vessels with multiple departures from different ports (2, 4, 5, 6, 7, 9, 10) show `first_origin ≠ last_origin`, revealing routing evolution over the year; single-voyage vessels (11, 12) and vessels that always depart Singapore (1, 3, 8) show matching bookends. This exact FIRST_VALUE/LAST_VALUE frame pattern appears in FAANG DS interviews, trading-desk settlement-gap analysis, and logistics routing pipelines at sovereign wealth funds.

### [Database & Code Optimizations]

- **`LevelUpModal` hint map** extended with entries for levels 76 (WITH RECURSIVE date spine — "the universal gap-filling pattern for contiguous time-series in every BI pipeline") and 77 (FIRST_VALUE + LAST_VALUE window frames — "always specify ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING for LAST_VALUE"). `nextHintKey` sentinel array extended from `[…, 74, 75]` to `[…, 74, 75, 76, 77]`; fallback updated `?? 75` → `?? 77`. `MAX_LEVEL` in `progression.ts` auto-derives from `levels[levels.length - 1].id` (77) — no other touch points needed.
- **Tests**: 425 tests pass (up from 415 in iter-13). Both new levels auto-picked up by the determinism invariants suite — non-empty result sets confirmed, all ORDER BY keys verified distinct.
- **No new DB tables, seed rows, or indexes** — Level 76 uses the existing `cargo_shipments` table; Level 77 uses the existing `cargo_shipments` + `vessels` tables.

---

## Iteration 13 — 2026-07-06

### [UI/UX Improvements]

- **Keyboard Shortcuts Help Panel** (`SQLPanel.tsx`): Added a "Navigator's Chart" floating shortcuts reference card accessible via a `HelpCircle` icon button in the SQLPanel header (immediately left of the Run button). The panel appears as a gold-bordered floating card (`box-shadow: 0 8px 32px rgba(0,0,0,0.6)`) anchored above the button. It lists all four key bindings — Run (`⌘↵` / `Ctrl↵`), Submit (`⇧⌘↵` / `⇧Ctrl↵`), Toggle shortcuts (`?`), and Close overlays (`Esc`) — in a two-column layout with gold `<kbd>` chips. A compass (`Compass` Lucide icon) and thematic footer note ("Run freely to explore — only Submit counts toward grading") reinforce the maritime theme. The `?` key itself toggles the panel globally, except when the Monaco editor textarea has focus (to avoid intercepting SQL input). `Escape` closes it. Implements the "Accessibility & DX: keyboard shortcuts" item from the UI/UX rotation.

### [Game Design Tweaks]

- **Level 74** *(Expert, difficulty 4)* — "Active Loan Interest Accrual": Teaches simple-interest accrual date arithmetic, the standard MAS regulatory approximation for loan-book exposure. The formula `principal × (rate / 100) × JULIANDAY days / 365` is computed inline in a single SELECT JOIN against loans and customers — no CTE needed. Against the 12 active loans the result ranks Lee Hui Min's $450k grade-A home loan (started 2018-09-30, ~7.75 years elapsed) at the top with ~$87k accrued, and Siti Rahimah's $8k personal loan (started 2024-01-15) at the bottom with ~$1.1k accrued. The deliberate range (5× difference between oldest and newest loans) illustrates how accrual compounds time × principal simultaneously. This exact formula appears in IFRS 9 expected-credit-loss provisioning, Basel III RWA calculations, and treasury liquidity reports at GIC, DBS, and JPMorgan. No new tables or seed data required.

- **Level 75** *(Expert, difficulty 4)* — "A/B Test Sample-Ratio Mismatch (SRM) Check": Teaches the experimentation-platform SRM guard — the first check before any A/B test result can be trusted. Three-CTE chain: (1) `counts` groups `customers.ab_test_group` to get actual group sizes; (2) `total` sums to get the grand total; (3) `expected` CROSS JOINs counts with total to compute `expected_n = total × 0.5`. The outer query adds `deviation_pct = ROUND(100*(actual − expected)/expected, 1)` and a `CASE` expression that flags `'FAIL — SRM detected'` when `|deviation|/expected > 5 %` or `'PASS'` otherwise. With the balanced alternating 'A'/'B' assignment (10 each), both groups return `deviation_pct = 0.0, srm_check = PASS` — the cleanest pedagogical outcome: the check works correctly and the test is valid to analyse. This exact guard is mandated in Experimentation platforms at Booking.com, Airbnb, Netflix, and Meta before any metric computation. Uses the existing `ab_test_group` column added in Iteration 2.

### [Database & Code Optimizations]

- **`LevelUpModal` hint map** extended with entries for levels 74 (simple-interest accrual formula and JULIANDAY arithmetic) and 75 (multi-CTE SRM check pattern). `nextHintKey` sentinel array extended from `[…, 73]` to `[…, 73, 74, 75]`; fallback updated `?? 73` → `?? 75`. `MAX_LEVEL` in `progression.ts` auto-derives from the last level in the array (75) — no other touch points needed.
- **Tests**: 415 tests pass (up from 395 in iter-12). Both new levels are automatically picked up by the determinism invariants suite.
- **No new DB tables, seed rows, or indexes** — Level 74 uses the existing `loans` + `customers` tables; Level 75 uses the existing `customers.ab_test_group` column.

---

## Iteration 12 — 2026-06-29

### [UI/UX Improvements]

- **Collapsible schema panel** (`GameProvider.tsx`): The right-hand Schema/Results column can now be collapsed to a narrow 40px rail on desktop (≥ lg breakpoint) by clicking the `›` chevron button appended to the right side of the tab bar. When collapsed, the rail shows a `‹` expand button and a vertical "SCHEMA" label so the affordance remains clear. The SQL editor column changes from a fixed `460px` to `lg:flex-1 min-w-0`, so it grows to fill the freed horizontal space — giving power users more room to compose long CTEs and window-function queries without layout thrash. A `transition-all duration-200 ease-in-out` CSS transition smooths the width change. The collapse state is session-local (`useState`), not persisted, so the panel always reopens on reload. Keyboard-accessible: both toggle buttons have `aria-label` and `title` attributes. Mobile layouts (< lg) are unaffected — the panels always stack vertically at full width. Directly implements the "collapsible schema panel" item from the UI/UX rotation.

### [Game Design Tweaks]

- **Level 72** *(Expert, difficulty 4)* — "Loan Product Acquisition Funnel": Teaches the canonical SQL product-analytics funnel pattern: a `UNION ALL` of four scalar aggregate queries (one per stage) tagged with an `ord` column, combined with a `CROSS JOIN` scalar CTE for the denominator. The four stages — All Customers (20), Loan Applicants (15), Active Loan Holders (12), Active Home Loan Holders (5) — yield conversion rates of 100 %, 75 %, 60 %, and 25 %. This exact UNION ALL + CROSS JOIN pattern is used in BigQuery, Redshift, Snowflake, and Spark SQL product-analytics pipelines at FAANG, digital banks, and MAS-regulated fintechs. Reinforces the CROSS JOIN scalar CTE idiom from Level 70 in a new product-analytics context. No new data or tables required.

- **Level 73** *(Expert, difficulty 4)* — "First Salary Credit Per Account (ROW_NUMBER Dedup)": Teaches the universal SQL deduplication and latest/earliest-record-per-entity pattern: `ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY transaction_date ASC)` in a CTE, then `WHERE rn = 1` in the outer query. The compliance framing (MAS Notice 632 income-verification) makes the business case for dedup concrete. Returns 4 rows — accounts 5, 15, 25, 35 (customers Aisha Binte Yusof, Chen Mei Ling, Nur Hidayah, Fiona Tan) with their first Salary Credit amounts ($3,750 – $8,250) and dates in Jan–Feb 2024. The ROW_NUMBER PARTITION BY pattern is the universal dedup technique across every SQL dialect and is a staple of ETL pipelines, SCD snapshots, and data-quality remediations at FAANG, hedge funds, and GIC. No new data or tables required.

### [Database & Code Optimizations]

- **`LevelUpModal` hint map** extended with entries for levels 72 (funnel UNION ALL + CROSS JOIN) and 73 (ROW_NUMBER dedup). `nextHintKey` sentinel array extended from `[…, 71]` to `[…, 71, 72, 73]`; fallback updated `?? 71` → `?? 73`. `MAX_LEVEL` in `progression.ts` auto-derives from the last level in the array (73) — no other touch points needed.
- **Left panel flex layout**: changed `lg:w-[460px] flex-shrink-0` to `lg:flex-1 min-w-0` so the SQL editor column grows naturally when the right panel is collapsed, filling available horizontal space without overflow.
- **No new DB tables, seed rows, or indexes** — both new levels run cleanly against the existing `loans`, `transactions`, `accounts`, and `customers` tables.

---

## Iteration 11 — 2026-06-22

### [UI/UX Improvements]

- **Ship-wheel loading spinner** (`GameProvider.tsx`): Replaced the flat shimmer-bar + lion emoji loading screen with an animated SVG maritime ship's helm. An 8-spoke wheel (hub radius 5.5, rim radius 24, knob radius 2.8 at each spoke tip) rotates at 3 s/revolution via `@keyframes spinWheel`. All geometry computed inline via `SPOKE_ANGLES.map()` — no external asset. The spinner is `aria-hidden="true"` since the adjacent text already describes the loading state. Directly implements the "ship-wheel / compass loading spinners" item from the UI/UX rotation.

- **Progressive hint system** (`SQLPanel.tsx`): Replaced the auto-display of the full hint (triggered on any failed attempt) with a click-to-reveal progressive disclosure UI. A `splitHint()` helper splits each level's hint string at `. ` boundaries into at most 3 chunks (grouping more if the hint is longer). After a first failed submission, a gold `💡 Request hint` button appears instead of the full text. Each click reveals one additional chunk in the hint panel; earlier chunks fade to 70% opacity to visually de-emphasise them as the current tip. A `hintChunkIdx` state (reset on every level change) tracks disclosure depth. The button label changes to `Show more hint (N step(s) remaining)` after the first reveal. This changes the cognitive posture from passive delivery to active retrieval — learners who request hints engage more deeply than those who receive them automatically.

### [Game Design Tweaks]

- **Level 70** *(Expert, difficulty 4)* — "Loan Book Risk Scorecard — Weighted Rate & Running Exposure": Teaches four high-value patterns in a single query: (1) **weighted-average rate** via `ROUND(SUM(principal_amount * interest_rate) / SUM(principal_amount), 2)` — the correct way to aggregate rates that differ in volume; (2) **scalar CTE cross-join** using a second `total` CTE and `CROSS JOIN` in the final SELECT to access the grand total for portfolio share computation; (3) **portfolio percentage** `ROUND(100.0 * g.total_principal / t.grand_total, 1)`; (4) **running cumulative exposure** via `SUM(g.total_principal) OVER (ORDER BY g.risk_grade ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)`. Against the active loan book (12 loans, grades A/B/C only) the result is 3 rows: A (5 loans, $1.88M, 2.50%, 86.5%, cumulative $1.88M), B (4 loans, $245K, 2.89%, 11.3%, cumulative $2.13M), C (3 loans, $48K, 5.50%, 2.2%, cumulative $2.17M). This exact scorecard is used in Basel III RWA dashboards at GIC, JPMorgan, and DBS. No new data needed — uses the existing `loans` table.

- **Level 71** *(Expert, difficulty 4)* — "Loan Portfolio Year-over-Year Disbursement Growth": Teaches the canonical YoY growth pattern using two CTEs and `LAG`. CTE `yearly` groups all 15 loans (regardless of current status) by `STRFTIME('%Y', start_date)` into loan_count and total_disbursed. CTE `with_lag` adds `LAG(total_disbursed) OVER (ORDER BY loan_year) AS prev_disbursed`. Outer query computes `CASE WHEN prev_disbursed IS NULL THEN NULL ELSE ROUND(100.0 * (total_disbursed - prev_disbursed) / prev_disbursed, 1) END AS yoy_growth_pct`. Returns 7 rows (2018–2024) showing dramatic origination swings: +100% in 2020, -71.4% in 2021, +172.5% in 2022, -87.2% in 2023. The NULL-safe CASE WHEN pattern is the canonical SQL idiom for period-over-period growth, used in strategic planning decks, investor reports, and loan-book analytics at commercial banks and sovereign wealth funds. No new data needed.

### [Database & Code Optimizations]

- **`LevelUpModal` hint map** extended with entries for levels 70 (risk scorecard — weighted rate, CROSS JOIN scalar CTE) and 71 (YoY growth — STRFTIME + LAG + CASE WHEN NULL). `nextHintKey` sentinel array extended from `[…, 69]` to `[…, 69, 70, 71]`; fallback updated `?? 69` → `?? 71`. `MAX_LEVEL` in `progression.ts` auto-derives from the last level in the array (71) — no other touch points needed.
- **Test suite**: 395 tests pass (up from 375 in iter-10). Both new levels are automatically picked up by the determinism invariants suite, verifying non-empty result sets and confirming all ORDER BY keys are distinct (no ties that could produce non-deterministic ordering).
- **No new DB tables, seed rows, or indexes** — both levels run cleanly against the existing `loans` table.

---

## Iteration 10 — 2026-06-15

### [UI/UX Improvements]

- **Schema-aware SQL auto-complete** (`SQLPanel.tsx`): Monaco now surfaces every LCB table name and column as IntelliSense suggestions when the player types in the editor. A module-level `LCB_SCHEMA` constant maps all 10 tables (customers, accounts, transactions, loans, products, branches, vessels, cargo_shipments, trade_finance_facilities, portal_logins) to their columns. A `registerCompletionItemProvider('sql', …)` call inside `handleEditorMount` registers table entries as `CompletionItemKind.Class` (with "LCB table" detail) and column entries as `CompletionItemKind.Field` (with the parent table name as detail). A `lcbCompletionsRegistered` module-level guard prevents duplicate registration across editor remounts. Players typing a partial table or column name see a ranked dropdown without any CDN dependency — auto-complete is fully self-hosted alongside Monaco.
- **`portal_logins` table in SchemaViewer**: the new table's columns (`login_id`, `customer_id`, `login_at`) are documented with descriptions and a sample query (`SELECT * FROM portal_logins ORDER BY customer_id, login_at`), keeping the schema panel the single source of truth for the playground.

### [Game Design Tweaks]

- **Level 68** *(Expert, difficulty 4)* — "Portal Onboarding Cohort: Month-1 Retention":
  Teaches the canonical three-CTE cohort-retention pattern: (1) first_logins CTE groups `portal_logins` by `customer_id` to find each customer's earliest login and `STRFTIME('%Y-%m', MIN(login_at))` cohort month; (2) retained CTE identifies customers who logged in during the immediately following calendar month using `DATE(first_login_at, '+1 month')`; (3) outer query LEFT JOINs and aggregates `cohort_size`, `retained_month2`, and `ROUND(100.0 * retained / cohort, 1) AS retention_rate_pct` per cohort. Four cohorts (Jan–Apr 2024) yield 75.0 %, 66.7 %, 50.0 %, and 0.0 % Month-1 retention — authentic variation that makes the pedagogical point. This exact pattern appears in Stripe, Revolut, and FAANG DS take-homes.
- **Level 69** *(Expert, difficulty 5)* — "Portal Session Reconstruction (Gaps & Islands)":
  Teaches the universal four-CTE sessionization pattern: (1) lag_applied adds `LAG(login_at) OVER (PARTITION BY customer_id ORDER BY login_at)`; (2) session_flags marks each row `is_new_session = 1` when the gap from the previous login exceeds 30 minutes using `(JULIANDAY(login_at) - JULIANDAY(prev_login_at)) * 24 * 60 > 30`; (3) sessions_numbered assigns a per-customer session ID via `SUM(is_new_session) OVER (PARTITION BY customer_id ORDER BY login_at)` — the classic cumulative-sum island trick; (4) session_stats aggregates each session's duration in whole minutes with `CAST(ROUND(… * 24 * 60) AS INTEGER)`. Outer query returns `total_sessions` and `longest_session_mins` per customer (11 rows). Identical pattern works in BigQuery, Redshift, Snowflake, and Spark SQL. Highest difficulty (5) in the catalog — the capstone Expert challenge.

### [Database & Code Optimizations]

- **`portal_logins` table** added to `src/lib/seed.ts`: 36 rows across customers 1–11, timestamps from Jan–Jun 2024 with deliberate within-session clusters (gap < 30 min) and cross-session gaps. Designed simultaneously to support cohort analysis (customers joining the portal in Jan/Feb/Mar/Apr 2024 cohorts) and sessionization (mixed session durations from 0 to 25 min). Two new indexes: `idx_portal_logins_customer ON portal_logins(customer_id)` and `idx_portal_logins_at ON portal_logins(login_at)`.
- **`LevelUpModal` hint map** extended with entries for levels 68 and 69; `nextHintKey` sentinel array extended from `[…, 67]` to `[…, 67, 68, 69]`; fallback `?? 67` updated to `?? 69`. `MAX_LEVEL` in `progression.ts` derives from `levels[levels.length - 1].id` and auto-updates to 69 — no other touch points needed.

---

## Iteration 9 — 2026-06-12

### [Mobile & Touch Pass — closes the improvement plan]

The last open item in IMPROVEMENT_PLAN.md (§4.4, deeper mobile/touch pass) is done, and the
plan file itself is retired — every other item was either shipped (pillars 1–3, 5, most of 4)
or explicitly deprioritized in its status section (3.4 build-time results, 4.1 value diff).

- **Proper viewport**: `layout.tsx` now exports Next's `viewport` object — device-width,
  `viewportFit: 'cover'` (the fixed terminal layout extends under notches), and the brand
  `themeColor` so mobile browser chrome matches the header.
- **Touch targets**: a `@media (pointer: coarse)` layer in `globals.css` grows icon buttons
  (level navigator open/close, back, toast dismiss) to ≥40px via a shared `.lcb-icon-btn`
  class, gives the SQL snippet pills finger-sized padding, and widens the level-progress-map
  tiles from 9×14 to 15×20. `touch-action: manipulation` on all buttons removes the
  double-tap-zoom delay on rapid Run/Submit taps.
- **Editor on touch**: Monaco gets a 16px font on coarse pointers (anything smaller makes iOS
  zoom the page when the hidden textarea focuses) plus word wrap for narrow screens; the
  ⌘↵ / ⇧⌘↵ keyboard-shortcut hints on Run/Submit are hidden where there is no keyboard.
- **Dynamic-viewport units**: the stacked mobile panels (`75vh`) and the level-up modal
  (`90vh`) now use `dvh`, so the iOS/Android collapsing URL bar no longer hides the bottom
  of the editor or the modal's Continue button.
- **Status bar**: the harbour status row wraps instead of overflowing at very narrow widths.

---

## Iteration 8 — 2026-06-12

### [Game Design Tweaks]

- **Levels 66–67: the anti-join gap is closed.** The 65-level catalog contained exactly one
  `EXISTS` and no dedicated `LEFT JOIN … IS NULL` drill — yet "find the rows in A with no
  match in B" is among the most common SQL interview questions (IMPROVEMENT_PLAN.md §4.5).
  - **Level 66** *(Expert, difficulty 3)* — "Unfinanced Fleet Exposure (Anti-Join)": vessels
    with no trade finance facility on file, via `LEFT JOIN trade_finance_facilities … WHERE
    f.facility_id IS NULL`, ordered by `dwt_tonnes` DESC. The description teaches why the
    NULL test belongs on the right table's primary key. The four matching vessels are exactly
    the ones not owned by LCB customers — uncollateralised third-party carriers, which makes
    the compliance narrative true in the data, not just flavour text.
  - **Level 67** *(Expert, difficulty 4)* — "Lending Whitespace: Depositors Without Loans
    (NOT EXISTS)": customers holding accounts but no loans, with `total_deposits` aggregated,
    via correlated `NOT EXISTS`. The description teaches the `NOT IN` NULL trap (one NULL in
    the subquery silently yields zero rows) — the reason production code prefers `NOT EXISTS`.
  - Both levels' results were verified non-empty and deterministic against the live seed
    (distinct ORDER BY keys, 4 and 5 rows respectively) before authoring; the generic
    level-integrity and determinism suites picked them up automatically (375 tests green).
- **`LevelUpModal` next-hint map** extended with entries for 66 (LEFT JOIN anti-join) and 67
  (NOT EXISTS); sentinel advanced 65 → 67. Level counts everywhere else derive from
  `levels.length` (Iteration 5's progression module), so no other touch points existed.

---

## Iteration 7 — 2026-06-12

### [UI/UX Improvements]

- **Run vs Submit split** (`SQLPanel.tsx`): the single graded "Run" button became two actions.
  **Run** (⌘↵ / Ctrl↵) executes the query and shows its results with no grading and no
  failed-attempt penalty — exploring the data (`SELECT * FROM …`) no longer produces a
  confusing "wrong column count" failure. **Submit** (⇧⌘↵) grades against the expected
  report, drives hints/attempt escalation, and completes the level. Onboarding step 2
  rewritten around the new flow ("Run Freely, Submit to Earn").
- **Results visibility**: query output previously landed in a right-panel tab that defaults
  to Schema — players could run queries and never see their results. The tab is renamed
  **Results**, auto-activates on every run, and on stacked mobile layouts the panel scrolls
  into view. Query results and errors are now cleared when navigating between levels
  (`useGameStore.ts`) so a previous level's output can't mislead.
- **Editor keyboard shortcuts actually work**: Monaco swallows ⌘↵/Ctrl↵ before they reach
  the window listener, so the advertised shortcut never fired while typing in the editor.
  Keybindings are now registered with Monaco itself (`editor.addCommand`), and handlers read
  the live editor model rather than React state (fast type-then-⌘↵ could execute stale SQL).
  The shortcut labels also show `Ctrl` instead of `⌘` on non-Mac platforms.
- **Editor seed bug fixed**: clearing the editor no longer makes the seed scaffold reappear
  (the controlled value fell back to `seedQuery` whenever the state was empty).
- **Model answer reveal** (`LevelUpModal.tsx`): after completing a level, a "Compare with the
  model answer" toggle shows the canonical style-guide solution — players who solved it
  differently learn the idiomatic pattern at the moment of success.
- **Distinct Results states** (`DataPreview.tsx`): "no query run yet" (with an exploration
  suggestion) is now distinguishable from "query ran but returned 0 rows" (with a
  case-sensitivity nudge).

### [Game Design Tweaks]

- **Career ranks are now reachable** (`progression.ts`): the header ladder was hardcoded at
  1000/3000/7000 XP while the whole game only awards 1,285 — VP and Managing Director were
  unreachable. `RANK_LADDER` now derives thresholds from level data (each epoch's rank is
  reached by banking all prior epochs' XP), with `rankInfo()` consumed by the header.
- **Honest replay rewards**: replaying a completed level shows "Replay — XP already banked"
  in the completion modal and skips the +XP float (XP was already awarded only once; the UI
  just claimed otherwise).
- **Fleet survives reloads** (`useGameStore.rehydrateFleet`): up to 10 ships from the most
  recently completed levels sail back into the harbour after a page reload (boids were never
  persisted, so the harbour was empty despite a non-zero Fleet count).
- **Double-docking bug fixed** (`FlockCanvas.tsx`): `lastSpawnedBird` was never consumed, so
  the spawn effect re-fired when the level advanced on modal close — every solve docked two
  ships and inflated the Fleet counter. The spawn request is now cleared after use.

### [Database & Code Optimizations]

- **Monaco self-hosted** (`scripts/sync-sql-assets.mjs`, `monaco-editor` pinned): the editor
  — the core of the product — was loaded from cdn.jsdelivr.net at runtime and the entire
  terminal broke when the CDN was unreachable. It is now copied out of `node_modules` into
  `public/vendor/monaco` at dev/build time, exactly like the sql.js runtime.
- `levelToShipType` in `FlockCanvas` now derives from `epochOf()` instead of duplicating
  hardcoded level boundaries; confetti respects `prefers-reduced-motion`; the level-navigator
  drawer is capped at 92vw on small screens; header rank bar hides below `md` to prevent
  overflow.
- **Tests**: new `tests/progression.test.ts` (rank ladder reachability, monotonic thresholds,
  `rankInfo` boundaries) and store tests for result-clearing on navigation and
  `rehydrateFleet` idempotency — 296 tests total.

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

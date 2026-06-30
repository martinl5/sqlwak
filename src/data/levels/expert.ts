import type { Level } from '@/types';

export const expertLevels: Level[] = [
  // ============================================================
  // EXPERT BANKING (Levels 45–54)
  // Recursive CTEs, Advanced Windows, Multi-CTE Analysis
  // ============================================================

  {
    id: 45,
    title: 'Customer Lifetime Value Estimate',
    description: `Strategic Finance estimates Customer Lifetime Value (CLV) using a simplified formula:
\`LTV = total_balance × 0.015 + total_transacted × 0.001\`

Use two CTEs — one for account balances, one for transaction totals — then compute LTV.

Return \`customer_name\`, \`segment\`, \`total_balance\`, \`total_transacted\`, and \`estimated_ltv\` (2dp), ordered by estimated_ltv descending.`,
    hint: 'Define two CTEs: one summing balances per customer, one summing transaction amounts per customer. Join them in the final SELECT.',
    seedQuery: `WITH balance_totals AS (
  SELECT
    FROM accounts
   GROUP BY
),
tx_totals AS (
  SELECT
    FROM transactions t
    JOIN accounts a ON
   GROUP BY
)
SELECT
  FROM customers c
  JOIN balance_totals bt ON
  LEFT JOIN tx_totals tt ON
 ORDER BY `,
    solutionQuery: `WITH balance_totals AS (
  SELECT customer_id, SUM(balance) AS total_balance
    FROM accounts
   GROUP BY customer_id
),
tx_totals AS (
  SELECT a.customer_id, ROUND(SUM(t.amount), 2) AS total_transacted
    FROM transactions t
    JOIN accounts a ON t.account_id = a.account_id
   GROUP BY a.customer_id
)
SELECT c.customer_name,
       c.segment,
       ROUND(bt.total_balance,    2) AS total_balance,
       ROUND(tt.total_transacted, 2) AS total_transacted,
       ROUND(bt.total_balance * 0.015 + tt.total_transacted * 0.001, 2) AS estimated_ltv
  FROM customers c
  JOIN balance_totals bt ON c.customer_id = bt.customer_id
  LEFT JOIN tx_totals tt ON c.customer_id = tt.customer_id
 ORDER BY estimated_ltv DESC`,
    epoch: 'Expert',
    difficulty: 4,
  },

  {
    id: 46,
    title: 'Transaction Spike Detection',
    description: `Fraud Operations flags customers whose single largest transaction is more than 3× their personal average. Compute the anomaly ratio.

Return \`customer_name\`, \`segment\`, \`avg_transaction\`, \`largest_transaction\`, and \`anomaly_ratio\` (1dp) for customers meeting this threshold, ordered by anomaly_ratio descending.`,
    hint: 'Use a CTE to compute AVG and MAX per customer via a join chain, then filter in the outer query.',
    seedQuery: `WITH spend_stats AS (
  SELECT
    FROM transactions t
    JOIN accounts a ON
   GROUP BY
)
SELECT
  FROM customers c
  JOIN spend_stats s ON
 WHERE
 ORDER BY `,
    solutionQuery: `WITH spend_stats AS (
  SELECT a.customer_id,
         ROUND(AVG(t.amount), 2) AS avg_tx,
         MAX(t.amount)           AS max_tx
    FROM transactions t
    JOIN accounts a ON t.account_id = a.account_id
   GROUP BY a.customer_id
)
SELECT c.customer_name,
       c.segment,
       s.avg_tx                              AS avg_transaction,
       s.max_tx                              AS largest_transaction,
       ROUND(s.max_tx / s.avg_tx, 1)         AS anomaly_ratio
  FROM customers c
  JOIN spend_stats s ON c.customer_id = s.customer_id
 WHERE s.max_tx > s.avg_tx * 3
 ORDER BY anomaly_ratio DESC`,
    epoch: 'Expert',
    difficulty: 4,
  },

  {
    id: 47,
    title: 'Rolling 30-Day Debit Spend',
    description: `Treasury's liquidity desk monitors a rolling 30-day debit spend window to detect unusual cash outflow patterns.

Aggregate daily debit totals, then compute a 30-day rolling sum using a window frame. Return \`transaction_date\`, \`daily_amount\`, and \`rolling_30d\` (rounded to 2dp), ordered by date. Limit to 30 rows.`,
    hint: 'GROUP BY date first for daily_amount, then use SUM(...) OVER (ORDER BY transaction_date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW).',
    seedQuery: `SELECT transaction_date,
        AS daily_amount,
        AS rolling_30d
  FROM transactions
 WHERE
 GROUP BY transaction_date
 ORDER BY transaction_date
 LIMIT 30`,
    solutionQuery: `SELECT transaction_date,
       ROUND(SUM(amount), 2)        AS daily_amount,
       ROUND(SUM(SUM(amount)) OVER (
         ORDER BY transaction_date
         ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
       ), 2)                         AS rolling_30d
  FROM transactions
 WHERE transaction_type = 'Debit'
 GROUP BY transaction_date
 ORDER BY transaction_date
 LIMIT 30`,
    epoch: 'Expert',
    difficulty: 4,
  },

  {
    id: 48,
    title: 'Loan Amortisation Schedule (Recursive CTE)',
    description: `Using a recursive CTE, generate the first 12 months of the repayment schedule for Loan #1 (SGD 380,000 at 2.5% p.a., monthly payment ≈ SGD 1,760).

Return \`month_num\` and \`remaining_balance\` (2dp) for months 1 through 12.`,
    hint: 'Start the recursive CTE with month_num = 1 and balance = 380000, then each step: balance * (1 + 0.025/12) - 1760. Stop at month_num < 12.',
    seedQuery: `WITH RECURSIVE schedule(month_num, balance) AS (
  SELECT 1, 380000.0
  UNION ALL
  SELECT month_num + 1,

    FROM schedule
   WHERE
)
SELECT month_num,
       balance AS remaining_balance
  FROM schedule`,
    solutionQuery: `WITH RECURSIVE schedule(month_num, balance) AS (
  SELECT 1, 380000.0
  UNION ALL
  SELECT month_num + 1,
         ROUND(balance * (1.0 + 0.025 / 12) - 1760.0, 2)
    FROM schedule
   WHERE month_num < 12
)
SELECT month_num,
       balance AS remaining_balance
  FROM schedule`,
    epoch: 'Expert',
    difficulty: 4,
  },

  {
    id: 49,
    title: 'Customer Acquisition Cohort Analysis',
    description: `Cohort analysis: group customers by the year they joined LCB, then measure total accounts opened and average balance per cohort.

Return \`cohort_year\`, \`customers_acquired\`, \`total_accounts\`, and \`avg_balance_per_customer\` (2dp), ordered by cohort_year.`,
    hint: 'Use strftime(\'%Y\', join_date) to extract the cohort year, then aggregate with a join to accounts.',
    seedQuery: `WITH cohorts AS (
  SELECT customer_id,
          AS cohort_year
    FROM customers
)
SELECT
  FROM cohorts c
  JOIN accounts a ON
 GROUP BY
 ORDER BY `,
    solutionQuery: `WITH cohorts AS (
  SELECT customer_id,
         strftime('%Y', join_date) AS cohort_year
    FROM customers
)
SELECT c.cohort_year,
       COUNT(DISTINCT c.customer_id)                            AS customers_acquired,
       COUNT(a.account_id)                                      AS total_accounts,
       ROUND(SUM(a.balance) / COUNT(DISTINCT c.customer_id), 2) AS avg_balance_per_customer
  FROM cohorts c
  JOIN accounts a ON c.customer_id = a.customer_id
 GROUP BY c.cohort_year
 ORDER BY c.cohort_year`,
    epoch: 'Expert',
    difficulty: 4,
  },

  {
    id: 50,
    title: 'Portfolio Risk Concentration',
    description: `The Board requires a risk concentration report: for each risk grade, show the loan count, total exposure, average rate, and its percentage of the overall portfolio.

Use two CTEs — one for per-grade totals, one for the portfolio grand total — then join them.

Return \`risk_grade\`, \`loan_count\`, \`total_exposure\`, \`avg_rate\` (2dp), and \`portfolio_pct\` (1dp), ordered by risk_grade.`,
    hint: 'First CTE groups by risk_grade. Second CTE selects the grand total. Cross-join them in the final SELECT to compute the percentage.',
    seedQuery: `WITH grade_totals AS (
  SELECT
    FROM loans
   GROUP BY
),
portfolio AS (
  SELECT
    FROM loans
)
SELECT
  FROM grade_totals g, portfolio p
 ORDER BY `,
    solutionQuery: `WITH grade_totals AS (
  SELECT risk_grade,
         COUNT(*)                        AS loan_count,
         ROUND(SUM(principal_amount), 0) AS total_exposure,
         ROUND(AVG(interest_rate), 2)    AS avg_rate
    FROM loans
   GROUP BY risk_grade
),
portfolio AS (
  SELECT SUM(principal_amount) AS grand_total
    FROM loans
)
SELECT g.risk_grade,
       g.loan_count,
       g.total_exposure,
       g.avg_rate,
       ROUND(g.total_exposure * 100.0 / p.grand_total, 1) AS portfolio_pct
  FROM grade_totals g, portfolio p
 ORDER BY g.risk_grade`,
    epoch: 'Expert',
    difficulty: 4,
  },

  {
    id: 51,
    title: 'Customer Churn Risk Signals',
    description: `Retention Analytics flags customers showing churn signals: either they have at least one Dormant account, or their last transaction was before March 2024.

Use two CTEs (last_tx and dormant_check) and a LEFT JOIN to combine signals.

Return \`customer_name\`, \`segment\`, \`join_date\`, \`last_transaction\`, and \`dormant_accounts\`, ordered by segment then customer_name.`,
    hint: 'CTE 1: MAX transaction date per customer. CTE 2: COUNT dormant accounts per customer. Join both to customers with LEFT JOIN, filter in WHERE.',
    seedQuery: `WITH last_tx AS (
  SELECT
    FROM transactions t
    JOIN accounts a ON
   GROUP BY
),
dormant_check AS (
  SELECT
    FROM accounts
   WHERE
   GROUP BY
)
SELECT
  FROM customers c
  LEFT JOIN last_tx       lt ON
  LEFT JOIN dormant_check dc ON
 WHERE
 ORDER BY `,
    solutionQuery: `WITH last_tx AS (
  SELECT a.customer_id,
         MAX(t.transaction_date) AS last_transaction
    FROM transactions t
    JOIN accounts a ON t.account_id = a.account_id
   GROUP BY a.customer_id
),
dormant_check AS (
  SELECT customer_id,
         COUNT(*) AS dormant_accounts
    FROM accounts
   WHERE status = 'Dormant'
   GROUP BY customer_id
)
SELECT c.customer_name,
       c.segment,
       c.join_date,
       lt.last_transaction,
       COALESCE(dc.dormant_accounts, 0) AS dormant_accounts
  FROM customers c
  LEFT JOIN last_tx       lt ON c.customer_id = lt.customer_id
  LEFT JOIN dormant_check dc ON c.customer_id = dc.customer_id
 WHERE COALESCE(dc.dormant_accounts, 0) > 0
    OR lt.last_transaction < '2024-03-01'
 ORDER BY c.segment, c.customer_name`,
    epoch: 'Expert',
    difficulty: 4,
  },

  {
    id: 52,
    title: 'Total Interest Income Projection',
    description: `Finance needs the projected total interest income for all active loans using the simple interest formula:
\`total_interest = principal × rate / 100 / 12 × term_months\`

Return \`loan_id\`, \`customer_name\`, \`principal_amount\`, \`interest_rate\`, \`term_months\`, \`total_interest\` (2dp), and \`total_repayment\` (2dp), ordered by total_interest descending. Limit 10.`,
    hint: 'Calculate total_interest as ROUND(principal * rate / 100.0 / 12 * term_months, 2) and total_repayment as principal + that value.',
    seedQuery: `SELECT
  FROM loans l
  JOIN customers c ON
 WHERE
 ORDER BY
 LIMIT 10`,
    solutionQuery: `SELECT l.loan_id,
       c.customer_name,
       l.principal_amount,
       l.interest_rate,
       l.term_months,
       ROUND(l.principal_amount * l.interest_rate / 100.0 / 12 * l.term_months, 2) AS total_interest,
       ROUND(l.principal_amount + l.principal_amount * l.interest_rate / 100.0 / 12 * l.term_months, 2) AS total_repayment
  FROM loans l
  JOIN customers c ON l.customer_id = c.customer_id
 WHERE l.status = 'Active'
 ORDER BY total_interest DESC
 LIMIT 10`,
    epoch: 'Expert',
    difficulty: 4,
  },

  {
    id: 53,
    title: 'Transaction Anomaly Z-Score',
    description: `Advanced fraud detection: compute a simplified Z-score for each transaction relative to its account's mean and variance. Flag those with an absolute Z-score > 1.5.

Use a CTE for account-level statistics, then calculate Z-score in the outer query.

Return \`transaction_id\`, \`account_id\`, \`amount\`, \`merchant_category\`, \`account_avg\`, and \`z_score\` (2dp), ordered by z_score descending. Limit 15.`,
    hint: 'CTE: compute AVG(amount) and variance as AVG(amount * amount) - AVG(amount) * AVG(amount) per account_id. Outer query: CASE WHEN variance > 0 THEN (amount - avg) / SQRT(variance) ELSE 0 END.',
    seedQuery: `WITH account_stats AS (
  SELECT account_id,
         AVG(amount) AS avg_amt,
          AS variance
    FROM transactions
   GROUP BY account_id
)
SELECT
  FROM transactions t
  JOIN account_stats s ON
 WHERE
 ORDER BY
 LIMIT 15`,
    solutionQuery: `WITH account_stats AS (
  SELECT account_id,
         AVG(amount) AS avg_amt,
         AVG(amount * amount) - AVG(amount) * AVG(amount) AS variance
    FROM transactions
   GROUP BY account_id
)
SELECT t.transaction_id,
       t.account_id,
       t.amount,
       t.merchant_category,
       ROUND(s.avg_amt, 2) AS account_avg,
       CASE WHEN s.variance > 0
            THEN ROUND((t.amount - s.avg_amt) / SQRT(s.variance), 2)
            ELSE 0
       END AS z_score
  FROM transactions t
  JOIN account_stats s ON t.account_id = s.account_id
 WHERE s.variance > 0
   AND ABS((t.amount - s.avg_amt) / SQRT(s.variance)) > 1.5
 ORDER BY z_score DESC
 LIMIT 15`,
    epoch: 'Expert',
    difficulty: 4,
  },

  {
    id: 54,
    title: 'LCB Executive Dashboard',
    description: `The CEO requests a single-row summary KPI dashboard for the Board pack. Compute all key metrics in one query using subqueries within a SELECT.

Return these columns:
- \`total_customers\`
- \`active_accounts\`
- \`total_deposits_sgd\` (rounded)
- \`total_loans_sgd\` (rounded)
- \`net_position_sgd\` (deposits minus loans, rounded)
- \`june_transactions\`
- \`salary_inflow_sgd\` (rounded)`,
    hint: 'Use scalar subqueries in the SELECT list — each subquery computes one KPI. No FROM or GROUP BY needed in the outer query.',
    seedQuery: `SELECT
  (SELECT  FROM customers)                      AS total_customers,
  (SELECT  FROM accounts   WHERE )              AS active_accounts,
  (SELECT  FROM accounts   WHERE )              AS total_deposits_sgd,
  (SELECT  FROM loans      WHERE )              AS total_loans_sgd,
  (SELECT  FROM accounts   WHERE )
    - (SELECT  FROM loans   WHERE )             AS net_position_sgd,
  (SELECT  FROM transactions WHERE )            AS june_transactions,
  (SELECT  FROM transactions WHERE )            AS salary_inflow_sgd`,
    solutionQuery: `SELECT
  (SELECT COUNT(*)          FROM customers)                                                             AS total_customers,
  (SELECT COUNT(*)          FROM accounts        WHERE status = 'Active')                              AS active_accounts,
  (SELECT ROUND(SUM(balance), 0) FROM accounts   WHERE status = 'Active')                             AS total_deposits_sgd,
  (SELECT ROUND(SUM(principal_amount), 0) FROM loans WHERE status = 'Active')                         AS total_loans_sgd,
  (SELECT ROUND(SUM(balance), 0) FROM accounts WHERE status = 'Active')
    - (SELECT ROUND(SUM(principal_amount), 0) FROM loans WHERE status = 'Active')                     AS net_position_sgd,
  (SELECT COUNT(*) FROM transactions WHERE transaction_date >= '2024-06-01')                           AS june_transactions,
  (SELECT ROUND(SUM(amount), 0) FROM transactions WHERE merchant_category = 'Salary Credit')          AS salary_inflow_sgd`,
    epoch: 'Expert',
    difficulty: 4,
  },

  // ============================================================
  // MARITIME TRADE FINANCE EXPERT (Levels 55–63)
  // Complex analytics: UNION ALL, multi-CTE, advanced window functions
  // ============================================================

  {
    id: 55,
    title: 'Port Throughput Analysis',
    description: `Strategic Planning wants to know which ports handle the most LCB-financed cargo — combining both origin and destination appearances in a single report.

Use two CTEs: one combining origin and destination ports via \`UNION ALL\`, another aggregating by port. Then rank ports by \`total_cargo_value\` using \`RANK() OVER\`.

Return \`port\`, \`shipment_count\`, \`total_cargo_value\`, and \`cargo_rank\`, ordered by \`total_cargo_value\` descending.`,
    hint: 'CTE 1: UNION ALL of (origin_port, cargo_value_usd) and (destination_port, cargo_value_usd). CTE 2: GROUP BY port. Outer: RANK() OVER (ORDER BY total_cargo_value DESC).',
    seedQuery: `WITH port_activity AS (
  SELECT  AS port, cargo_value_usd FROM cargo_shipments
  UNION ALL
  SELECT  AS port, cargo_value_usd FROM cargo_shipments
),
port_totals AS (
  SELECT port,
         COUNT(*)                          AS shipment_count,
         ROUND(SUM(cargo_value_usd), 0)    AS total_cargo_value
    FROM port_activity
   GROUP BY port
)
SELECT port, shipment_count, total_cargo_value,
        AS cargo_rank
  FROM port_totals
 ORDER BY `,
    solutionQuery: `WITH port_activity AS (
  SELECT origin_port      AS port, cargo_value_usd FROM cargo_shipments
  UNION ALL
  SELECT destination_port AS port, cargo_value_usd FROM cargo_shipments
),
port_totals AS (
  SELECT port,
         COUNT(*)                       AS shipment_count,
         ROUND(SUM(cargo_value_usd), 0) AS total_cargo_value
    FROM port_activity
   GROUP BY port
)
SELECT port,
       shipment_count,
       total_cargo_value,
       RANK() OVER (ORDER BY total_cargo_value DESC) AS cargo_rank
  FROM port_totals
 ORDER BY total_cargo_value DESC`,
    epoch: 'Expert',
    difficulty: 4,
  },

  // ============================================================
  // SENIOR DS PATTERNS (Levels 56–57)
  // Moving average with explicit window frame; top-N per group
  // ============================================================

  {
    id: 56,
    title: 'Voyage Revenue 7-Day Moving Average',
    description: `Treasury's Risk desk needs a rolling 7-voyage moving average of daily cargo revenue to smooth out scheduling noise and spot revenue trends.

Step 1: Use a CTE to compute \`daily_revenue_usd\` by grouping \`cargo_shipments\` by \`departure_date\`.
Step 2: Apply \`AVG(daily_revenue_usd) OVER (ORDER BY departure_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)\` in the outer SELECT.

Return \`departure_date\`, \`daily_revenue_usd\`, and \`revenue_7d_avg_usd\` (rounded to 0 dp), ordered by \`departure_date\`.`,
    hint: 'Use WITH daily AS (SELECT departure_date, ROUND(SUM(cargo_value_usd),0) ... GROUP BY departure_date), then in the outer SELECT apply AVG(...) OVER (ORDER BY departure_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW).',
    seedQuery: `WITH daily AS (
  SELECT departure_date,
         ROUND(SUM(cargo_value_usd), 0) AS daily_revenue_usd
    FROM cargo_shipments
   GROUP BY
)
SELECT departure_date,
       daily_revenue_usd,
        AS revenue_7d_avg_usd
  FROM daily
 ORDER BY departure_date`,
    solutionQuery: `WITH daily AS (
  SELECT departure_date,
         ROUND(SUM(cargo_value_usd), 0) AS daily_revenue_usd
    FROM cargo_shipments
   GROUP BY departure_date
)
SELECT departure_date,
       daily_revenue_usd,
       ROUND(AVG(daily_revenue_usd) OVER (
         ORDER BY departure_date
         ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
       ), 0) AS revenue_7d_avg_usd
  FROM daily
 ORDER BY departure_date`,
    epoch: 'Expert',
    difficulty: 4,
  },

  {
    id: 57,
    title: 'Top-2 Voyages per Cargo Type',
    description: `The Fleet Analytics team wants to spotlight the two highest-value voyages for every cargo category — a classic top-N-per-group pattern used in product analytics and portfolio reporting.

Use a CTE with \`DENSE_RANK() OVER (PARTITION BY cargo_type ORDER BY cargo_value_usd DESC)\`, join to \`vessels\` for the vessel name, then filter in the outer query where \`revenue_rank <= 2\`.

Return \`cargo_type\`, \`vessel_name\`, \`cargo_value_usd\`, \`departure_date\`, and \`revenue_rank\`, ordered by \`cargo_type\` then \`revenue_rank\`.`,
    hint: 'CTE: JOIN cargo_shipments s to vessels v ON vessel_id, compute DENSE_RANK() OVER (PARTITION BY s.cargo_type ORDER BY s.cargo_value_usd DESC) AS revenue_rank. Outer query: SELECT ... WHERE revenue_rank <= 2.',
    seedQuery: `WITH ranked_voyages AS (
  SELECT s.shipment_id,
         v.vessel_name,
         s.cargo_type,
         s.cargo_value_usd,
         s.departure_date,
         DENSE_RANK() OVER (
           PARTITION BY
               ORDER BY
         ) AS revenue_rank
    FROM cargo_shipments s
    JOIN vessels v ON
)
SELECT cargo_type, vessel_name, cargo_value_usd, departure_date, revenue_rank
  FROM ranked_voyages
 WHERE
 ORDER BY cargo_type, revenue_rank`,
    solutionQuery: `WITH ranked_voyages AS (
  SELECT s.shipment_id,
         v.vessel_name,
         s.cargo_type,
         s.cargo_value_usd,
         s.departure_date,
         DENSE_RANK() OVER (
           PARTITION BY s.cargo_type
               ORDER BY s.cargo_value_usd DESC
         ) AS revenue_rank
    FROM cargo_shipments s
    JOIN vessels v ON s.vessel_id = v.vessel_id
)
SELECT cargo_type,
       vessel_name,
       cargo_value_usd,
       departure_date,
       revenue_rank
  FROM ranked_voyages
 WHERE revenue_rank <= 2
 ORDER BY cargo_type, revenue_rank`,
    epoch: 'Expert',
    difficulty: 4,
  },

  // ============================================================
  // SENIOR DS PATTERNS (Levels 58–59)
  // A/B test conversion analysis; LAG-based MoM revenue growth
  // ============================================================

  {
    id: 58,
    title: 'Digital Onboarding A/B Test: Conversion Analysis',
    description: `LCB's Digital Banking team ran a controlled experiment on a new onboarding flow.
Customers in ab_test_group = 'A' received the redesigned digital UI; group 'B' saw the original.

The conversion metric is account activation: any customer who opened at least one account with opened_date ≥ '2022-01-01' (the test launch date).

Compute per group:
  • total_customers — COUNT DISTINCT customer_id from customers
  • converted — COUNT DISTINCT customer_id who have a qualifying account
  • conversion_rate_pct — ROUND to 1 dp

Use a LEFT JOIN to accounts so customers with no qualifying account are still counted in the denominator.

Return ab_test_group, total_customers, converted, conversion_rate_pct, ordered by ab_test_group.`,
    hint: "LEFT JOIN accounts a ON a.customer_id = c.customer_id, GROUP BY c.ab_test_group. Use COUNT(DISTINCT CASE WHEN a.opened_date >= '2022-01-01' THEN c.customer_id END) for converted, then divide by COUNT(DISTINCT c.customer_id) for the rate.",
    seedQuery: `SELECT
  c.ab_test_group,
  COUNT(DISTINCT c.customer_id)                                     AS total_customers,
  COUNT(DISTINCT CASE WHEN  THEN c.customer_id END)                 AS converted,
  ROUND(100.0 *  /  , 1)                                            AS conversion_rate_pct
FROM customers c
LEFT JOIN  ON a.customer_id = c.customer_id
GROUP BY c.ab_test_group
ORDER BY c.ab_test_group`,
    solutionQuery: `SELECT
  c.ab_test_group,
  COUNT(DISTINCT c.customer_id) AS total_customers,
  COUNT(DISTINCT CASE WHEN a.opened_date >= '2022-01-01' THEN c.customer_id END) AS converted,
  ROUND(
    100.0 * COUNT(DISTINCT CASE WHEN a.opened_date >= '2022-01-01' THEN c.customer_id END)
          / COUNT(DISTINCT c.customer_id),
    1
  ) AS conversion_rate_pct
FROM customers c
LEFT JOIN accounts a ON a.customer_id = c.customer_id
GROUP BY c.ab_test_group
ORDER BY c.ab_test_group`,
    epoch: 'Expert',
    difficulty: 4,
  },

  {
    id: 59,
    title: 'Month-over-Month Cargo Revenue Growth (LAG)',
    description: `The CFO's dashboard needs a monthly revenue trend for the cargo fleet with explicit month-on-month percentage change.

Step 1 — CTE 'monthly': GROUP cargo_shipments by STRFTIME('%Y-%m', departure_date), compute monthly_revenue_usd = ROUND(SUM(cargo_value_usd), 0).
Step 2 — CTE 'with_lag': apply LAG(monthly_revenue_usd) OVER (ORDER BY month) as prev_month_revenue_usd.
Step 3 — Outer SELECT: compute mom_growth_pct = ROUND(100.0 * (monthly_revenue_usd - prev_month_revenue_usd) / prev_month_revenue_usd, 1).

Return month, monthly_revenue_usd, prev_month_revenue_usd, mom_growth_pct, ordered by month.
(The first row will have NULL for prev_month_revenue_usd and mom_growth_pct — that is correct.)`,
    hint: 'Two CTEs: first aggregates by month, second adds LAG(...) OVER (ORDER BY month). The outer query computes (current - prev) / prev * 100 for the growth rate.',
    seedQuery: `WITH monthly AS (
  SELECT STRFTIME('%Y-%m', departure_date) AS month,
         ROUND(SUM(cargo_value_usd), 0)    AS monthly_revenue_usd
    FROM cargo_shipments
   GROUP BY
),
with_lag AS (
  SELECT month,
         monthly_revenue_usd,
         LAG(monthly_revenue_usd) OVER (ORDER BY ) AS prev_month_revenue_usd
    FROM monthly
)
SELECT month, monthly_revenue_usd, prev_month_revenue_usd,
       ROUND(100.0 * (monthly_revenue_usd - prev_month_revenue_usd) /  , 1) AS mom_growth_pct
  FROM with_lag
 ORDER BY month`,
    solutionQuery: `WITH monthly AS (
  SELECT STRFTIME('%Y-%m', departure_date) AS month,
         ROUND(SUM(cargo_value_usd), 0)    AS monthly_revenue_usd
    FROM cargo_shipments
   GROUP BY STRFTIME('%Y-%m', departure_date)
),
with_lag AS (
  SELECT month,
         monthly_revenue_usd,
         LAG(monthly_revenue_usd) OVER (ORDER BY month) AS prev_month_revenue_usd
    FROM monthly
)
SELECT month,
       monthly_revenue_usd,
       prev_month_revenue_usd,
       ROUND(100.0 * (monthly_revenue_usd - prev_month_revenue_usd) / prev_month_revenue_usd, 1) AS mom_growth_pct
  FROM with_lag
 ORDER BY month`,
    epoch: 'Expert',
    difficulty: 4,
  },

  // ============================================================
  // SENIOR DS PATTERNS (Levels 60–61)
  // LEAD look-ahead; window-based median (ROW_NUMBER + COUNT)
  // ============================================================

  {
    id: 60,
    title: 'Vessel Maintenance Window Planner (LEAD)',
    description: `Port Operations needs to identify idle periods between consecutive voyages for each vessel — the windows when dry-dock maintenance or crew rotations can be scheduled.

For every vessel with multiple voyages, show the gap in days between each departure and the vessel's next departure.

Use LEAD() in a CTE to look ahead to the next departure_date within the same vessel_id, ordered by departure_date. In the outer query, compute idle_days using JULIANDAY arithmetic and filter out rows with no next departure.

Return \`vessel_name\`, \`vessel_type\`, \`departure_date\`, \`next_departure\`, and \`idle_days\` (integer), ordered by vessel_name then departure_date.`,
    hint: 'CTE: LEAD(departure_date) OVER (PARTITION BY vessel_id ORDER BY departure_date) AS next_departure. Outer: CAST(JULIANDAY(next_departure) - JULIANDAY(departure_date) AS INTEGER) AS idle_days, WHERE next_departure IS NOT NULL.',
    seedQuery: `WITH vessel_schedule AS (
  SELECT v.vessel_name,
         v.vessel_type,
         cs.departure_date,
         LEAD(cs.departure_date) OVER (
           PARTITION BY cs.vessel_id
           ORDER BY cs.departure_date
         ) AS next_departure
    FROM cargo_shipments cs
    JOIN vessels v ON cs.vessel_id = v.vessel_id
)
SELECT vessel_name,
       vessel_type,
       departure_date,
       next_departure,
        AS idle_days
  FROM vessel_schedule
 WHERE
 ORDER BY vessel_name, departure_date`,
    solutionQuery: `WITH vessel_schedule AS (
  SELECT v.vessel_name,
         v.vessel_type,
         cs.departure_date,
         LEAD(cs.departure_date) OVER (
           PARTITION BY cs.vessel_id
           ORDER BY cs.departure_date
         ) AS next_departure
    FROM cargo_shipments cs
    JOIN vessels v ON cs.vessel_id = v.vessel_id
)
SELECT vessel_name,
       vessel_type,
       departure_date,
       next_departure,
       CAST(JULIANDAY(next_departure) - JULIANDAY(departure_date) AS INTEGER) AS idle_days
  FROM vessel_schedule
 WHERE next_departure IS NOT NULL
 ORDER BY vessel_name, departure_date`,
    epoch: 'Expert',
    difficulty: 4,
  },

  {
    id: 61,
    title: 'Segment Balance Median (Window-Based)',
    description: `Risk Analytics wants the median account balance per customer segment. Unlike the mean, the median resists distortion from ultra-high-net-worth Private Banking clients.

Since SQLite lacks PERCENTILE_CONT, implement the window-based median: assign a rank to each account within its segment using ROW_NUMBER() OVER (PARTITION BY segment ORDER BY balance), then count group size with COUNT(*) OVER (PARTITION BY segment). The middle row(s) satisfy rn IN ((cnt+1)/2, (cnt+2)/2); taking AVG of those rows gives the median for both odd and even group sizes.

Return \`segment\` and \`median_balance\` (2dp), ordered by \`median_balance\` descending.`,
    hint: 'CTE: JOIN accounts to customers, compute ROW_NUMBER() OVER (PARTITION BY c.segment ORDER BY a.balance) AS rn and COUNT(*) OVER (PARTITION BY c.segment) AS cnt. Outer: WHERE rn IN ((cnt+1)/2, (cnt+2)/2), GROUP BY segment, SELECT ROUND(AVG(balance),2) AS median_balance.',
    seedQuery: `WITH ranked AS (
  SELECT c.segment,
         a.balance,
         ROW_NUMBER() OVER (PARTITION BY c.segment ORDER BY a.balance) AS rn,
         COUNT(*)     OVER (PARTITION BY c.segment)                    AS cnt
    FROM accounts a
    JOIN customers c ON a.customer_id = c.customer_id
)
SELECT segment,
        AS median_balance
  FROM ranked
 WHERE rn IN (     ,     )
 GROUP BY segment
 ORDER BY median_balance DESC`,
    solutionQuery: `WITH ranked AS (
  SELECT c.segment,
         a.balance,
         ROW_NUMBER() OVER (PARTITION BY c.segment ORDER BY a.balance) AS rn,
         COUNT(*)     OVER (PARTITION BY c.segment)                    AS cnt
    FROM accounts a
    JOIN customers c ON a.customer_id = c.customer_id
)
SELECT segment,
       ROUND(AVG(balance), 2) AS median_balance
  FROM ranked
 WHERE rn IN ((cnt + 1) / 2, (cnt + 2) / 2)
 GROUP BY segment
 ORDER BY median_balance DESC`,
    epoch: 'Expert',
    difficulty: 4,
  },

  // ============================================================
  // SENIOR DS PATTERNS (Levels 62–63)
  // Conditional aggregation pivot; rolling population std-dev
  // ============================================================

  {
    id: 62,
    title: 'Monthly Payment Channel Mix (Pivot)',
    description: `The Digital Banking team wants to track the monthly transaction count per payment channel — a pivot table that reveals the shift from branch and ATM to digital channels.

Use conditional aggregation: for each month, count how many transactions used each of five key channels: PayNow, FAST, GIRO, Card, and ATM.

Return \`month\` (YYYY-MM), \`paynow\`, \`fast\`, \`giro\`, \`card\`, and \`atm\` (all as integers), ordered by \`month\`.

This is the canonical SQL pivot pattern — used in virtually every product-analytics and finance-ops context. No PIVOT keyword exists in SQLite; you achieve it with \`COUNT(CASE WHEN channel = '...' THEN 1 END)\` inside a GROUP BY.`,
    hint: 'Use COUNT(CASE WHEN channel = \'PayNow\' THEN 1 END) AS paynow (and similar) inside GROUP BY STRFTIME(\'%Y-%m\', transaction_date).',
    seedQuery: `SELECT STRFTIME('%Y-%m', transaction_date) AS month,
       COUNT(CASE WHEN channel =        THEN 1 END) AS paynow,
       COUNT(CASE WHEN channel =        THEN 1 END) AS fast,
       COUNT(CASE WHEN channel =        THEN 1 END) AS giro,
       COUNT(CASE WHEN channel =        THEN 1 END) AS card,
       COUNT(CASE WHEN channel =        THEN 1 END) AS atm
  FROM transactions
 GROUP BY
 ORDER BY month`,
    solutionQuery: `SELECT STRFTIME('%Y-%m', transaction_date)            AS month,
       COUNT(CASE WHEN channel = 'PayNow' THEN 1 END) AS paynow,
       COUNT(CASE WHEN channel = 'FAST'   THEN 1 END) AS fast,
       COUNT(CASE WHEN channel = 'GIRO'   THEN 1 END) AS giro,
       COUNT(CASE WHEN channel = 'Card'   THEN 1 END) AS card,
       COUNT(CASE WHEN channel = 'ATM'    THEN 1 END) AS atm
  FROM transactions
 GROUP BY STRFTIME('%Y-%m', transaction_date)
 ORDER BY month`,
    epoch: 'Expert',
    difficulty: 4,
  },

  {
    id: 63,
    title: 'Cargo Revenue Rolling 3-Month Volatility',
    description: `Risk Management wants to quantify how much monthly cargo revenue varies over rolling 3-month windows — a measure of freight-market volatility that informs hedging decisions.

Since SQLite lacks a built-in STDDEV function, implement population standard deviation using the algebraic identity:

  σ = SQRT( AVG(x²) − AVG(x)² )

Use a CTE to aggregate total monthly cargo revenue (in USD millions, 2dp). In the outer query, apply this formula over a \`ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\` window to produce both a 3-month moving average and a 3-month rolling volatility.

Return \`month\`, \`revenue_musd\`, \`moving_avg\` (2dp), and \`rolling_3m_vol\` (2dp, population std dev), ordered by \`month\`.

This algebraic variance identity is the standard approach whenever a dialect lacks STDDEV — used in Spark SQL, BigQuery legacy SQL, and SQLite-backed analytics workloads.`,
    hint: 'CTE: GROUP BY STRFTIME(\'%Y-%m\', departure_date), SUM(cargo_value_usd)/1e6. Outer: AVG(rev) OVER w for moving_avg; ROUND(SQRT(AVG(rev*rev) OVER w - AVG(rev) OVER w * AVG(rev) OVER w), 2) for rolling_3m_vol. Window: ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW.',
    seedQuery: `WITH monthly AS (
  SELECT STRFTIME('%Y-%m', departure_date)         AS month,
         ROUND(SUM(cargo_value_usd) / 1000000.0, 2) AS revenue_musd
    FROM cargo_shipments
   GROUP BY STRFTIME('%Y-%m', departure_date)
)
SELECT month,
       revenue_musd,
       ROUND(AVG(revenue_musd) OVER (
         ORDER BY month ROWS BETWEEN     PRECEDING AND CURRENT ROW
       ), 2) AS moving_avg,
       ROUND(SQRT(
         AVG(revenue_musd * revenue_musd) OVER (ORDER BY month ROWS BETWEEN     PRECEDING AND CURRENT ROW) -
         AVG(revenue_musd) OVER (ORDER BY month ROWS BETWEEN     PRECEDING AND CURRENT ROW) *
         AVG(revenue_musd) OVER (ORDER BY month ROWS BETWEEN     PRECEDING AND CURRENT ROW)
       ), 2) AS rolling_3m_vol
  FROM monthly
 ORDER BY month`,
    solutionQuery: `WITH monthly AS (
  SELECT STRFTIME('%Y-%m', departure_date)              AS month,
         ROUND(SUM(cargo_value_usd) / 1000000.0, 2)    AS revenue_musd
    FROM cargo_shipments
   GROUP BY STRFTIME('%Y-%m', departure_date)
)
SELECT month,
       revenue_musd,
       ROUND(AVG(revenue_musd) OVER (
         ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
       ), 2) AS moving_avg,
       ROUND(SQRT(
         AVG(revenue_musd * revenue_musd) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) -
         AVG(revenue_musd) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) *
         AVG(revenue_musd) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)
       ), 2) AS rolling_3m_vol
  FROM monthly
 ORDER BY month`,
    epoch: 'Expert',
    difficulty: 4,
  },

  // ============================================================
  // SENIOR DS PATTERNS (Levels 64–65)
  // NTILE portfolio tranching; running cumulative cash-flow balance
  // ============================================================

  {
    id: 64,
    title: 'Loan Book Risk Tranching (NTILE)',
    description: `LCB's Credit Risk team must divide the loan portfolio into four equal-sized tranches by principal exposure — a regulatory requirement for capital adequacy reporting (Basel III / MAS Notice 637).

Use \`NTILE(4) OVER (ORDER BY principal_amount DESC)\` in a CTE to assign each loan to a tranche (1 = largest exposure, 4 = smallest). In the outer query, aggregate per tranche:

- \`loan_count\` — number of loans in the tranche
- \`avg_principal\` — average principal, rounded to the nearest dollar
- \`avg_rate_pct\` — average interest rate, rounded to 2 dp
- \`total_exposure\` — sum of principal, rounded to the nearest dollar
- \`default_count\` — number of loans with status \`'Default'\`

Order by \`tranche\`.

This NTILE bucketing pattern is the standard approach for portfolio segmentation at sovereign wealth funds, investment banks, and insurance firms — used whenever you need equal-count bins rather than equal-width intervals.`,
    hint: "CTE: SELECT loan_id, principal_amount, interest_rate, status, NTILE(4) OVER (ORDER BY principal_amount DESC) AS tranche FROM loans. Outer: GROUP BY tranche, use ROUND(AVG(...), 0) for principal, ROUND(AVG(...), 2) for rate, SUM(CASE WHEN status='Default' THEN 1 ELSE 0 END) for default_count.",
    seedQuery: `WITH tranches AS (
  SELECT loan_id,
         principal_amount,
         interest_rate,
         status,
         NTILE( ) OVER (ORDER BY principal_amount DESC) AS tranche
    FROM loans
)
SELECT tranche,
       COUNT(*)                                              AS loan_count,
       ROUND(AVG(principal_amount), 0)                      AS avg_principal,
       ROUND(AVG(interest_rate), 2)                         AS avg_rate_pct,
       ROUND(SUM(principal_amount), 0)                      AS total_exposure,
       SUM(CASE WHEN status =         THEN 1 ELSE 0 END)    AS default_count
  FROM tranches
 GROUP BY
 ORDER BY tranche`,
    solutionQuery: `WITH tranches AS (
  SELECT loan_id,
         principal_amount,
         interest_rate,
         status,
         NTILE(4) OVER (ORDER BY principal_amount DESC) AS tranche
    FROM loans
)
SELECT tranche,
       COUNT(*)                                                    AS loan_count,
       ROUND(AVG(principal_amount), 0)                            AS avg_principal,
       ROUND(AVG(interest_rate), 2)                               AS avg_rate_pct,
       ROUND(SUM(principal_amount), 0)                            AS total_exposure,
       SUM(CASE WHEN status = 'Default' THEN 1 ELSE 0 END)        AS default_count
  FROM tranches
 GROUP BY tranche
 ORDER BY tranche`,
    epoch: 'Expert',
    difficulty: 4,
  },

  {
    id: 65,
    title: 'Monthly Portfolio Cash Flow & Running Balance',
    description: `The Treasury desk needs a daily liquidity dashboard. As a first step, produce a month-by-month cash-flow summary across all accounts, plus a **running net balance** — the cumulative sum of monthly net flows from January through June 2024.

Use a CTE to aggregate per month:
- \`total_credits\` — sum of all Credit transactions (2 dp)
- \`total_debits\` — sum of all Debit transactions (2 dp)
- \`net_flow\` — credits minus debits (2 dp)

In the outer query, add:
- \`running_net_balance\` — cumulative \`net_flow\` from the start of the period to the current month, using \`SUM(net_flow) OVER (ORDER BY month ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)\`, rounded to 2 dp

Return all six months ordered by \`month\`.

Running totals with \`SUM() OVER (ROWS UNBOUNDED PRECEDING)\` underpin every treasury ledger, account statement, and real-time P&L feed at banks, fintechs, and trading desks. The explicit frame is required for deterministic ordering in any dialect.`,
    hint: "CTE: GROUP BY STRFTIME('%Y-%m', transaction_date), SUM CASE WHEN transaction_type = 'Credit' / 'Debit'. Outer: ROUND(SUM(net_flow) OVER (ORDER BY month ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS running_net_balance.",
    seedQuery: `WITH monthly_flows AS (
  SELECT STRFTIME('%Y-%m', transaction_date)                                         AS month,
         ROUND(SUM(CASE WHEN transaction_type =        THEN amount ELSE 0 END), 2)   AS total_credits,
         ROUND(SUM(CASE WHEN transaction_type =        THEN amount ELSE 0 END), 2)   AS total_debits,
         ROUND(SUM(CASE WHEN transaction_type = 'Credit' THEN amount ELSE -amount END), 2) AS net_flow
    FROM transactions
   GROUP BY month
)
SELECT month,
       total_credits,
       total_debits,
       net_flow,
       ROUND(SUM(net_flow) OVER (ORDER BY month ROWS BETWEEN            AND CURRENT ROW), 2)
         AS running_net_balance
  FROM monthly_flows
 ORDER BY month`,
    solutionQuery: `WITH monthly_flows AS (
  SELECT STRFTIME('%Y-%m', transaction_date)                                              AS month,
         ROUND(SUM(CASE WHEN transaction_type = 'Credit' THEN amount ELSE 0 END), 2)     AS total_credits,
         ROUND(SUM(CASE WHEN transaction_type = 'Debit'  THEN amount ELSE 0 END), 2)     AS total_debits,
         ROUND(SUM(CASE WHEN transaction_type = 'Credit' THEN amount ELSE -amount END), 2) AS net_flow
    FROM transactions
   GROUP BY month
)
SELECT month,
       total_credits,
       total_debits,
       net_flow,
       ROUND(SUM(net_flow) OVER (ORDER BY month ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2)
         AS running_net_balance
  FROM monthly_flows
 ORDER BY month`,
    epoch: 'Expert',
    difficulty: 4,
  },

  // ============================================================
  // ANTI-JOIN PATTERNS (Levels 66–67)
  // LEFT JOIN … IS NULL; correlated NOT EXISTS
  // ============================================================

  {
    id: 66,
    title: 'Unfinanced Fleet Exposure (Anti-Join)',
    description: `Trade Finance Compliance has flagged a gap: some vessels moving cargo through our network have **no trade finance facility on file** — no Letter of Credit, no Shipping Guarantee, nothing. Every one of them is uncollateralised operational risk.

Find every vessel with no row in \`trade_finance_facilities\`. Return \`vessel_name\`, \`vessel_type\`, \`flag_state\`, and \`dwt_tonnes\`, ordered by \`dwt_tonnes\` descending (largest exposure first).

Use the **anti-join** pattern: \`LEFT JOIN\` the facilities table, then keep only the rows where the join found no match — \`WHERE f.facility_id IS NULL\`. Test a column that can never be NULL in a real match (the primary key is the safe choice): if it's NULL after a LEFT JOIN, the match doesn't exist.

"Find the rows in A with no match in B" is one of the most common interview questions there is — customers with no orders, users with no logins, products never sold. This LEFT JOIN form is the classic answer.`,
    hint: "LEFT JOIN trade_finance_facilities f ON f.vessel_id = v.vessel_id, then WHERE f.facility_id IS NULL. The NULL test must be on the right-hand (facilities) table — that's what marks an unmatched row.",
    seedQuery: `SELECT v.vessel_name,
       v.vessel_type,
       v.flag_state,
       v.dwt_tonnes
  FROM vessels v
  LEFT JOIN trade_finance_facilities f ON
 WHERE f.facility_id IS
 ORDER BY v.dwt_tonnes DESC`,
    solutionQuery: `SELECT v.vessel_name,
       v.vessel_type,
       v.flag_state,
       v.dwt_tonnes
  FROM vessels v
  LEFT JOIN trade_finance_facilities f ON f.vessel_id = v.vessel_id
 WHERE f.facility_id IS NULL
 ORDER BY v.dwt_tonnes DESC`,
    epoch: 'Expert',
    difficulty: 3,
  },

  {
    id: 67,
    title: 'Lending Whitespace: Depositors Without Loans (NOT EXISTS)',
    description: `The Retail Lending desk wants a cross-sell target list: customers who keep deposits with LCB but have **never taken a loan** from us. Their balances tell us they trust the bank — the lending relationship is pure whitespace.

Find every customer who holds at least one account but has no row in \`loans\`. Return \`customer_name\`, \`segment\`, \`credit_score\`, and \`total_deposits\` — the sum of their account balances, rounded to 2 dp — ordered by \`total_deposits\` descending.

Use a correlated \`NOT EXISTS\` subquery: \`WHERE NOT EXISTS (SELECT 1 FROM loans l WHERE l.customer_id = c.customer_id)\`. The inner JOIN to \`accounts\` already restricts the list to account holders, so the aggregation and the anti-join compose in one pass.

Prefer \`NOT EXISTS\` over \`NOT IN\` for anti-joins: if the \`NOT IN\` subquery ever returns a NULL, the whole predicate goes unknown and you silently get **zero rows** — a classic production bug. \`NOT EXISTS\` has no such trap, and optimisers handle it well.`,
    hint: "JOIN accounts for the deposit sum, GROUP BY the customer, and add WHERE NOT EXISTS (SELECT 1 FROM loans l WHERE l.customer_id = c.customer_id). The subquery is correlated — it references the outer customer row.",
    seedQuery: `SELECT c.customer_name,
       c.segment,
       c.credit_score,
       ROUND(SUM(a.balance), 2) AS total_deposits
  FROM customers c
  JOIN accounts a ON a.customer_id = c.customer_id
 WHERE NOT EXISTS (
         SELECT 1
           FROM loans l
          WHERE
       )
 GROUP BY
 ORDER BY total_deposits DESC`,
    solutionQuery: `SELECT c.customer_name,
       c.segment,
       c.credit_score,
       ROUND(SUM(a.balance), 2) AS total_deposits
  FROM customers c
  JOIN accounts a ON a.customer_id = c.customer_id
 WHERE NOT EXISTS (
         SELECT 1
           FROM loans l
          WHERE l.customer_id = c.customer_id
       )
 GROUP BY c.customer_id, c.customer_name, c.segment, c.credit_score
 ORDER BY total_deposits DESC`,
    epoch: 'Expert',
    difficulty: 4,
  },

  // ============================================================
  // COHORT RETENTION (Level 68)
  // ============================================================

  {
    id: 68,
    title: 'Portal Onboarding Cohort: Month-1 Retention',
    description: `The Digital Banking squad needs to know how well our onboarding funnel retains new users. Every customer who logs into the portal for the first time in a given month forms a **cohort**. Measure how many returned the following month.

Using the \`portal_logins\` table:
1. A first CTE (\`first_logins\`) finds each customer's earliest login and labels them with their **cohort month** (\`STRFTIME('%Y-%m', MIN(login_at))\`).
2. A second CTE (\`retained\`) finds the \`DISTINCT\` set of customers who logged in during **the month immediately after** their cohort month — use \`DATE(first_login_at, '+1 month')\` to derive the next month and compare it with \`STRFTIME('%Y-%m', pl.login_at)\`.
3. The outer query LEFT JOINs \`first_logins\` to \`retained\` and aggregates per cohort:
   - \`cohort_month\` — the calendar month (YYYY-MM)
   - \`cohort_size\` — total distinct customers whose first login was in that month
   - \`retained_month2\` — how many came back the following month
   - \`retention_rate_pct\` — \`ROUND(100.0 * retained_month2 / cohort_size, 1)\`

Order by \`cohort_month\`.

Cohort retention is the first metric every Head of Growth asks for and a fixture in FAANG and fintech DS interviews. This exact three-CTE pattern (cohort definition → activity join → aggregation) appears in Stripe, Revolut, and DBS DS take-home tests.`,
    hint: "CTE 1: SELECT customer_id, MIN(login_at) AS first_login_at, STRFTIME('%Y-%m', MIN(login_at)) AS cohort_month FROM portal_logins GROUP BY customer_id. CTE 2: DISTINCT customer_ids where STRFTIME('%Y-%m', pl.login_at) = STRFTIME('%Y-%m', DATE(fl.first_login_at, '+1 month')). Outer: LEFT JOIN + COUNT DISTINCT + ROUND.",
    seedQuery: `WITH first_logins AS (
  SELECT customer_id,
         MIN(login_at)                         AS first_login_at,
         STRFTIME('%Y-%m', MIN(login_at))      AS cohort_month
    FROM portal_logins
   GROUP BY customer_id
),
retained AS (
  SELECT DISTINCT fl.customer_id
    FROM first_logins fl
    JOIN portal_logins pl ON pl.customer_id = fl.customer_id
   WHERE STRFTIME('%Y-%m', pl.login_at) = STRFTIME('%Y-%m', DATE(fl.first_login_at,     ))
)
SELECT fl.cohort_month,
       COUNT(DISTINCT fl.customer_id)                                                      AS cohort_size,
       COUNT(DISTINCT r.customer_id)                                                       AS retained_month2,
       ROUND(100.0 * COUNT(DISTINCT r.customer_id) / COUNT(DISTINCT fl.customer_id), 1)   AS retention_rate_pct
  FROM first_logins fl
  LEFT JOIN retained r ON r.customer_id = fl.customer_id
 GROUP BY
 ORDER BY fl.cohort_month`,
    solutionQuery: `WITH first_logins AS (
  SELECT customer_id,
         MIN(login_at)                         AS first_login_at,
         STRFTIME('%Y-%m', MIN(login_at))      AS cohort_month
    FROM portal_logins
   GROUP BY customer_id
),
retained AS (
  SELECT DISTINCT fl.customer_id
    FROM first_logins fl
    JOIN portal_logins pl ON pl.customer_id = fl.customer_id
   WHERE STRFTIME('%Y-%m', pl.login_at) = STRFTIME('%Y-%m', DATE(fl.first_login_at, '+1 month'))
)
SELECT fl.cohort_month,
       COUNT(DISTINCT fl.customer_id)                                                      AS cohort_size,
       COUNT(DISTINCT r.customer_id)                                                       AS retained_month2,
       ROUND(100.0 * COUNT(DISTINCT r.customer_id) / COUNT(DISTINCT fl.customer_id), 1)   AS retention_rate_pct
  FROM first_logins fl
  LEFT JOIN retained r ON r.customer_id = fl.customer_id
 GROUP BY fl.cohort_month
 ORDER BY fl.cohort_month`,
    epoch: 'Expert',
    difficulty: 4,
  },

  {
    id: 69,
    title: 'Portal Session Reconstruction (Gaps & Islands)',
    description: `The UX Insights team needs to understand how deeply customers engage during each visit. A **session** is a continuous run of logins by the same customer where each consecutive login arrives within **30 minutes** of the previous one. A gap larger than 30 minutes — or the customer's very first login — marks the start of a new session.

Using \`portal_logins\`, reconstruct sessions and return per-customer session statistics:
- \`customer_id\`
- \`total_sessions\` — count of distinct sessions
- \`longest_session_mins\` — duration in whole minutes of the longest session (start → last login in that session)

The four-CTE approach:
1. **\`lag_applied\`**: use \`LAG(login_at) OVER (PARTITION BY customer_id ORDER BY login_at)\` to fetch each row's previous login timestamp.
2. **\`session_flags\`**: \`CASE WHEN prev_login_at IS NULL OR (JULIANDAY(login_at) - JULIANDAY(prev_login_at)) * 24 * 60 > 30 THEN 1 ELSE 0 END AS is_new_session\`.
3. **\`sessions_numbered\`**: \`SUM(is_new_session) OVER (PARTITION BY customer_id ORDER BY login_at)\` gives each row a stable session ID within the customer.
4. **\`session_stats\`**: GROUP BY customer_id + session_id → compute \`CAST(ROUND((JULIANDAY(MAX(login_at)) - JULIANDAY(MIN(login_at))) * 24 * 60) AS INTEGER) AS duration_mins\`.

Outer query: COUNT sessions and MAX duration per customer, ORDER BY \`customer_id\`.

Sessionization is the canonical "gaps and islands" interview question at FAANG, fintech, and product-analytics roles. The four-CTE pattern — LAG → flag → cumsum → aggregate — works identically in BigQuery, Redshift, Snowflake, Spark SQL, and SQLite.`,
    hint: "CTE 1: LAG(login_at) OVER (PARTITION BY customer_id ORDER BY login_at). CTE 2: CASE WHEN prev IS NULL OR (JULIANDAY(login_at)-JULIANDAY(prev))*24*60 > 30 THEN 1 ELSE 0 END. CTE 3: SUM(is_new_session) OVER (...) AS session_id. CTE 4: GROUP BY customer_id, session_id → CAST(ROUND(duration_mins) AS INTEGER). Final: COUNT + MAX per customer.",
    seedQuery: `WITH lag_applied AS (
  SELECT customer_id,
         login_at,
         LAG(login_at) OVER (PARTITION BY customer_id ORDER BY login_at) AS prev_login_at
    FROM portal_logins
),
session_flags AS (
  SELECT customer_id,
         login_at,
         CASE
           WHEN prev_login_at IS NULL
             OR (JULIANDAY(login_at) - JULIANDAY(prev_login_at)) * 24 * 60 >
           THEN 1
           ELSE 0
         END AS is_new_session
    FROM lag_applied
),
sessions_numbered AS (
  SELECT customer_id,
         login_at,
         SUM(is_new_session) OVER (PARTITION BY customer_id ORDER BY login_at) AS session_id
    FROM session_flags
),
session_stats AS (
  SELECT customer_id,
         session_id,
         CAST(ROUND((JULIANDAY(MAX(login_at)) - JULIANDAY(MIN(login_at))) * 24 * 60) AS INTEGER) AS duration_mins
    FROM sessions_numbered
   GROUP BY customer_id, session_id
)
SELECT customer_id,
       COUNT(session_id)  AS total_sessions,
       MAX(duration_mins) AS longest_session_mins
  FROM session_stats
 GROUP BY
 ORDER BY customer_id`,
    solutionQuery: `WITH lag_applied AS (
  SELECT customer_id,
         login_at,
         LAG(login_at) OVER (PARTITION BY customer_id ORDER BY login_at) AS prev_login_at
    FROM portal_logins
),
session_flags AS (
  SELECT customer_id,
         login_at,
         CASE
           WHEN prev_login_at IS NULL
             OR (JULIANDAY(login_at) - JULIANDAY(prev_login_at)) * 24 * 60 > 30
           THEN 1
           ELSE 0
         END AS is_new_session
    FROM lag_applied
),
sessions_numbered AS (
  SELECT customer_id,
         login_at,
         SUM(is_new_session) OVER (PARTITION BY customer_id ORDER BY login_at) AS session_id
    FROM session_flags
),
session_stats AS (
  SELECT customer_id,
         session_id,
         CAST(ROUND((JULIANDAY(MAX(login_at)) - JULIANDAY(MIN(login_at))) * 24 * 60) AS INTEGER) AS duration_mins
    FROM sessions_numbered
   GROUP BY customer_id, session_id
)
SELECT customer_id,
       COUNT(session_id)  AS total_sessions,
       MAX(duration_mins) AS longest_session_mins
  FROM session_stats
 GROUP BY customer_id
 ORDER BY customer_id`,
    epoch: 'Expert',
    difficulty: 5,
  },

  // ============================================================
  // RISK SCORECARD & YoY GROWTH (Levels 70–71)
  // ============================================================

  {
    id: 70,
    title: 'Loan Book Risk Scorecard — Weighted Rate & Running Exposure',
    description: `The Risk Management division needs a capital adequacy scorecard for the active loan portfolio, grouped by risk grade. Compute for each grade:
- \`risk_grade\`
- \`loan_count\` — number of active loans
- \`total_principal\` — sum of original principals
- \`wa_rate_pct\` — **weighted-average** interest rate (weighted by principal), ROUND to 2 dp — use \`ROUND(SUM(principal_amount * interest_rate) / SUM(principal_amount), 2)\`
- \`portfolio_pct\` — this grade's share of total active principal, ROUND to 1 dp
- \`cumulative_exposure\` — running cumulative principal ordered A → C using \`SUM(...) OVER (ORDER BY risk_grade ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)\`

Use **two CTEs**:
1. **\`grade_stats\`**: \`FROM loans WHERE status = 'Active' GROUP BY risk_grade\` — compute loan_count, total_principal, wa_rate_pct.
2. **\`total\`**: \`SELECT SUM(total_principal) AS grand_total FROM grade_stats\` — scalar aggregate for the denominator.

In the final SELECT, \`CROSS JOIN grade_stats g\` with \`total t\`, compute portfolio_pct and the window-function cumulative_exposure. \`ORDER BY risk_grade\`.

This pattern appears in Basel III capital adequacy reports, credit risk dashboards at GIC, JPMorgan, and DBS, and is a staple of senior DS interviews at investment banks and sovereign wealth funds.`,
    hint: 'CTE grade_stats: FROM loans WHERE status = \'Active\' GROUP BY risk_grade → COUNT, SUM(principal_amount), ROUND(SUM(principal_amount * interest_rate)/SUM(principal_amount), 2). CTE total: SELECT SUM(total_principal) AS grand_total FROM grade_stats. Final: CROSS JOIN the two CTEs, ROUND(100.0 * g.total_principal / t.grand_total, 1) AS portfolio_pct, SUM(g.total_principal) OVER (ORDER BY g.risk_grade ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_exposure. ORDER BY risk_grade.',
    seedQuery: `WITH grade_stats AS (
  SELECT risk_grade,
         COUNT(*) AS loan_count,
         SUM(principal_amount) AS total_principal,
         ROUND(SUM(principal_amount * ) / SUM(principal_amount), 2) AS wa_rate_pct
    FROM loans
   WHERE status =
   GROUP BY risk_grade
),
total AS (
  SELECT SUM(total_principal) AS grand_total FROM grade_stats
)
SELECT g.risk_grade,
       g.loan_count,
       g.total_principal,
       g.wa_rate_pct,
       ROUND(100.0 * g.total_principal / t.grand_total, 1) AS portfolio_pct,
       SUM(g.total_principal) OVER (ORDER BY g.risk_grade                          ) AS cumulative_exposure
  FROM grade_stats g
  CROSS JOIN total t
 ORDER BY g.risk_grade`,
    solutionQuery: `WITH grade_stats AS (
  SELECT risk_grade,
         COUNT(*) AS loan_count,
         SUM(principal_amount) AS total_principal,
         ROUND(SUM(principal_amount * interest_rate) / SUM(principal_amount), 2) AS wa_rate_pct
    FROM loans
   WHERE status = 'Active'
   GROUP BY risk_grade
),
total AS (
  SELECT SUM(total_principal) AS grand_total FROM grade_stats
)
SELECT g.risk_grade,
       g.loan_count,
       g.total_principal,
       g.wa_rate_pct,
       ROUND(100.0 * g.total_principal / t.grand_total, 1) AS portfolio_pct,
       SUM(g.total_principal) OVER (ORDER BY g.risk_grade ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_exposure
  FROM grade_stats g
  CROSS JOIN total t
 ORDER BY g.risk_grade`,
    epoch: 'Expert',
    difficulty: 4,
  },

  {
    id: 71,
    title: 'Loan Portfolio Year-over-Year Disbursement Growth',
    description: `Strategy Analytics needs a historical view of LCB's loan origination volume. For **every year** in which loans were originated, compute:
- \`loan_year\` — \`STRFTIME('%Y', start_date)\`
- \`loan_count\` — number of loans originated that year
- \`total_disbursed\` — total principal disbursed
- \`yoy_growth_pct\` — year-over-year change in total_disbursed, ROUND to 1 dp — **NULL for the first year**

Include **all loans** regardless of current status (disbursement is a historical fact).

Use **two CTEs**:
1. **\`yearly\`**: GROUP BY loan_year, aggregate loan_count and total_disbursed.
2. **\`with_lag\`**: add \`LAG(total_disbursed) OVER (ORDER BY loan_year) AS prev_disbursed\` to carry the prior year's total forward.

Outer SELECT:
\`CASE WHEN prev_disbursed IS NULL THEN NULL ELSE ROUND(100.0 * (total_disbursed - prev_disbursed) / prev_disbursed, 1) END AS yoy_growth_pct\`

ORDER BY loan_year.

This is the Year-over-Year growth pattern used in strategic planning decks, investor relations reporting, and loan-book analytics at commercial banks, DBS, and GIC. The \`LAG(...) OVER\` → CASE WHEN NULL combination is the canonical SQL idiom for computing period-over-period changes.`,
    hint: 'CTE yearly: SELECT STRFTIME(\'%Y\', start_date) AS loan_year, COUNT(*) AS loan_count, SUM(principal_amount) AS total_disbursed FROM loans GROUP BY loan_year. CTE with_lag: SELECT *, LAG(total_disbursed) OVER (ORDER BY loan_year) AS prev_disbursed FROM yearly. Outer: CASE WHEN prev_disbursed IS NULL THEN NULL ELSE ROUND(100.0*(total_disbursed-prev_disbursed)/prev_disbursed, 1) END AS yoy_growth_pct. ORDER BY loan_year.',
    seedQuery: `WITH yearly AS (
  SELECT STRFTIME('%Y', start_date) AS loan_year,
         COUNT(*) AS loan_count,
         SUM(principal_amount) AS total_disbursed
    FROM loans
   GROUP BY loan_year
),
with_lag AS (
  SELECT loan_year,
         loan_count,
         total_disbursed,
         LAG(          ) OVER (ORDER BY loan_year) AS prev_disbursed
    FROM yearly
)
SELECT loan_year,
       loan_count,
       total_disbursed,
       CASE
         WHEN prev_disbursed IS     THEN NULL
         ELSE ROUND(100.0 * (total_disbursed - prev_disbursed) /             , 1)
       END AS yoy_growth_pct
  FROM with_lag
 ORDER BY loan_year`,
    solutionQuery: `WITH yearly AS (
  SELECT STRFTIME('%Y', start_date) AS loan_year,
         COUNT(*) AS loan_count,
         SUM(principal_amount) AS total_disbursed
    FROM loans
   GROUP BY loan_year
),
with_lag AS (
  SELECT loan_year,
         loan_count,
         total_disbursed,
         LAG(total_disbursed) OVER (ORDER BY loan_year) AS prev_disbursed
    FROM yearly
)
SELECT loan_year,
       loan_count,
       total_disbursed,
       CASE
         WHEN prev_disbursed IS NULL THEN NULL
         ELSE ROUND(100.0 * (total_disbursed - prev_disbursed) / prev_disbursed, 1)
       END AS yoy_growth_pct
  FROM with_lag
 ORDER BY loan_year`,
    epoch: 'Expert',
    difficulty: 4,
  },

  // ============================================================
  // FUNNEL ANALYSIS & DEDUPLICATION (Levels 72–73)
  // ============================================================

  {
    id: 72,
    title: 'Loan Product Acquisition Funnel',
    description: `Product Strategy needs a multi-stage acquisition funnel showing how many LCB customers progress through each stage of the loan product journey. Build a **vertical funnel** with four stages and a conversion percentage:

| stage | customer_count | conversion_pct |
|---|---|---|
| All Customers | 20 | 100.0 |
| Loan Applicants | 15 | 75.0 |
| Active Loan Holders | 12 | 60.0 |
| Active Home Loan Holders | 5 | 25.0 |

Use **two CTEs**:
1. **\`funnel\`**: a \`UNION ALL\` of four scalar aggregate queries, each tagged with an \`ord\` (1–4) and a \`stage\` label — one row per funnel stage. The four stages:
   - \`ord=1\`: \`COUNT(*) FROM customers\`
   - \`ord=2\`: \`COUNT(DISTINCT customer_id) FROM loans\`
   - \`ord=3\`: \`COUNT(DISTINCT customer_id) FROM loans WHERE status = 'Active'\`
   - \`ord=4\`: \`COUNT(DISTINCT customer_id) FROM loans WHERE status = 'Active' AND product_id = 7\` *(product 7 = HDB Home Loan)*
2. **\`total\`**: \`SELECT customer_count AS total_customers FROM funnel WHERE ord = 1\` — a scalar CTE for the denominator.

Final SELECT: \`CROSS JOIN funnel f\` with \`total t\`, compute \`ROUND(100.0 * f.customer_count / t.total_customers, 1) AS conversion_pct\`. \`ORDER BY f.customer_count DESC\` — the four counts are distinct (20 → 15 → 12 → 5), so descending count order matches funnel stage order.

This UNION ALL + CROSS JOIN scalar CTE pattern is the standard SQL funnel in BigQuery, Redshift, and Snowflake product-analytics pipelines at FAANG, digital banks, and MAS-regulated fintechs.`,
    hint: 'CTE funnel: SELECT 1 AS ord, \'All Customers\' AS stage, COUNT(*) AS customer_count FROM customers UNION ALL SELECT 2, \'Loan Applicants\', COUNT(DISTINCT customer_id) FROM loans UNION ALL ... (stages 3 and 4 add WHERE status=\'Active\' and AND product_id=7). CTE total: SELECT customer_count AS total_customers FROM funnel WHERE ord=1. Final: f.stage, f.customer_count, ROUND(100.0 * f.customer_count / t.total_customers, 1) AS conversion_pct FROM funnel f CROSS JOIN total t ORDER BY f.customer_count DESC.',
    seedQuery: `WITH funnel AS (
  SELECT 1 AS ord, 'All Customers'        AS stage,
         COUNT(*)                          AS customer_count
    FROM customers
  UNION ALL
  SELECT 2, 'Loan Applicants',
         COUNT(DISTINCT               )
    FROM loans
  UNION ALL
  SELECT 3, 'Active Loan Holders',
         COUNT(DISTINCT customer_id)
    FROM loans
   WHERE status =
  UNION ALL
  SELECT 4, 'Active Home Loan Holders',
         COUNT(DISTINCT customer_id)
    FROM loans
   WHERE status = 'Active' AND product_id =
),
total AS (
  SELECT customer_count AS total_customers
    FROM funnel
   WHERE ord = 1
)
SELECT f.stage,
       f.customer_count,
       ROUND(100.0 * f.customer_count /       , 1) AS conversion_pct
  FROM funnel f
  CROSS JOIN total t
 ORDER BY f.customer_count DESC`,
    solutionQuery: `WITH funnel AS (
  SELECT 1 AS ord, 'All Customers'        AS stage,
         COUNT(*)                          AS customer_count
    FROM customers
  UNION ALL
  SELECT 2, 'Loan Applicants',
         COUNT(DISTINCT customer_id)
    FROM loans
  UNION ALL
  SELECT 3, 'Active Loan Holders',
         COUNT(DISTINCT customer_id)
    FROM loans
   WHERE status = 'Active'
  UNION ALL
  SELECT 4, 'Active Home Loan Holders',
         COUNT(DISTINCT customer_id)
    FROM loans
   WHERE status = 'Active' AND product_id = 7
),
total AS (
  SELECT customer_count AS total_customers
    FROM funnel
   WHERE ord = 1
)
SELECT f.stage,
       f.customer_count,
       ROUND(100.0 * f.customer_count / t.total_customers, 1) AS conversion_pct
  FROM funnel f
  CROSS JOIN total t
 ORDER BY f.customer_count DESC`,
    epoch: 'Expert',
    difficulty: 4,
  },

  {
    id: 73,
    title: 'First Salary Credit Per Account (ROW_NUMBER Dedup)',
    description: `The Compliance team needs to verify when each LCB account first received a salary credit — a mandatory check for income-verification under MAS Notice 632. Some accounts have received multiple salary credits over the months; you must return **exactly one row per account**: the earliest one.

Return:
- \`account_id\`
- \`customer_name\`
- \`amount\` — salary of the first credit
- \`first_salary_date\` — \`transaction_date\` of the earliest salary credit

**Pattern: ROW_NUMBER deduplication**

Use a single CTE \`ranked\`:
\`\`\`sql
WITH ranked AS (
  SELECT t.account_id, c.customer_name, t.amount,
         t.transaction_date AS first_salary_date,
         ROW_NUMBER() OVER (
           PARTITION BY t.account_id
           ORDER BY t.transaction_date ASC
         ) AS rn
    FROM transactions t
    JOIN accounts  a ON t.account_id  = a.account_id
    JOIN customers c ON a.customer_id = c.customer_id
   WHERE t.merchant_category = 'Salary Credit'
)
SELECT account_id, customer_name, amount, first_salary_date
  FROM ranked
 WHERE rn = 1
 ORDER BY first_salary_date
\`\`\`

\`PARTITION BY account_id ORDER BY transaction_date ASC\` assigns \`rn = 1\` to the earliest salary transaction per account. \`WHERE rn = 1\` in the outer query selects exactly one row per account — the dedup step.

This ROW_NUMBER PARTITION BY pattern is the universal deduplication and **latest/earliest record per group** technique used across every SQL dialect (BigQuery, Redshift, Snowflake, Spark SQL, PostgreSQL) in ETL pipelines, slowly-changing dimension snapshots, and data-quality remediations at FAANG, hedge funds, and GIC.`,
    hint: 'CTE ranked: SELECT t.account_id, c.customer_name, t.amount, t.transaction_date AS first_salary_date, ROW_NUMBER() OVER (PARTITION BY t.account_id ORDER BY t.transaction_date ASC) AS rn FROM transactions t JOIN accounts a ON t.account_id=a.account_id JOIN customers c ON a.customer_id=c.customer_id WHERE t.merchant_category=\'Salary Credit\'. Outer: SELECT account_id, customer_name, amount, first_salary_date FROM ranked WHERE rn=1 ORDER BY first_salary_date.',
    seedQuery: `WITH ranked AS (
  SELECT
    t.account_id,
    c.customer_name,
    t.amount,
    t.transaction_date                                     AS first_salary_date,
    ROW_NUMBER() OVER (
      PARTITION BY
      ORDER BY t.transaction_date
    ) AS rn
  FROM transactions t
  JOIN accounts   a ON t.account_id = a.account_id
  JOIN customers  c ON a.customer_id = c.customer_id
  WHERE t.merchant_category =
)
SELECT account_id, customer_name, amount, first_salary_date
  FROM ranked
 WHERE rn =
 ORDER BY first_salary_date`,
    solutionQuery: `WITH ranked AS (
  SELECT
    t.account_id,
    c.customer_name,
    t.amount,
    t.transaction_date                                     AS first_salary_date,
    ROW_NUMBER() OVER (
      PARTITION BY t.account_id
      ORDER BY t.transaction_date ASC
    ) AS rn
  FROM transactions t
  JOIN accounts   a ON t.account_id = a.account_id
  JOIN customers  c ON a.customer_id = c.customer_id
  WHERE t.merchant_category = 'Salary Credit'
)
SELECT account_id, customer_name, amount, first_salary_date
  FROM ranked
 WHERE rn = 1
 ORDER BY first_salary_date`,
    epoch: 'Expert',
    difficulty: 4,
  },
];

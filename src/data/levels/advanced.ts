import type { Level } from '@/types';

export const advancedLevels: Level[] = [
  {
    id: 31,
    title: 'Running Cumulative Deposits',
    description: `Treasury wants to see the cumulative total of account balances ordered from highest to lowest — a running total window function.

Return \`account_id\`, \`balance\`, and \`running_total\` using SUM() OVER, ordered by balance descending.`,
    hint: 'Use SUM(balance) OVER (ORDER BY balance DESC) as running_total.',
    seedQuery: `SELECT account_id,
       balance,
       SUM(balance) OVER (ORDER BY ) AS running_total
  FROM accounts
 ORDER BY balance DESC`,
    solutionQuery: `SELECT account_id,
       balance,
       SUM(balance) OVER (ORDER BY balance DESC) AS running_total
  FROM accounts
 ORDER BY balance DESC`,
    epoch: 'Advanced',
    difficulty: 3,
  },

  {
    id: 32,
    title: 'Rank Customers Within Segment',
    description: `Private Banking wants to rank customers by balance within each segment to identify the top-ranked client per tier.

Return \`customer_name\`, \`segment\`, \`balance\`, and \`rank_in_segment\` using RANK() OVER PARTITION BY segment, ordered by segment then rank.`,
    hint: 'Use RANK() OVER (PARTITION BY c.segment ORDER BY a.balance DESC).',
    seedQuery: `SELECT
  FROM accounts a
  JOIN customers c ON
 ORDER BY `,
    solutionQuery: `SELECT c.customer_name,
       c.segment,
       a.balance,
       RANK() OVER (
         PARTITION BY c.segment
             ORDER BY a.balance DESC
       ) AS rank_in_segment
  FROM accounts a
  JOIN customers c ON a.customer_id = c.customer_id
 ORDER BY c.segment, rank_in_segment`,
    epoch: 'Advanced',
    difficulty: 3,
  },

  {
    id: 33,
    title: 'Month-over-Month Transaction Growth',
    description: `Finance tracks monthly transaction growth using LAG() to compare each month's volume to the prior month.

Return \`month\`, \`total_amount\`, \`prev_month_amount\`, and \`growth_pct\` (rounded to 2dp), ordered by month.`,
    hint: 'Wrap a GROUP BY subquery, then apply LAG(total_amount) OVER (ORDER BY month) in the outer query.',
    seedQuery: `SELECT month,
       total_amount,
       LAG(total_amount) OVER (ORDER BY month) AS prev_month_amount,
        AS growth_pct
  FROM (
    SELECT  AS month,
             AS total_amount
      FROM transactions
     GROUP BY
  )
 ORDER BY month`,
    solutionQuery: `SELECT month,
       total_amount,
       LAG(total_amount) OVER (ORDER BY month)                                           AS prev_month_amount,
       ROUND(
         (total_amount - LAG(total_amount) OVER (ORDER BY month))
         / LAG(total_amount) OVER (ORDER BY month) * 100
       , 2)                                                                               AS growth_pct
  FROM (
    SELECT strftime('%Y-%m', transaction_date) AS month,
           ROUND(SUM(amount), 2)               AS total_amount
      FROM transactions
     GROUP BY strftime('%Y-%m', transaction_date)
  )
 ORDER BY month`,
    epoch: 'Advanced',
    difficulty: 3,
  },

  {
    id: 34,
    title: 'High-Balance Accounts CTE',
    description: `Using a CTE, first identify all active accounts with a balance above SGD 50,000, then summarise them by customer segment.

Return \`segment\`, \`account_count\`, and \`avg_balance\` (2dp), ordered by avg_balance descending.`,
    hint: 'Define a WITH high_balance AS (...) CTE that filters balance > 50000 and joins customers, then aggregate in the outer query.',
    seedQuery: `WITH high_balance AS (
  SELECT
    FROM accounts a
    JOIN customers c ON
   WHERE
)
SELECT
  FROM high_balance
 GROUP BY
 ORDER BY `,
    solutionQuery: `WITH high_balance AS (
  SELECT a.account_id, a.balance, c.segment
    FROM accounts a
    JOIN customers c ON a.customer_id = c.customer_id
   WHERE a.balance > 50000
     AND a.status = 'Active'
)
SELECT segment,
       COUNT(*)                   AS account_count,
       ROUND(AVG(balance), 2)     AS avg_balance
  FROM high_balance
 GROUP BY segment
 ORDER BY avg_balance DESC`,
    epoch: 'Advanced',
    difficulty: 3,
  },

  {
    id: 35,
    title: 'At-Risk Loan Customers CTE',
    description: `Using a CTE, isolate loans that are in Default or carry a risk grade of D, then return the full customer and loan detail for immediate escalation.

Return \`customer_name\`, \`segment\`, \`principal_amount\`, \`interest_rate\`, \`risk_grade\`, and \`status\`, ordered by principal_amount descending.`,
    hint: 'Build a WITH at_risk AS (...) CTE joining loans and customers, filtering by status = Default OR risk_grade = D.',
    seedQuery: `WITH at_risk AS (
  SELECT
    FROM loans l
    JOIN customers c ON
   WHERE
)
SELECT
  FROM at_risk
 ORDER BY `,
    solutionQuery: `WITH at_risk AS (
  SELECT l.loan_id, l.principal_amount, l.interest_rate, l.risk_grade, l.status,
         c.customer_name, c.segment
    FROM loans l
    JOIN customers c ON l.customer_id = c.customer_id
   WHERE l.status = 'Default'
      OR l.risk_grade = 'D'
)
SELECT customer_name,
       segment,
       principal_amount,
       interest_rate,
       risk_grade,
       status
  FROM at_risk
 ORDER BY principal_amount DESC`,
    epoch: 'Advanced',
    difficulty: 3,
  },

  {
    id: 36,
    title: 'Balance Quartiles with NTILE',
    description: `Wealth segmentation: bucket all active account holders into four equal quartiles by balance using NTILE(4), so the top 25% can be targeted for Private Banking upgrade.

Return \`customer_name\`, \`balance\`, and \`quartile\`, ordered by balance descending.`,
    hint: 'Use NTILE(4) OVER (ORDER BY a.balance DESC) as quartile.',
    seedQuery: `SELECT
  FROM accounts a
  JOIN customers c ON
 WHERE
 ORDER BY `,
    solutionQuery: `SELECT c.customer_name,
       a.balance,
       NTILE(4) OVER (ORDER BY a.balance DESC) AS quartile
  FROM accounts a
  JOIN customers c ON a.customer_id = c.customer_id
 WHERE a.status = 'Active'
 ORDER BY a.balance DESC`,
    epoch: 'Advanced',
    difficulty: 3,
  },

  {
    id: 37,
    title: 'First Transaction per Account',
    description: `Onboarding analytics: find each account's very first transaction using ROW_NUMBER() partitioned by account.

Return \`account_id\`, \`transaction_date\`, \`amount\`, and \`merchant_category\` for only the first transaction per account, ordered by account_id.`,
    hint: 'Assign ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY transaction_date), then filter WHERE rn = 1 in an outer query.',
    seedQuery: `SELECT account_id,
       transaction_date,
       amount,
       merchant_category
  FROM (
    SELECT
           ROW_NUMBER() OVER (
             PARTITION BY
                 ORDER BY
           ) AS rn
      FROM transactions
  )
 WHERE rn = 1
 ORDER BY account_id`,
    solutionQuery: `SELECT account_id,
       transaction_date,
       amount,
       merchant_category
  FROM (
    SELECT account_id,
           transaction_date,
           amount,
           merchant_category,
           ROW_NUMBER() OVER (
             PARTITION BY account_id
                 ORDER BY transaction_date
           ) AS rn
      FROM transactions
  )
 WHERE rn = 1
 ORDER BY account_id`,
    epoch: 'Advanced',
    difficulty: 3,
  },

  {
    id: 38,
    title: 'Account Age in Days',
    description: `Retention analysis: calculate how many days each active account has been open as of 30 Jun 2024, to identify long-tenured customers for loyalty rewards.

Return \`account_id\`, \`customer_name\`, \`opened_date\`, and \`days_open\`, ordered by days_open descending.`,
    hint: 'Use CAST(julianday(\'2024-06-30\') - julianday(opened_date) AS INTEGER) AS days_open.',
    seedQuery: `SELECT
  FROM accounts a
  JOIN customers c ON
 ORDER BY `,
    solutionQuery: `SELECT a.account_id,
       c.customer_name,
       a.opened_date,
       CAST(julianday('2024-06-30') - julianday(a.opened_date) AS INTEGER) AS days_open
  FROM accounts a
  JOIN customers c ON a.customer_id = c.customer_id
 ORDER BY days_open DESC`,
    epoch: 'Advanced',
    difficulty: 3,
  },

  {
    id: 39,
    title: 'Transactions Above Personal Average',
    description: `Fraud pre-screening: flag transactions where the amount exceeds that customer's own average transaction value — an early signal of unusual activity.

Return \`transaction_id\`, \`customer_name\`, \`amount\`, and \`merchant_category\` for such transactions, ordered by amount descending. Limit 20 rows.`,
    hint: 'Use a correlated subquery in the WHERE clause: WHERE t.amount > (SELECT AVG(...) WHERE account belongs to same customer).',
    seedQuery: `SELECT
  FROM transactions t
  JOIN accounts a  ON
  JOIN customers c ON
 WHERE t.amount > (
   SELECT
     FROM transactions t2
     JOIN accounts a2 ON
    WHERE
 )
 ORDER BY
 LIMIT 20`,
    solutionQuery: `SELECT t.transaction_id,
       c.customer_name,
       t.amount,
       t.merchant_category
  FROM transactions t
  JOIN accounts a  ON t.account_id  = a.account_id
  JOIN customers c ON a.customer_id = c.customer_id
 WHERE t.amount > (
   SELECT AVG(t2.amount)
     FROM transactions t2
     JOIN accounts a2 ON t2.account_id = a2.account_id
    WHERE a2.customer_id = a.customer_id
 )
 ORDER BY t.amount DESC
 LIMIT 20`,
    epoch: 'Advanced',
    difficulty: 3,
  },

  {
    id: 40,
    title: 'Investment Cross-Sell Targets',
    description: `Cross-sell opportunity: identify customers who hold an active account but have never opened an Investment-type product — prime targets for the LCB CPF / Wealth Management pitch.

Return \`customer_name\`, \`segment\`, and \`credit_score\`, ordered by credit_score descending.`,
    hint: 'Use NOT IN with a subquery that finds customer_ids who have an Investment product in their accounts.',
    seedQuery: `SELECT
  FROM customers c
 WHERE c.customer_id NOT IN (
   SELECT
     FROM accounts a
     JOIN products p ON
    WHERE
 )
 ORDER BY `,
    solutionQuery: `SELECT c.customer_name,
       c.segment,
       c.credit_score
  FROM customers c
 WHERE c.customer_id NOT IN (
   SELECT DISTINCT a.customer_id
     FROM accounts a
     JOIN products p ON a.product_id = p.product_id
    WHERE p.product_type = 'Investment'
 )
 ORDER BY c.credit_score DESC`,
    epoch: 'Advanced',
    difficulty: 3,
  },

  // ============================================================
  // MARITIME TRADE FINANCE INTRO (Levels 41–44)
  // New tables: vessels, cargo_shipments, trade_finance_facilities
  // Introductory difficulty before Expert-tier maritime analytics
  // ============================================================

  {
    id: 41,
    title: 'LCB Fleet Registry',
    description: `LCB's Trade Finance division finances a fleet of merchant vessels. The shipping desk needs the complete vessel registry sorted by cargo capacity.

Return \`vessel_name\`, \`vessel_type\`, \`flag_state\`, and \`dwt_tonnes\` from the \`vessels\` table, ordered by \`dwt_tonnes\` descending.`,
    hint: 'SELECT four columns FROM vessels ORDER BY dwt_tonnes DESC.',
    seedQuery: `SELECT
  FROM vessels
 ORDER BY `,
    solutionQuery: `SELECT vessel_name,
       vessel_type,
       flag_state,
       dwt_tonnes
  FROM vessels
 ORDER BY dwt_tonnes DESC`,
    epoch: 'Advanced',
    difficulty: 2,
  },

  {
    id: 42,
    title: 'Delayed Cargo Alert',
    description: `Operations Control has flagged all shipments currently showing a \`Delayed\` status — the bank needs to assess cargo insurance exposure immediately.

Return \`shipment_id\`, \`vessel_name\`, \`origin_port\`, \`destination_port\`, and \`cargo_value_usd\` for delayed shipments, ordered by \`cargo_value_usd\` descending.`,
    hint: 'JOIN cargo_shipments to vessels on vessel_id, filter WHERE status = Delayed.',
    seedQuery: `SELECT
  FROM cargo_shipments s
  JOIN vessels v ON
 WHERE
 ORDER BY `,
    solutionQuery: `SELECT s.shipment_id,
       v.vessel_name,
       s.origin_port,
       s.destination_port,
       s.cargo_value_usd
  FROM cargo_shipments s
  JOIN vessels v ON s.vessel_id = v.vessel_id
 WHERE s.status = 'Delayed'
 ORDER BY s.cargo_value_usd DESC`,
    epoch: 'Advanced',
    difficulty: 2,
  },

  {
    id: 43,
    title: 'Trade Finance Utilisation Rate',
    description: `Risk Management monitors how much of each customer's active trade finance facilities are drawn down. High utilisation (>85%) signals liquidity pressure.

Using a CTE, aggregate active \`trade_finance_facilities\` per customer. Return \`customer_name\`, \`segment\`, \`facility_count\`, \`total_facility\`, \`total_utilised\`, and \`utilisation_pct\` (1dp), ordered by \`utilisation_pct\` descending.`,
    hint: 'CTE: SUM facility_amount and utilised_amount per customer_id WHERE status = Active. Outer query: JOIN to customers, compute ROUND(utilised*100.0/facility, 1).',
    seedQuery: `WITH facility_summary AS (
  SELECT customer_id,
         COUNT(*)                              AS facility_count,
         ROUND(SUM(facility_amount), 0)        AS total_facility,
         ROUND(SUM(utilised_amount), 0)        AS total_utilised,
          AS utilisation_pct
    FROM trade_finance_facilities
   WHERE
   GROUP BY customer_id
)
SELECT
  FROM facility_summary fs
  JOIN customers c ON
 ORDER BY `,
    solutionQuery: `WITH facility_summary AS (
  SELECT customer_id,
         COUNT(*)                                              AS facility_count,
         ROUND(SUM(facility_amount), 0)                       AS total_facility,
         ROUND(SUM(utilised_amount), 0)                       AS total_utilised,
         ROUND(SUM(utilised_amount) * 100.0 / SUM(facility_amount), 1) AS utilisation_pct
    FROM trade_finance_facilities
   WHERE status = 'Active'
   GROUP BY customer_id
)
SELECT c.customer_name,
       c.segment,
       fs.facility_count,
       fs.total_facility,
       fs.total_utilised,
       fs.utilisation_pct
  FROM facility_summary fs
  JOIN customers c ON fs.customer_id = c.customer_id
 ORDER BY fs.utilisation_pct DESC`,
    epoch: 'Advanced',
    difficulty: 3,
  },

  {
    id: 44,
    title: 'Vessel Cargo Revenue Ranking',
    description: `The Fleet Analytics team wants each vessel ranked by total cargo value within its vessel type — to identify the highest-earning ship per category.

Use a CTE to compute per-vessel stats, then apply \`RANK() OVER (PARTITION BY vessel_type ORDER BY total_cargo_value DESC)\`.

Return \`vessel_name\`, \`vessel_type\`, \`shipment_count\`, \`total_cargo_value\`, and \`rank_in_type\`, ordered by \`vessel_type\` then \`rank_in_type\`.`,
    hint: 'CTE: JOIN vessels to cargo_shipments, GROUP BY vessel, SUM cargo_value_usd. Outer query: RANK() OVER (PARTITION BY vessel_type ORDER BY total_cargo_value DESC).',
    seedQuery: `WITH vessel_stats AS (
  SELECT v.vessel_id, v.vessel_name, v.vessel_type,
         COUNT(s.shipment_id)                AS shipment_count,
         ROUND(SUM(s.cargo_value_usd), 0)    AS total_cargo_value
    FROM vessels v
    JOIN cargo_shipments s ON
   GROUP BY
)
SELECT vessel_name, vessel_type, shipment_count, total_cargo_value,
        AS rank_in_type
  FROM vessel_stats
 ORDER BY `,
    solutionQuery: `WITH vessel_stats AS (
  SELECT v.vessel_id, v.vessel_name, v.vessel_type,
         COUNT(s.shipment_id)             AS shipment_count,
         ROUND(SUM(s.cargo_value_usd), 0) AS total_cargo_value
    FROM vessels v
    JOIN cargo_shipments s ON v.vessel_id = s.vessel_id
   GROUP BY v.vessel_id, v.vessel_name, v.vessel_type
)
SELECT vessel_name,
       vessel_type,
       shipment_count,
       total_cargo_value,
       RANK() OVER (
         PARTITION BY vessel_type
             ORDER BY total_cargo_value DESC
       ) AS rank_in_type
  FROM vessel_stats
 ORDER BY vessel_type, rank_in_type`,
    epoch: 'Advanced',
    difficulty: 3,
  },
];

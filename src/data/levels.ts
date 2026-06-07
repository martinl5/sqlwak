import type { Level } from '@/types';

export const levels: Level[] = [
  // ============================================================
  // FOUNDATIONAL (Levels 1–15)
  // Basic SQL: SELECT, WHERE, COUNT, SUM, AVG, LIKE, ORDER BY
  // ============================================================
  {
    id: 1,
    title: 'Priority Banking Customers',
    description: `The Relationship Management team needs a list of all LCB Priority segment customers to prepare for the quarterly review.

Return the \`customer_name\` and \`segment\` for every customer in the \`Priority\` segment.`,
    hint: 'SELECT from customers WHERE segment equals the Priority segment.',
    seedQuery: `SELECT
  FROM customers
 WHERE `,
    solutionQuery: `SELECT customer_name,
       segment
  FROM customers
 WHERE segment = 'Priority'`,
    epoch: 'Foundational',
    difficulty: 1,
  },
  {
    id: 2,
    title: 'Total Customer Count',
    description: `Compliance requires the total number of unique customers registered in the LCB system for the MAS regulatory report.

Return a single value aliased as \`total_customers\`.`,
    hint: 'Use COUNT(DISTINCT customer_id) on the customers table.',
    seedQuery: `SELECT
  FROM customers`,
    solutionQuery: `SELECT COUNT(DISTINCT customer_id) AS total_customers
  FROM customers`,
    epoch: 'Foundational',
    difficulty: 1,
  },
  {
    id: 3,
    title: 'Central Region Branches',
    description: `The Operations team is planning a Central region audit. List all LCB branches located in the \`Central\` region.

Return \`branch_name\` and \`branch_type\`.`,
    hint: 'Filter the branches table WHERE region equals Central.',
    seedQuery: `SELECT
  FROM branches
 WHERE `,
    solutionQuery: `SELECT branch_name,
       branch_type
  FROM branches
 WHERE region = 'Central'`,
    epoch: 'Foundational',
    difficulty: 1,
  },
  {
    id: 4,
    title: 'CNY Period Transactions',
    description: `Risk Management wants to analyse spending patterns during the Chinese New Year festive period in February 2024.

Return \`transaction_id\`, \`transaction_date\`, and \`merchant_category\` for all transactions between 1 Feb and 29 Feb 2024.`,
    hint: 'Use BETWEEN on transaction_date in the transactions table.',
    seedQuery: `SELECT
  FROM transactions
 WHERE `,
    solutionQuery: `SELECT transaction_id,
       transaction_date,
       merchant_category
  FROM transactions
 WHERE transaction_date BETWEEN '2024-02-01' AND '2024-02-29'`,
    epoch: 'Foundational',
    difficulty: 1,
  },
  {
    id: 5,
    title: 'PayNow Transfers',
    description: `The Digital Banking team needs a list of all transactions conducted through the \`PayNow\` channel to measure its adoption.

Return \`transaction_id\`, \`amount\`, and \`transaction_date\`.`,
    hint: 'Filter transactions WHERE channel equals PayNow.',
    seedQuery: `SELECT
  FROM transactions
 WHERE `,
    solutionQuery: `SELECT transaction_id,
       amount,
       transaction_date
  FROM transactions
 WHERE channel = 'PayNow'`,
    epoch: 'Foundational',
    difficulty: 1,
  },
  {
    id: 6,
    title: 'Total Salary Credits',
    description: `Treasury wants the aggregate value of all salary credits flowing into LCB accounts — a key indicator of customer payroll dependency.

Return a single value aliased as \`total_salary_credits\` for all transactions where \`merchant_category\` is \`Salary Credit\`.`,
    hint: 'SUM the amount column filtered by merchant_category = Salary Credit.',
    seedQuery: `SELECT
  FROM transactions
 WHERE `,
    solutionQuery: `SELECT SUM(amount) AS total_salary_credits
  FROM transactions
 WHERE merchant_category = 'Salary Credit'`,
    epoch: 'Foundational',
    difficulty: 1,
  },
  {
    id: 7,
    title: 'Average Customer Credit Score',
    description: `The Credit Risk team needs the mean credit score across all LCB customers to benchmark against MAS guidelines.

Return a single value aliased as \`avg_credit_score\`.`,
    hint: 'Use AVG(credit_score) on the customers table.',
    seedQuery: `SELECT
  FROM customers`,
    solutionQuery: `SELECT AVG(credit_score) AS avg_credit_score
  FROM customers`,
    epoch: 'Foundational',
    difficulty: 1,
  },
  {
    id: 8,
    title: 'Dormant Accounts',
    description: `Operations must identify dormant accounts for the annual account dormancy review process.

Return \`account_id\`, \`customer_id\`, and \`balance\` for all accounts with a status of \`Dormant\`.`,
    hint: 'Filter the accounts table WHERE status equals Dormant.',
    seedQuery: `SELECT
  FROM accounts
 WHERE `,
    solutionQuery: `SELECT account_id,
       customer_id,
       balance
  FROM accounts
 WHERE status = 'Dormant'`,
    epoch: 'Foundational',
    difficulty: 1,
  },
  {
    id: 9,
    title: 'CPF-Linked Products',
    description: `Wealth Management wants to list all products connected to the CPF (Central Provident Fund) investment scheme.

Return \`product_name\`, \`product_type\`, and \`interest_rate\` for all products whose name contains the text \`CPF\`.`,
    hint: 'Use a LIKE filter with % wildcards on product_name.',
    seedQuery: `SELECT
  FROM products
 WHERE `,
    solutionQuery: `SELECT product_name,
       product_type,
       interest_rate
  FROM products
 WHERE product_name LIKE '%CPF%'`,
    epoch: 'Foundational',
    difficulty: 1,
  },
  {
    id: 10,
    title: 'Home Loan Products',
    description: `The Mortgage desk needs a catalogue of all LCB Home Loan products to include in the Q2 product brochure.

Return \`product_name\`, \`product_type\`, and \`interest_rate\` for all products whose name contains \`Home Loan\`.`,
    hint: 'Filter products with a LIKE pattern matching Home Loan in the product_name.',
    seedQuery: `SELECT
  FROM products
 WHERE `,
    solutionQuery: `SELECT product_name,
       product_type,
       interest_rate
  FROM products
 WHERE product_name LIKE '%Home Loan%'`,
    epoch: 'Foundational',
    difficulty: 1,
  },
  {
    id: 11,
    title: 'Accounts Without a Loan',
    description: `Cross-sell targeting: find accounts whose customers do NOT currently hold any loan with LCB. These are candidates for the new home loan campaign.

Return \`account_id\`, \`balance\`, and \`status\` from accounts where the customer has no matching row in loans.`,
    hint: 'Use a LEFT JOIN between accounts and loans on customer_id, then filter WHERE the loan side IS NULL.',
    seedQuery: `SELECT
  FROM accounts a
  LEFT JOIN loans l ON
 WHERE `,
    solutionQuery: `SELECT a.account_id,
       a.balance,
       a.status
  FROM accounts a
  LEFT JOIN loans l ON a.customer_id = l.customer_id
 WHERE l.loan_id IS NULL`,
    epoch: 'Foundational',
    difficulty: 1,
  },
  {
    id: 12,
    title: 'Balances Ranked High to Low',
    description: `Treasury wants a full ranking of all accounts by their current balance to identify the highest-value accounts.

Return \`account_id\`, \`customer_id\`, and \`balance\`, ordered from highest to lowest balance.`,
    hint: 'SELECT from accounts and use ORDER BY balance DESC.',
    seedQuery: `SELECT
  FROM accounts
 ORDER BY `,
    solutionQuery: `SELECT account_id,
       customer_id,
       balance
  FROM accounts
 ORDER BY balance DESC`,
    epoch: 'Foundational',
    difficulty: 1,
  },
  {
    id: 13,
    title: 'Top 5 Wealthiest Accounts',
    description: `Private Banking is preparing personalised relationship outreach for the five highest-value account holders.

Return the top 5 accounts by \`balance\`, showing \`account_id\`, \`customer_id\`, and \`balance\`.`,
    hint: 'Order by balance DESC and use LIMIT 5.',
    seedQuery: `SELECT
  FROM accounts
 ORDER BY
 LIMIT `,
    solutionQuery: `SELECT account_id,
       customer_id,
       balance
  FROM accounts
 ORDER BY balance DESC
 LIMIT 5`,
    epoch: 'Foundational',
    difficulty: 1,
  },
  {
    id: 14,
    title: 'Transaction Count by Channel',
    description: `The Digital team needs a breakdown of transaction volume by payment channel to inform the upcoming channel investment review.

Return \`channel\` and the count as \`transaction_count\`, ordered by count descending.`,
    hint: 'GROUP BY channel and COUNT(*), then ORDER BY the count DESC.',
    seedQuery: `SELECT
  FROM transactions
 GROUP BY
 ORDER BY `,
    solutionQuery: `SELECT channel,
       COUNT(*) AS transaction_count
  FROM transactions
 GROUP BY channel
 ORDER BY transaction_count DESC`,
    epoch: 'Foundational',
    difficulty: 1,
  },
  {
    id: 15,
    title: 'Customer Names on Accounts',
    description: `Relationship Managers need a combined view of customer names alongside their account balances — your first JOIN query at LCB.

Return \`customer_name\`, \`account_id\`, and \`balance\` by joining \`accounts\` with \`customers\`, ordered by balance descending.`,
    hint: 'JOIN accounts and customers on customer_id. Use table aliases a and c.',
    seedQuery: `SELECT
  FROM accounts a
  JOIN customers c ON
 ORDER BY `,
    solutionQuery: `SELECT c.customer_name,
       a.account_id,
       a.balance
  FROM accounts a
  JOIN customers c ON a.customer_id = c.customer_id
 ORDER BY a.balance DESC`,
    epoch: 'Foundational',
    difficulty: 1,
  },

  // ============================================================
  // INTERMEDIATE (Levels 16–30)
  // GROUP BY, HAVING, Subqueries, UNION, CASE WHEN
  // ============================================================
  {
    id: 16,
    title: 'Total Balance per Branch',
    description: `Branch Directors want to know the total deposits held at each LCB branch to inform their performance scorecards.

Return \`branch_name\`, the number of accounts as \`account_count\`, and \`SUM(balance)\` as \`total_balance\`, ordered by total_balance descending.`,
    hint: 'LEFT JOIN branches to accounts on branch_id, then GROUP BY branch_id and branch_name.',
    seedQuery: `SELECT
  FROM branches b
  LEFT JOIN accounts a ON
 GROUP BY
 ORDER BY `,
    solutionQuery: `SELECT b.branch_name,
       COUNT(a.account_id) AS account_count,
       SUM(a.balance)      AS total_balance
  FROM branches b
  LEFT JOIN accounts a ON b.branch_id = a.branch_id
 GROUP BY b.branch_id, b.branch_name
 ORDER BY total_balance DESC`,
    epoch: 'Intermediate',
    difficulty: 2,
  },
  {
    id: 17,
    title: 'Average Balance by Segment',
    description: `Segment analytics: calculate the mean account balance for each customer segment (Mass, Priority, Private, SME).

Return \`segment\` and \`avg_balance\` (rounded to 2dp), ordered by avg_balance descending.`,
    hint: 'JOIN accounts to customers, GROUP BY c.segment, and use AVG(a.balance).',
    seedQuery: `SELECT
  FROM accounts a
  JOIN customers c ON
 GROUP BY
 ORDER BY `,
    solutionQuery: `SELECT c.segment,
       ROUND(AVG(a.balance), 2) AS avg_balance
  FROM accounts a
  JOIN customers c ON a.customer_id = c.customer_id
 GROUP BY c.segment
 ORDER BY avg_balance DESC`,
    epoch: 'Intermediate',
    difficulty: 2,
  },
  {
    id: 18,
    title: 'High-Volume Segments',
    description: `Segments with more than 10 accounts are considered high-volume and receive dedicated service teams. Identify those segments now.

Return \`segment\` and \`account_count\` where the count exceeds 10, ordered by account_count descending.`,
    hint: 'GROUP BY segment with a HAVING COUNT(*) > 10 clause.',
    seedQuery: `SELECT
  FROM accounts a
  JOIN customers c ON
 GROUP BY
HAVING
 ORDER BY `,
    solutionQuery: `SELECT c.segment,
       COUNT(a.account_id) AS account_count
  FROM accounts a
  JOIN customers c ON a.customer_id = c.customer_id
 GROUP BY c.segment
HAVING COUNT(a.account_id) > 10
 ORDER BY account_count DESC`,
    epoch: 'Intermediate',
    difficulty: 2,
  },
  {
    id: 19,
    title: 'Loan Exposure by Risk Grade',
    description: `Credit Risk needs the total loan principal broken down by risk grade (A–E) to calculate the portfolio's weighted risk score.

Return \`risk_grade\`, \`loan_count\`, and \`total_principal\` (rounded to 0dp), ordered by risk_grade.`,
    hint: 'GROUP BY risk_grade on the loans table using COUNT and SUM.',
    seedQuery: `SELECT
  FROM loans
 GROUP BY
 ORDER BY `,
    solutionQuery: `SELECT risk_grade,
       COUNT(*)                      AS loan_count,
       ROUND(SUM(principal_amount), 0) AS total_principal
  FROM loans
 GROUP BY risk_grade
 ORDER BY risk_grade`,
    epoch: 'Intermediate',
    difficulty: 2,
  },
  {
    id: 20,
    title: 'Customers with Multiple Accounts',
    description: `Multi-banking customers (those holding more than one LCB account) are valuable — they have deeper engagement and lower churn.

Return \`customer_name\` and \`account_count\` for customers with more than 1 account, ordered by account_count descending.`,
    hint: 'JOIN customers to accounts, GROUP BY customer, HAVING COUNT > 1.',
    seedQuery: `SELECT
  FROM customers c
  JOIN accounts a ON
 GROUP BY
HAVING
 ORDER BY `,
    solutionQuery: `SELECT c.customer_name,
       COUNT(a.account_id) AS account_count
  FROM customers c
  JOIN accounts a ON c.customer_id = a.customer_id
 GROUP BY c.customer_id, c.customer_name
HAVING COUNT(a.account_id) > 1
 ORDER BY account_count DESC`,
    epoch: 'Intermediate',
    difficulty: 2,
  },
  {
    id: 21,
    title: 'Above-Average Balance Accounts',
    description: `VIP alert: identify all accounts holding more than the average balance across the entire portfolio — prime targets for wealth upsell.

Return \`account_id\`, \`customer_id\`, and \`balance\`, ordered by balance descending.`,
    hint: 'Use a subquery: WHERE balance > (SELECT AVG(balance) FROM accounts).',
    seedQuery: `SELECT
  FROM accounts
 WHERE balance > ( )
 ORDER BY `,
    solutionQuery: `SELECT account_id,
       customer_id,
       balance
  FROM accounts
 WHERE balance > (SELECT AVG(balance) FROM accounts)
 ORDER BY balance DESC`,
    epoch: 'Intermediate',
    difficulty: 2,
  },
  {
    id: 22,
    title: 'Defaulted Loan Customers',
    description: `The Collections team needs the names and details of customers with a loan status of \`Default\` for immediate follow-up.

Return \`customer_name\`, \`segment\`, \`principal_amount\`, and \`risk_grade\` for defaulted loans.`,
    hint: 'JOIN customers to loans on customer_id, filtering WHERE l.status = Default.',
    seedQuery: `SELECT
  FROM customers c
  JOIN loans l ON
 WHERE `,
    solutionQuery: `SELECT c.customer_name,
       c.segment,
       l.principal_amount,
       l.risk_grade
  FROM customers c
  JOIN loans l ON c.customer_id = l.customer_id
 WHERE l.status = 'Default'`,
    epoch: 'Intermediate',
    difficulty: 2,
  },
  {
    id: 23,
    title: 'Monthly Transaction Totals',
    description: `Finance wants a month-by-month summary of total transaction volume for the H1 2024 performance report.

Return \`month\` (as YYYY-MM), \`total_amount\`, and \`transaction_count\`, ordered by month.`,
    hint: 'Use strftime(\'%Y-%m\', transaction_date) and GROUP BY the result.',
    seedQuery: `SELECT
  FROM transactions
 GROUP BY
 ORDER BY `,
    solutionQuery: `SELECT strftime('%Y-%m', transaction_date) AS month,
       ROUND(SUM(amount), 2)                AS total_amount,
       COUNT(*)                              AS transaction_count
  FROM transactions
 GROUP BY strftime('%Y-%m', transaction_date)
 ORDER BY month`,
    epoch: 'Intermediate',
    difficulty: 2,
  },
  {
    id: 24,
    title: 'Savings and Investment Products',
    description: `The Product team needs a combined list of all Savings and Investment products in one result set using a UNION.

Return \`product_name\` and \`product_type\` for products of type \`Savings\` UNION those of type \`Investment\`, ordered by product_type then product_name.`,
    hint: 'Write two SELECT statements connected by UNION and ORDER BY at the end.',
    seedQuery: `SELECT
  FROM products
 WHERE
UNION
SELECT
  FROM products
 WHERE
 ORDER BY `,
    solutionQuery: `SELECT product_name, product_type
  FROM products
 WHERE product_type = 'Savings'
UNION
SELECT product_name, product_type
  FROM products
 WHERE product_type = 'Investment'
 ORDER BY product_type, product_name`,
    epoch: 'Intermediate',
    difficulty: 2,
  },
  {
    id: 25,
    title: 'Active vs Dormant Account Count',
    description: `Operations needs a simple breakdown of how many accounts are Active versus Dormant for the monthly MAS reporting pack.

Return \`status\` and \`account_count\` for Active and Dormant accounts only.`,
    hint: 'Filter WHERE status IN (Active, Dormant), then GROUP BY status.',
    seedQuery: `SELECT
  FROM accounts
 WHERE status IN ( )
 GROUP BY `,
    solutionQuery: `SELECT status,
       COUNT(*) AS account_count
  FROM accounts
 WHERE status IN ('Active', 'Dormant')
 GROUP BY status`,
    epoch: 'Intermediate',
    difficulty: 2,
  },
  {
    id: 26,
    title: 'Full Transaction History with Customer Names',
    description: `Customer Service needs a complete view linking each transaction to the customer who made it — spanning three tables.

Return \`customer_name\`, \`merchant_category\`, \`amount\`, and \`transaction_date\`, ordered by transaction_date descending. Limit to 20 rows.`,
    hint: 'JOIN transactions → accounts → customers using account_id and customer_id.',
    seedQuery: `SELECT
  FROM transactions t
  JOIN accounts a  ON
  JOIN customers c ON
 ORDER BY
 LIMIT 20`,
    solutionQuery: `SELECT c.customer_name,
       t.merchant_category,
       t.amount,
       t.transaction_date
  FROM transactions t
  JOIN accounts a  ON t.account_id   = a.account_id
  JOIN customers c ON a.customer_id  = c.customer_id
 ORDER BY t.transaction_date DESC
 LIMIT 20`,
    epoch: 'Intermediate',
    difficulty: 2,
  },
  {
    id: 27,
    title: 'Branch Transaction Volume',
    description: `Branch performance report: for each LCB branch, calculate how many transactions passed through its accounts and the total SGD volume.

Return \`branch_name\`, \`tx_count\`, and \`total_volume\` (rounded to 2dp), ordered by total_volume descending.`,
    hint: 'Chain JOINs: branches → accounts → transactions, then GROUP BY branch.',
    seedQuery: `SELECT
  FROM branches b
  JOIN accounts a     ON
  JOIN transactions t ON
 GROUP BY
 ORDER BY `,
    solutionQuery: `SELECT b.branch_name,
       COUNT(t.transaction_id)       AS tx_count,
       ROUND(SUM(t.amount), 2)        AS total_volume
  FROM branches b
  JOIN accounts a     ON b.branch_id    = a.branch_id
  JOIN transactions t ON a.account_id   = t.account_id
 GROUP BY b.branch_id, b.branch_name
 ORDER BY total_volume DESC`,
    epoch: 'Intermediate',
    difficulty: 2,
  },
  {
    id: 28,
    title: 'Credit Score Banding',
    description: `Credit Analytics wants customers categorised into standard MAS credit bands using a CASE expression.

Return \`customer_name\`, \`credit_score\`, and a computed \`credit_band\` column:
- ≥800 → Excellent
- ≥740 → Very Good
- ≥670 → Good
- ≥580 → Fair
- else → Poor

Order by credit_score descending.`,
    hint: 'Use CASE WHEN ... THEN ... ELSE ... END as credit_band.',
    seedQuery: `SELECT customer_name,
       credit_score,
       CASE
         WHEN  THEN ''
         WHEN  THEN ''
         WHEN  THEN ''
         WHEN  THEN ''
         ELSE ''
       END AS credit_band
  FROM customers
 ORDER BY credit_score DESC`,
    solutionQuery: `SELECT customer_name,
       credit_score,
       CASE
         WHEN credit_score >= 800 THEN 'Excellent'
         WHEN credit_score >= 740 THEN 'Very Good'
         WHEN credit_score >= 670 THEN 'Good'
         WHEN credit_score >= 580 THEN 'Fair'
         ELSE 'Poor'
       END AS credit_band
  FROM customers
 ORDER BY credit_score DESC`,
    epoch: 'Intermediate',
    difficulty: 2,
  },
  {
    id: 29,
    title: 'Top Debit Spend by Category',
    description: `Marketing Analytics needs to know where customers are spending the most on debit transactions per merchant category, to target rewards promotions.

Return \`customer_name\`, \`merchant_category\`, and \`total_spend\` for all Debit transactions, grouped by customer and category, ordered by total_spend descending. Limit 10 rows.`,
    hint: 'Three-table JOIN (transactions → accounts → customers) filtered by transaction_type = Debit, then GROUP BY customer and category.',
    seedQuery: `SELECT
  FROM transactions t
  JOIN accounts a  ON
  JOIN customers c ON
 WHERE
 GROUP BY
 ORDER BY
 LIMIT 10`,
    solutionQuery: `SELECT c.customer_name,
       t.merchant_category,
       ROUND(SUM(t.amount), 2) AS total_spend
  FROM transactions t
  JOIN accounts a  ON t.account_id  = a.account_id
  JOIN customers c ON a.customer_id = c.customer_id
 WHERE t.transaction_type = 'Debit'
 GROUP BY c.customer_id, c.customer_name, t.merchant_category
 ORDER BY total_spend DESC
 LIMIT 10`,
    epoch: 'Intermediate',
    difficulty: 2,
  },
  {
    id: 30,
    title: 'Loan Portfolio Summary',
    description: `The Board risk deck requires a loan portfolio summary grouped by both status and risk grade, showing loan count, average interest rate, and total exposure.

Return \`status\`, \`risk_grade\`, \`loan_count\`, \`avg_rate\` (2dp), and \`total_exposure\` (rounded), ordered by status then risk_grade.`,
    hint: 'GROUP BY two columns (status and risk_grade) simultaneously.',
    seedQuery: `SELECT
  FROM loans
 GROUP BY
 ORDER BY `,
    solutionQuery: `SELECT status,
       risk_grade,
       COUNT(*)                        AS loan_count,
       ROUND(AVG(interest_rate), 2)    AS avg_rate,
       ROUND(SUM(principal_amount), 0) AS total_exposure
  FROM loans
 GROUP BY status, risk_grade
 ORDER BY status, risk_grade`,
    epoch: 'Intermediate',
    difficulty: 2,
  },

  // ============================================================
  // ADVANCED (Levels 31–40)
  // CTEs, Window Functions, Date Arithmetic
  // ============================================================
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
  // EXPERT (Levels 41–50)
  // Recursive CTEs, Advanced Windows, Multi-CTE Analysis
  // ============================================================
  {
    id: 41,
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
    id: 42,
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
    id: 43,
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
    id: 44,
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
    id: 45,
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
    id: 46,
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
    id: 47,
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
    id: 48,
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
    id: 49,
    title: 'Transaction Anomaly Z-Score',
    description: `Advanced fraud detection: compute a simplified Z-score for each transaction relative to its account's mean and variance. Flag those with an absolute Z-score > 1.5.

Use a CTE for account-level statistics, then calculate Z-score in the outer query.

Return \`transaction_id\`, \`account_id\`, \`amount\`, \`merchant_category\`, \`account_avg\`, and \`z_score\` (2dp), ordered by z_score descending. Limit 15.`,
    hint: 'CTE: compute AVG and SUM of squared deviations per account_id. Outer query: CASE WHEN variance > 0 THEN (amount - avg) / SQRT(variance) ELSE 0 END.',
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
         SUM((amount - (SELECT AVG(a2.amount) FROM transactions a2 WHERE a2.account_id = transactions.account_id))
           * (amount - (SELECT AVG(a2.amount) FROM transactions a2 WHERE a2.account_id = transactions.account_id)))
           / COUNT(*) AS variance
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
    id: 50,
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
  // MARITIME TRADE FINANCE (Levels 51–55)
  // New tables: vessels, cargo_shipments, trade_finance_facilities
  // ============================================================
  {
    id: 51,
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
    epoch: 'Intermediate',
    difficulty: 2,
  },
  {
    id: 52,
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
    epoch: 'Intermediate',
    difficulty: 2,
  },
  {
    id: 53,
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
    id: 54,
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
];

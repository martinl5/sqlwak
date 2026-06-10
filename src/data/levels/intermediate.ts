import type { Level } from '@/types';

export const intermediateLevels: Level[] = [
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
];

import type { Level } from '@/types';

export const foundationalLevels: Level[] = [
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
];

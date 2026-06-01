import { Database, SqlJsStatic } from 'sql.js';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;
let initPromise: Promise<Database> | null = null;

async function loadSqlJsFromCDN(): Promise<SqlJsStatic> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
    script.onload = () => {
      const initSqlJs = (window as any).initSqlJs;
      if (!initSqlJs) { reject(new Error('initSqlJs not found on window')); return; }
      initSqlJs({
        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
      }).then(resolve).catch(reject);
    };
    script.onerror = () => reject(new Error('Failed to load sql.js script'));
    document.head.appendChild(script);
  });
}

export async function initDatabase(): Promise<Database> {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (!SQL) SQL = await loadSqlJsFromCDN();
    db = new SQL.Database();
    await seedDatabase(db);
    return db;
  })();

  return initPromise;
}

async function seedDatabase(database: Database): Promise<void> {
  // ── Products ──────────────────────────────────────────────────────────────
  database.run(`
    CREATE TABLE IF NOT EXISTS products (
      product_id    INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name  TEXT    NOT NULL,
      product_type  TEXT    NOT NULL,
      interest_rate REAL,
      min_balance   REAL    NOT NULL DEFAULT 0
    );
  `);

  // ── Customers ─────────────────────────────────────────────────────────────
  database.run(`
    CREATE TABLE IF NOT EXISTS customers (
      customer_id   INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT    NOT NULL,
      segment       TEXT    NOT NULL,
      credit_score  INTEGER NOT NULL,
      join_date     TEXT    NOT NULL,
      email         TEXT
    );
  `);

  // ── Branches ──────────────────────────────────────────────────────────────
  database.run(`
    CREATE TABLE IF NOT EXISTS branches (
      branch_id   INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_name TEXT    NOT NULL,
      city        TEXT    NOT NULL,
      region      TEXT    NOT NULL,
      branch_type TEXT    NOT NULL
    );
  `);

  // ── Accounts ──────────────────────────────────────────────────────────────
  database.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      account_id  INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      product_id  INTEGER NOT NULL,
      branch_id   INTEGER NOT NULL,
      balance     REAL    NOT NULL,
      opened_date TEXT    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'Active',
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
      FOREIGN KEY (product_id)  REFERENCES products(product_id),
      FOREIGN KEY (branch_id)   REFERENCES branches(branch_id)
    );
  `);

  // ── Transactions ──────────────────────────────────────────────────────────
  database.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      transaction_id    INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id        INTEGER NOT NULL,
      amount            REAL    NOT NULL,
      transaction_type  TEXT    NOT NULL,
      transaction_date  TEXT    NOT NULL,
      merchant_category TEXT    NOT NULL,
      channel           TEXT    NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(account_id)
    );
  `);

  // ── Loans ─────────────────────────────────────────────────────────────────
  database.run(`
    CREATE TABLE IF NOT EXISTS loans (
      loan_id          INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id      INTEGER NOT NULL,
      product_id       INTEGER NOT NULL,
      principal_amount REAL    NOT NULL,
      interest_rate    REAL    NOT NULL,
      term_months      INTEGER NOT NULL,
      start_date       TEXT    NOT NULL,
      status           TEXT    NOT NULL,
      risk_grade       TEXT    NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
      FOREIGN KEY (product_id)  REFERENCES products(product_id)
    );
  `);

  // ── Seed: Products ────────────────────────────────────────────────────────
  const products = [
    { name: 'LCB EasySave Account',        type: 'Savings',       rate: 0.50,  min: 500    },
    { name: 'LCB Premier Savings',          type: 'Savings',       rate: 1.20,  min: 5000   },
    { name: 'LCB 360 Current Account',      type: 'Current',       rate: 0.10,  min: 0      },
    { name: 'LCB Fixed Deposit (12M)',       type: 'Fixed Deposit', rate: 3.50,  min: 1000   },
    { name: 'LCB CPF Investment Account',   type: 'Investment',    rate: 4.00,  min: 0      },
    { name: 'LCB SRS Account',              type: 'Investment',    rate: 3.00,  min: 0      },
    { name: 'LCB HDB Home Loan',            type: 'Loan',          rate: 2.50,  min: 0      },
    { name: 'LCB Car Loan',                 type: 'Loan',          rate: 2.78,  min: 0      },
    { name: 'LCB Personal Line of Credit',  type: 'Loan',          rate: 5.50,  min: 0      },
    { name: 'LCB Credit Card (Platinum)',   type: 'Credit Card',   rate: 26.90, min: 0      },
    { name: 'LCB Business Current Account', type: 'Current',       rate: 0.20,  min: 1000   },
    { name: 'LCB Trade Finance',            type: 'Investment',    rate: 3.80,  min: 0      },
    { name: 'LCB Wealth Management',        type: 'Investment',    rate: null,  min: 250000 },
    { name: 'LCB PayNow Wallet',            type: 'Current',       rate: 0.00,  min: 0      },
    { name: 'LCB Junior Savings',           type: 'Savings',       rate: 0.80,  min: 0      },
  ];
  products.forEach(p =>
    database.run(
      `INSERT INTO products (product_name, product_type, interest_rate, min_balance) VALUES (?, ?, ?, ?)`,
      [p.name, p.type, p.rate, p.min]
    )
  );

  // ── Seed: Customers ───────────────────────────────────────────────────────
  const customers = [
    { name: 'Tan Wei Ling',       segment: 'Priority', score: 780, join: '2019-03-15' },
    { name: 'Rajesh Nair',        segment: 'Mass',     score: 650, join: '2020-07-22' },
    { name: 'Aisha Binte Yusof',  segment: 'Priority', score: 720, join: '2018-11-10' },
    { name: 'James Lim',          segment: 'Private',  score: 820, join: '2015-05-01' },
    { name: 'Priya Krishnamurthy',segment: 'Mass',     score: 590, join: '2021-09-14' },
    { name: 'Zhang Wei',          segment: 'SME',      score: 700, join: '2017-06-30' },
    { name: 'Muhammad Farhan',    segment: 'Mass',     score: 620, join: '2022-01-18' },
    { name: 'Chen Mei Ling',      segment: 'Priority', score: 760, join: '2019-08-05' },
    { name: 'Suresh Pillai',      segment: 'SME',      score: 680, join: '2016-04-12' },
    { name: 'Lee Hui Min',        segment: 'Mass',     score: 550, join: '2023-02-28' },
    { name: 'Kavitha Rajan',      segment: 'Priority', score: 740, join: '2020-11-20' },
    { name: 'Wong Ah Kow',        segment: 'Private',  score: 850, join: '2014-01-07' },
    { name: 'Nur Hidayah',        segment: 'Mass',     score: 610, join: '2021-05-30' },
    { name: 'David Chua',         segment: 'SME',      score: 710, join: '2018-08-15' },
    { name: 'Siti Rahimah',       segment: 'Mass',     score: 570, join: '2022-07-09' },
    { name: 'Lim Boon Keng',      segment: 'Priority', score: 790, join: '2017-03-22' },
    { name: 'Anand Krishnaswamy', segment: 'Private',  score: 830, join: '2013-12-01' },
    { name: 'Fiona Tan',          segment: 'Mass',     score: 640, join: '2021-10-17' },
    { name: 'Rajan Selvam',       segment: 'SME',      score: 690, join: '2019-06-25' },
    { name: 'Michelle Koh',       segment: 'Priority', score: 755, join: '2020-04-11' },
  ];
  customers.forEach(c =>
    database.run(
      `INSERT INTO customers (customer_name, segment, credit_score, join_date) VALUES (?, ?, ?, ?)`,
      [c.name, c.segment, c.score, c.join]
    )
  );

  // ── Seed: Branches ────────────────────────────────────────────────────────
  const branches = [
    { name: 'LCB Marina Bay HQ',        region: 'Central', type: 'HQ'              },
    { name: 'LCB Orchard Road',         region: 'Central', type: 'High Street'     },
    { name: 'LCB Jurong East',          region: 'West',    type: 'Community'       },
    { name: 'LCB Tampines Hub',         region: 'East',    type: 'Community'       },
    { name: 'LCB Woodlands',            region: 'North',   type: 'Community'       },
    { name: 'LCB Bugis',                region: 'Central', type: 'High Street'     },
    { name: 'LCB Toa Payoh',            region: 'Central', type: 'Community'       },
    { name: 'LCB Changi Business Park', region: 'East',    type: 'Business Centre' },
    { name: 'LCB One-North',            region: 'West',    type: 'Business Centre' },
    { name: 'LCB Raffles Place',        region: 'Central', type: 'Business Centre' },
  ];
  branches.forEach(b =>
    database.run(
      `INSERT INTO branches (branch_name, city, region, branch_type) VALUES (?, ?, ?, ?)`,
      [b.name, 'Singapore', b.region, b.type]
    )
  );

  // ── Seed: Accounts ────────────────────────────────────────────────────────
  // 2 accounts per customer (40 total). Primary product varies by segment; secondary is often
  // a PayNow Wallet or Fixed Deposit. A handful are Dormant / Closed.
  const primaryProducts = [2, 1, 2, 13, 1, 11, 1, 2, 11, 1, 2, 13, 1, 11, 1, 2, 13, 1, 11, 2];
  const secondaryProducts = [4, 14, 6, 10, 14, 3, 14, 4, 3, 14, 4, 6, 14, 3, 14, 4, 6, 14, 3, 4];
  const primaryBalances = [
    45230.50, 1200.00,   88760.00, 1850000.00, 520.00,
    125000.00, 890.00,   67500.00, 98000.00,    180.00,
    42100.00, 2250000.00, 750.00,  55000.00,    310.00,
    112000.00, 3100000.00, 2100.00, 78500.00,  89000.00,
  ];
  const secondaryBalances = [
    5000.00, 300.00,  12000.00, 0.00,    0.00,
    8500.00, 100.00,  9800.00,  15000.00, 50.00,
    7200.00, 50000.00, 200.00, 12000.00,  0.00,
    18000.00, 75000.00, 600.00, 11000.00, 14000.00,
  ];
  const openDates = [
    '2019-04-01','2020-08-10','2018-12-01','2015-06-15','2021-10-05',
    '2017-07-20','2022-02-01','2019-09-01','2016-05-01','2023-03-15',
    '2020-12-01','2014-02-01','2021-06-15','2018-09-01','2022-08-01',
    '2017-04-10','2014-01-15','2021-11-01','2019-07-01','2020-05-01',
  ];
  const primaryStatuses = [
    'Active','Active','Active','Active','Dormant',
    'Active','Dormant','Active','Active','Dormant',
    'Active','Active','Dormant','Active','Active',
    'Active','Active','Dormant','Active','Active',
  ];
  // Secondary statuses: a few Closed
  const closedSecondary = new Set([3, 9, 14]); // 0-indexed

  for (let i = 0; i < 20; i++) {
    const cid = i + 1;
    const primaryBranch = (i % 10) + 1;
    const secondaryBranch = ((i + 3) % 10) + 1;
    // primary account
    database.run(
      `INSERT INTO accounts (customer_id, product_id, branch_id, balance, opened_date, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [cid, primaryProducts[i], primaryBranch, primaryBalances[i], openDates[i], primaryStatuses[i]]
    );
    // secondary account
    const secondaryDate = openDates[i].replace(/^(\d{4})/, (y) => String(parseInt(y) + 1));
    const secondaryStatus = closedSecondary.has(i) ? 'Closed' : 'Active';
    database.run(
      `INSERT INTO accounts (customer_id, product_id, branch_id, balance, opened_date, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [cid, secondaryProducts[i], secondaryBranch, secondaryBalances[i], secondaryDate, secondaryStatus]
    );
  }

  // ── Seed: Transactions ────────────────────────────────────────────────────
  // 150 transactions spread across Jan–Jun 2024
  const categories = [
    'Hawker Centre','MRT Top-up','Grab','HDB Town Council','Salary Credit',
    'NTUC FairPrice','Overseas','Dining','Retail','Utilities',
  ];
  const channels = ['ATM','PayNow','FAST','GIRO','Branch','Card','Online'];

  for (let i = 0; i < 150; i++) {
    const accountId = (i % 40) + 1;
    const category  = categories[i % categories.length];
    const channel   = channels[i % channels.length];
    const month     = Math.floor(i / 25) + 1;
    const day       = (i % 28) + 1;
    const date      = `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const txType = (category === 'Salary Credit' || i % 3 === 0) ? 'Credit' : 'Debit';

    let amount: number;
    if (category === 'Salary Credit')      amount = 3000 + accountId * 150;
    else if (category === 'HDB Town Council') amount = 450.00;
    else if (category === 'Utilities')     amount = 180 + (i % 50);
    else if (category === 'Overseas')      amount = 500 + (i * 23) % 2000;
    else if (category === 'Retail')        amount = 50 + (i * 17) % 500;
    else if (category === 'Dining')        amount = 20 + (i * 7) % 150;
    else if (category === 'MRT Top-up')    amount = 50.00;
    else if (category === 'Grab')          amount = 8 + (i % 30);
    else                                   amount = 10 + (i * 11) % 200;

    database.run(
      `INSERT INTO transactions (account_id, amount, transaction_type, transaction_date, merchant_category, channel) VALUES (?, ?, ?, ?, ?, ?)`,
      [accountId, amount, txType, date, category, channel]
    );
  }

  // ── Seed: Loans ───────────────────────────────────────────────────────────
  // 15 loans for customers 1–15 only; customers 16–20 have no loan
  const loanProductIds  = [7, 8, 9, 7, 8, 9, 7, 8, 9, 7, 8, 9, 7, 8, 9];
  const principals      = [380000,85000,15000,420000,70000,25000,350000,60000,10000,450000,95000,20000,280000,55000,8000];
  const loanRates       = [2.50,2.78,5.50,2.50,2.78,5.50,2.50,2.78,5.50,2.50,2.78,5.50,2.50,2.78,5.50];
  const termMonths      = [300,60,36,300,60,36,240,60,24,300,72,48,240,60,24];
  const loanStartDates  = [
    '2022-01-15','2021-06-01','2023-03-10','2020-07-20','2022-11-05',
    '2023-08-01','2019-04-15','2021-02-28','2023-11-01','2018-09-30',
    '2022-05-15','2023-06-01','2020-10-20','2021-09-01','2024-01-15',
  ];
  const loanStatuses    = ['Active','Active','Active','Active','Paid Off','Active','Active','Default','Active','Active','Active','Paid Off','Active','Active','Active'];
  const riskGrades      = ['A','B','C','A','B','C','A','D','B','A','B','C','A','B','C'];

  for (let i = 0; i < 15; i++) {
    database.run(
      `INSERT INTO loans (customer_id, product_id, principal_amount, interest_rate, term_months, start_date, status, risk_grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [i + 1, loanProductIds[i], principals[i], loanRates[i], termMonths[i], loanStartDates[i], loanStatuses[i], riskGrades[i]]
    );
  }

  // ── Indexes ───────────────────────────────────────────────────────────────
  database.run('CREATE INDEX IF NOT EXISTS idx_accounts_customer  ON accounts(customer_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_accounts_product   ON accounts(product_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_accounts_branch    ON accounts(branch_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_accounts_status    ON accounts(status)');
  database.run('CREATE INDEX IF NOT EXISTS idx_transactions_acct  ON transactions(account_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_transactions_date  ON transactions(transaction_date)');
  database.run('CREATE INDEX IF NOT EXISTS idx_transactions_type  ON transactions(transaction_type)');
  database.run('CREATE INDEX IF NOT EXISTS idx_loans_customer     ON loans(customer_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_loans_status       ON loans(status)');
  database.run('CREATE INDEX IF NOT EXISTS idx_customers_segment  ON customers(segment)');
}

export function executeQuery(sql: string): { columns: string[]; values: unknown[][] } {
  if (!db) throw new Error('Database not initialized');
  try {
    const results = db.exec(sql);
    if (results.length === 0) return { columns: [], values: [] };
    return { columns: results[0].columns, values: results[0].values };
  } catch (error) {
    throw error;
  }
}

export function getDatabase(): Database | null {
  return db;
}

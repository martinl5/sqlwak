import type { Database } from 'sql.js';

// Seeds the Lion City Bank schema and data. Pure: no DOM, no globals —
// usable from both the browser game and the Node test suite.
export function seedDatabase(database: Database): void {
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
      email         TEXT,
      ab_test_group TEXT    NOT NULL DEFAULT 'A'
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
    { name: 'Tan Wei Ling',       segment: 'Priority', score: 780, join: '2019-03-15', ab: 'A' },
    { name: 'Rajesh Nair',        segment: 'Mass',     score: 650, join: '2020-07-22', ab: 'B' },
    { name: 'Aisha Binte Yusof',  segment: 'Priority', score: 720, join: '2018-11-10', ab: 'A' },
    { name: 'James Lim',          segment: 'Private',  score: 820, join: '2015-05-01', ab: 'B' },
    { name: 'Priya Krishnamurthy',segment: 'Mass',     score: 590, join: '2021-09-14', ab: 'A' },
    { name: 'Zhang Wei',          segment: 'SME',      score: 700, join: '2017-06-30', ab: 'B' },
    { name: 'Muhammad Farhan',    segment: 'Mass',     score: 620, join: '2022-01-18', ab: 'A' },
    { name: 'Chen Mei Ling',      segment: 'Priority', score: 760, join: '2019-08-05', ab: 'B' },
    { name: 'Suresh Pillai',      segment: 'SME',      score: 680, join: '2016-04-12', ab: 'A' },
    { name: 'Lee Hui Min',        segment: 'Mass',     score: 550, join: '2023-02-28', ab: 'B' },
    { name: 'Kavitha Rajan',      segment: 'Priority', score: 740, join: '2020-11-20', ab: 'A' },
    { name: 'Wong Ah Kow',        segment: 'Private',  score: 850, join: '2014-01-07', ab: 'B' },
    { name: 'Nur Hidayah',        segment: 'Mass',     score: 610, join: '2021-05-30', ab: 'A' },
    { name: 'David Chua',         segment: 'SME',      score: 710, join: '2018-08-15', ab: 'B' },
    { name: 'Siti Rahimah',       segment: 'Mass',     score: 570, join: '2022-07-09', ab: 'A' },
    { name: 'Lim Boon Keng',      segment: 'Priority', score: 790, join: '2017-03-22', ab: 'B' },
    { name: 'Anand Krishnaswamy', segment: 'Private',  score: 830, join: '2013-12-01', ab: 'A' },
    { name: 'Fiona Tan',          segment: 'Mass',     score: 640, join: '2021-10-17', ab: 'B' },
    { name: 'Rajan Selvam',       segment: 'SME',      score: 690, join: '2019-06-25', ab: 'A' },
    { name: 'Michelle Koh',       segment: 'Priority', score: 755, join: '2020-04-11', ab: 'B' },
  ];
  customers.forEach(c =>
    database.run(
      `INSERT INTO customers (customer_name, segment, credit_score, join_date, ab_test_group) VALUES (?, ?, ?, ?, ?)`,
      [c.name, c.segment, c.score, c.join, c.ab]
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

  // ── Vessels ───────────────────────────────────────────────────────────────
  database.run(`
    CREATE TABLE IF NOT EXISTS vessels (
      vessel_id         INTEGER PRIMARY KEY AUTOINCREMENT,
      vessel_name       TEXT    NOT NULL,
      vessel_type       TEXT    NOT NULL,
      flag_state        TEXT    NOT NULL,
      dwt_tonnes        INTEGER NOT NULL,
      year_built        INTEGER NOT NULL,
      owner_customer_id INTEGER,
      FOREIGN KEY (owner_customer_id) REFERENCES customers(customer_id)
    );
  `);

  // ── Cargo Shipments ───────────────────────────────────────────────────────
  database.run(`
    CREATE TABLE IF NOT EXISTS cargo_shipments (
      shipment_id      INTEGER PRIMARY KEY AUTOINCREMENT,
      vessel_id        INTEGER NOT NULL,
      origin_port      TEXT    NOT NULL,
      destination_port TEXT    NOT NULL,
      cargo_type       TEXT    NOT NULL,
      cargo_value_usd  REAL    NOT NULL,
      departure_date   TEXT    NOT NULL,
      arrival_date     TEXT,
      status           TEXT    NOT NULL,
      FOREIGN KEY (vessel_id) REFERENCES vessels(vessel_id)
    );
  `);

  // ── Trade Finance Facilities ──────────────────────────────────────────────
  database.run(`
    CREATE TABLE IF NOT EXISTS trade_finance_facilities (
      facility_id     INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id     INTEGER NOT NULL,
      vessel_id       INTEGER,
      facility_type   TEXT    NOT NULL,
      facility_amount REAL    NOT NULL,
      utilised_amount REAL    NOT NULL,
      expiry_date     TEXT    NOT NULL,
      status          TEXT    NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
      FOREIGN KEY (vessel_id)   REFERENCES vessels(vessel_id)
    );
  `);

  // ── Seed: Vessels ──────────────────────────────────────────────────────────
  const vesselData = [
    { name: 'MV Lion Prosperity',  type: 'Container',    flag: 'SGP', dwt: 45000, built: 2018, owner: 6  },
    { name: 'MV Straits Eagle',    type: 'Bulk Carrier', flag: 'SGP', dwt: 75000, built: 2015, owner: 9  },
    { name: 'MV Marina Star',      type: 'Tanker',       flag: 'SGP', dwt: 55000, built: 2020, owner: 14 },
    { name: 'MV Pacific Triumph',  type: 'Container',    flag: 'PAN', dwt: 62000, built: 2017, owner: 19 },
    { name: 'MV Golden Lion',      type: 'RORO',         flag: 'SGP', dwt: 28000, built: 2019, owner: 4  },
    { name: 'MV Harbour Grace',    type: 'Bulk Carrier', flag: 'SGP', dwt: 82000, built: 2014, owner: 17 },
    { name: 'MV Ocean Venture',    type: 'Container',    flag: 'LBR', dwt: 50000, built: 2016, owner: null },
    { name: 'MV Coral Princess',   type: 'Tanker',       flag: 'MHL', dwt: 40000, built: 2021, owner: null },
    { name: 'MV Trade Winds',      type: 'Bulk Carrier', flag: 'PAN', dwt: 68000, built: 2013, owner: null },
    { name: 'MV Eastern Promise',  type: 'Container',    flag: 'BHS', dwt: 35000, built: 2022, owner: null },
    { name: 'MV Raffles Mariner',  type: 'RORO',         flag: 'SGP', dwt: 22000, built: 2023, owner: 6  },
    { name: 'MV Sentosa Spirit',   type: 'Tanker',       flag: 'SGP', dwt: 48000, built: 2012, owner: 9  },
  ];
  vesselData.forEach(v =>
    database.run(
      `INSERT INTO vessels (vessel_name, vessel_type, flag_state, dwt_tonnes, year_built, owner_customer_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [v.name, v.type, v.flag, v.dwt, v.built, v.owner]
    )
  );

  // ── Seed: Cargo Shipments ─────────────────────────────────────────────────
  type ShipmentRow = [number, string, string, string, number, string, string | null, string];
  const shipmentData: ShipmentRow[] = [
    [1,  'Singapore',        'Rotterdam',      'Electronics',    2500000, '2024-01-05', '2024-02-15', 'Arrived'   ],
    [2,  'Port Klang',       'Shanghai',       'Grain',           800000, '2024-01-10', '2024-01-25', 'Arrived'   ],
    [3,  'Singapore',        'Dubai',          'Crude Oil',      4200000, '2024-01-15', '2024-02-28', 'Arrived'   ],
    [4,  'Bangkok',          'Los Angeles',    'Consumer Goods', 1800000, '2024-02-01', '2024-03-20', 'Arrived'   ],
    [5,  'Jakarta',          'Sydney',         'Steel',           950000, '2024-02-10', null,          'Delayed'   ],
    [6,  'Singapore',        'Hamburg',        'Grain',          1100000, '2024-02-15', '2024-04-01', 'Arrived'   ],
    [7,  'Ho Chi Minh City', 'Rotterdam',      'Electronics',    3200000, '2024-02-20', '2024-04-10', 'Arrived'   ],
    [8,  'Singapore',        'Busan',          'Crude Oil',      5100000, '2024-03-01', '2024-03-10', 'Arrived'   ],
    [9,  'Port Klang',       'Dubai',          'Steel',          1400000, '2024-03-05', null,          'In Transit'],
    [10, 'Bangkok',          'Sydney',         'Consumer Goods',  760000, '2024-03-10', '2024-04-05', 'Arrived'   ],
    [1,  'Singapore',        'Shanghai',       'Electronics',    2100000, '2024-03-15', '2024-03-28', 'Arrived'   ],
    [2,  'Jakarta',          'Busan',          'Grain',           620000, '2024-03-20', '2024-03-30', 'Arrived'   ],
    [3,  'Singapore',        'Los Angeles',    'Crude Oil',      6800000, '2024-04-01', null,          'Delayed'   ],
    [4,  'Ho Chi Minh City', 'Hamburg',        'Consumer Goods', 2300000, '2024-04-05', '2024-05-25', 'Arrived'   ],
    [5,  'Port Klang',       'Rotterdam',      'Steel',          1700000, '2024-04-10', '2024-05-30', 'Arrived'   ],
    [11, 'Singapore',        'Sydney',         'Consumer Goods',  890000, '2024-04-15', '2024-05-20', 'Arrived'   ],
    [12, 'Singapore',        'Dubai',          'Crude Oil',      7200000, '2024-04-20', null,          'In Transit'],
    [6,  'Bangkok',          'Shanghai',       'Grain',           740000, '2024-04-25', '2024-05-10', 'Arrived'   ],
    [7,  'Jakarta',          'Busan',          'Electronics',    1950000, '2024-05-01', '2024-05-15', 'Arrived'   ],
    [8,  'Singapore',        'Rotterdam',      'Crude Oil',      8500000, '2024-05-05', null,          'In Transit'],
    [9,  'Ho Chi Minh City', 'Los Angeles',    'Steel',          2800000, '2024-05-10', null,          'Delayed'   ],
    [10, 'Port Klang',       'Busan',          'Consumer Goods',  430000, '2024-05-15', '2024-05-25', 'Arrived'   ],
    [1,  'Singapore',        'Hamburg',        'Electronics',    3100000, '2024-05-20', null,          'In Transit'],
    [2,  'Bangkok',          'Dubai',          'Grain',           550000, '2024-05-25', '2024-06-10', 'Arrived'   ],
    [3,  'Singapore',        'Sydney',         'Crude Oil',      4900000, '2024-06-01', null,          'In Transit'],
  ];
  shipmentData.forEach(([vid, orig, dest, cargo, val, dep, arr, stat]) =>
    database.run(
      `INSERT INTO cargo_shipments (vessel_id, origin_port, destination_port, cargo_type, cargo_value_usd, departure_date, arrival_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [vid, orig, dest, cargo, val, dep, arr, stat]
    )
  );

  // ── Seed: Trade Finance Facilities ────────────────────────────────────────
  type FacilityRow = [number, number | null, string, number, number, string, string];
  const facilityData: FacilityRow[] = [
    [6,  1,    'Letter of Credit',   5000000, 4200000, '2024-12-31', 'Active'  ],
    [9,  2,    'Shipping Guarantee', 2000000, 1850000, '2024-09-30', 'Active'  ],
    [14, 3,    'Trade Loan',         3500000, 2100000, '2025-03-31', 'Active'  ],
    [19, 4,    'Letter of Credit',   4200000, 3800000, '2024-08-31', 'Active'  ],
    [4,  5,    'Bills Discount',     1500000,  750000, '2024-11-30', 'Active'  ],
    [17, 6,    'Trade Loan',         6000000, 5400000, '2025-01-31', 'Active'  ],
    [6,  11,   'Shipping Guarantee',  800000,  600000, '2024-07-31', 'Active'  ],
    [9,  12,   'Letter of Credit',   3200000, 2400000, '2024-10-31', 'Active'  ],
    [14, null, 'Bills Discount',     1800000,  900000, '2025-06-30', 'Active'  ],
    [19, null, 'Trade Loan',         2500000, 1250000, '2025-02-28', 'Active'  ],
    [4,  null, 'Letter of Credit',   2000000, 2000000, '2023-12-31', 'Expired' ],
    [17, null, 'Shipping Guarantee', 4500000,       0, '2023-09-30', 'Expired' ],
    [1,  null, 'Bills Discount',      500000,  450000, '2024-12-31', 'Active'  ],
    [16, null, 'Trade Loan',          750000,  300000, '2025-03-31', 'Active'  ],
    [3,  null, 'Letter of Credit',   1200000,  800000, '2024-11-30', 'Active'  ],
  ];
  facilityData.forEach(([cid, vid, ftype, famount, utilised, expiry, fstatus]) =>
    database.run(
      `INSERT INTO trade_finance_facilities (customer_id, vessel_id, facility_type, facility_amount, utilised_amount, expiry_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cid, vid, ftype, famount, utilised, expiry, fstatus]
    )
  );

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
  database.run('CREATE INDEX IF NOT EXISTS idx_vessels_type       ON vessels(vessel_type)');
  database.run('CREATE INDEX IF NOT EXISTS idx_shipments_vessel   ON cargo_shipments(vessel_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_shipments_status   ON cargo_shipments(status)');
  database.run('CREATE INDEX IF NOT EXISTS idx_tff_customer       ON trade_finance_facilities(customer_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_tff_status         ON trade_finance_facilities(status)');
  database.run('CREATE INDEX IF NOT EXISTS idx_shipments_departure ON cargo_shipments(departure_date)');
  database.run('CREATE INDEX IF NOT EXISTS idx_customers_ab_group  ON customers(ab_test_group)');
  database.run('CREATE INDEX IF NOT EXISTS idx_accounts_opened_date ON accounts(opened_date)');
  database.run('CREATE INDEX IF NOT EXISTS idx_transactions_channel  ON transactions(channel)');
}

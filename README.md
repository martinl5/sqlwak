# 🦁 SQLwak — SQL Learning Game

**Learn SQL by working at Lion City Bank.**

SQLwak is a free, browser-based SQL practice game. You're hired as a Graduate Analyst at a fictional Singapore bank and work through 50+ progressively harder SQL challenges — from basic SELECTs to window functions and CTEs.

🎮 **[Play now → sqlwak.vercel.app](https://sqlwak.vercel.app)**

---

## What is SQLwak?

Instead of dry exercises, every query in SQLwak is a real business problem:

- *"The Operations team needs all Central region branches for an upcoming audit."*
- *"Risk wants customers with credit scores below 600."*
- *"Finance needs vessels ranked by cargo revenue using window functions."*

You're not practicing SQL in a vacuum — you're doing analyst work.

---

## 50+ Levels Across 4 Difficulty Tiers

| Tier | What You'll Practice |
|------|---------------------|
| 🟢 **Foundational** | SELECT, WHERE, ORDER BY, LIMIT |
| 🟡 **Intermediate** | JOINs, GROUP BY, HAVING, subqueries |
| 🔴 **Advanced** | CTEs (WITH), multi-table aggregations |
| ⚫ **Expert** | Window functions (RANK/DENSE_RANK OVER PARTITION BY), UNION ALL, compound CTEs |

---

## The Database

Lion City Bank has 9 tables across retail banking and maritime trade finance:

**Retail Banking**
- `customers` — profiles, segments, credit scores
- `accounts` — account types, balances, status
- `transactions` — debits, credits, timestamps
- `loans` — loan types, amounts, repayment status
- `branches` — regions, branch types
- `products` — banking products

**Maritime Trade Finance** *(Advanced/Expert levels)*
- `vessels` — merchant fleet, flag states, vessel types
- `cargo_shipments` — voyages across Singapore, Port Klang, Bangkok, Jakarta, Ho Chi Minh City
- `trade_finance_facilities` — Letters of Credit, Trade Loans, utilisation rates

---

## Technical Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Database**: SQLite via WebAssembly (all query execution is client-side — no backend)
- **Deployment**: Vercel

---

## No Signup. No Download. Just SQL.

Open the link, start writing queries. That's it.

🎮 **[sqlwak.vercel.app](https://sqlwak.vercel.app)**

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful checks (all run in CI):

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm test           # Vitest — validates every level's solution query
npm run build      # Production build
```

---

## Contributing

Issues and PRs welcome! Ideas for new levels, challenge themes, or schema additions are especially appreciated — see [CONTRIBUTING.md](CONTRIBUTING.md) for the level-authoring guide.

## License

[MIT](LICENSE)

---

*Built for anyone preparing for data analyst, data engineer, or business analyst interviews.*

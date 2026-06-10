# Contributing to SQLwak

Thanks for helping make SQLwak better! The most valuable contributions are new
levels, clearer task descriptions, and bug reports about queries that were
graded incorrectly.

## Development

```bash
npm install
npm run dev        # http://localhost:3000
```

Before opening a PR, make sure all four CI gates pass locally:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## How validation works

A level is solved when the user's query returns the same result as the level's
`solutionQuery`, both executed against the seeded in-memory SQLite database
(`src/lib/seed.ts`). The comparison (`src/lib/validator.ts`):

- only permits a single read-only `SELECT`/`WITH` statement;
- requires row order **only** when the solution query has a top-level
  `ORDER BY` (a per-level `orderMatters` field can override this);
- matches column names case-insensitively, strings exactly, and numbers with a
  relative tolerance.

## Authoring a level

Levels live in `src/data/levels/` (one file per epoch, combined in
`index.ts`). When adding one:

1. **Append to the correct epoch file** with the next sequential `id`. Epochs
   must stay contiguous — the test suite enforces this.
2. **Write the description as a business request**, ending with an explicit
   contract: which columns to return (use backticked names matching the
   solution's aliases), and — if order matters — the exact ordering, phrased
   like "ordered by `balance` descending".
3. **Only add `ORDER BY` to the solution when the description asks for it.**
   If the description doesn't mention ordering, leave the solution unordered;
   the validator then accepts any row order.
4. **`seedQuery`** is a scaffold with blanks, not a near-answer. Keep clause
   keywords on their own lines with a single trailing space where the user
   should type.
5. **`hint`** should name the technique (e.g. "use `LAG() OVER`"), not the
   answer.
6. **Run `npm test`.** The suite executes every solution against the real
   seed and fails if a solution errors, returns zero rows, or if a seed
   scaffold already passes validation.

If a level needs new data, extend `src/lib/seed.ts` — and check existing
levels still pass, since they share the seed.

## Code style

Match the surrounding code. UI work should respect the design principles in
`PRODUCT.md` (terminal-first, WCAG AA contrast, reduced-motion alternatives).

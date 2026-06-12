import { beforeAll, describe, expect, it } from 'vitest';
import initSqlJs, { type Database } from 'sql.js';
import { levels } from '@/data/levels';
import { seedDatabase } from '@/lib/seed';
import { runReadOnlyQuery } from '@/lib/sqlRunner';
import { extractOrderKeyIndices, solutionRequiresOrder, valuesEqual } from '@/lib/validator';

// A level can falsely reject a correct answer when its expected result is not
// fully determined by the task: ties on the ORDER BY keys (fixed by the
// tie-aware compare, but only when the keys resolve), a LIMIT that cuts
// through a tie (so the returned row *set* is ambiguous), or a window
// function whose output depends on the arbitrary order of tied rows. These
// tests pin the invariants that keep every level deterministic, so a future
// level or seed-data change that reintroduces the hazard fails loudly here.

let db: Database;

beforeAll(async () => {
  const SQL = await initSqlJs();
  db = new SQL.Database();
  seedDatabase(db);
});

const rows = (sql: string) => runReadOnlyQuery(db, sql).values;

const orderedLevels = levels.filter(
  (l) => l.orderMatters ?? solutionRequiresOrder(l.solutionQuery)
);

describe.each(orderedLevels)('level $id — $title', (level) => {
  it('ORDER BY keys resolve to result columns (tie-aware compare applies)', () => {
    // If this fails, validateQuery falls back to strict positional comparison
    // and any tie on the sort keys becomes a false rejection (the level 20
    // bug). Order by selected columns/aliases, not bare expressions.
    const expected = runReadOnlyQuery(db, level.solutionQuery);
    expect(extractOrderKeyIndices(level.solutionQuery, expected.columns)).not.toBeNull();
  });
});

describe.each(levels.filter((l) => /\blimit\s+\d+\s*$/i.test(l.solutionQuery)))(
  'level $id — $title',
  (level) => {
    it('LIMIT does not cut through a tie on the ORDER BY keys', () => {
      // If rows N and N+1 tie on the sort keys, which of them makes the
      // cut is arbitrary, so two correct queries can return different row
      // sets. Break the tie in the data or add a tie-breaker to the task.
      const match = level.solutionQuery.match(/^([\s\S]*)\blimit\s+(\d+)\s*$/i)!;
      const limit = Number(match[2]);
      const full = runReadOnlyQuery(db, match[1]);
      if (full.values.length <= limit) return; // LIMIT never truncates
      const keys = extractOrderKeyIndices(level.solutionQuery, full.columns);
      expect(keys).not.toBeNull();
      const boundaryTie = keys!.every((k) =>
        valuesEqual(full.values[limit - 1][k], full.values[limit][k])
      );
      expect(boundaryTie).toBe(false);
    });
  }
);

describe('window-function determinism (seed-data invariants)', () => {
  it('level 36: no duplicate account balance straddles an NTILE(4) quartile boundary', () => {
    // NTILE splits tied rows across tiles by arbitrary row position; if a
    // duplicated balance lands on a quartile boundary, which account gets
    // which quartile is undefined and correct answers diverge.
    expect(
      rows(`WITH t AS (SELECT a.balance,
                              NTILE(4) OVER (ORDER BY a.balance DESC) AS quartile
                         FROM accounts a
                         JOIN customers c ON a.customer_id = c.customer_id)
            SELECT balance FROM t GROUP BY balance HAVING COUNT(DISTINCT quartile) > 1`)
    ).toEqual([]);
  });

  it('level 64: no duplicate loan principal straddles an NTILE(4) tranche boundary', () => {
    expect(
      rows(`WITH t AS (SELECT principal_amount,
                              NTILE(4) OVER (ORDER BY principal_amount DESC) AS tranche
                         FROM loans)
            SELECT principal_amount FROM t
             GROUP BY principal_amount HAVING COUNT(DISTINCT tranche) > 1`)
    ).toEqual([]);
  });

  it('level 37: each account has exactly one transaction on its earliest date', () => {
    // ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY transaction_date)
    // filtered to rn = 1 — with two transactions on the earliest date,
    // "the first transaction" (its amount/category) is undefined.
    expect(
      rows(`SELECT t.account_id
              FROM transactions t
              JOIN (SELECT account_id, MIN(transaction_date) AS d
                      FROM transactions GROUP BY account_id) f
                ON t.account_id = f.account_id AND t.transaction_date = f.d
             GROUP BY t.account_id HAVING COUNT(*) > 1`)
    ).toEqual([]);
  });

  it('level 60: departure dates are unique per vessel', () => {
    // LEAD(departure_date) OVER (PARTITION BY vessel_id ORDER BY
    // departure_date) — duplicate dates make the idle-day pairing arbitrary.
    expect(
      rows(`SELECT vessel_id, departure_date FROM cargo_shipments
             GROUP BY vessel_id, departure_date HAVING COUNT(*) > 1`)
    ).toEqual([]);
  });
});

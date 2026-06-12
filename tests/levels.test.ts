import { beforeAll, describe, expect, it } from 'vitest';
import initSqlJs, { type Database } from 'sql.js';
import { levels } from '@/data/levels';
import { seedDatabase } from '@/lib/seed';
import { runReadOnlyQuery, assertReadOnlyQuery } from '@/lib/sqlRunner';
import { compareResults, extractOrderKeyIndices, solutionRequiresOrder } from '@/lib/validator';
import type { Epoch, QueryResult } from '@/types';

let db: Database;

beforeAll(async () => {
  const SQL = await initSqlJs();
  db = new SQL.Database();
  seedDatabase(db);
});

describe('level catalog integrity', () => {
  it('has unique, contiguous ids starting at 1', () => {
    expect(levels.map((l) => l.id)).toEqual(levels.map((_, i) => i + 1));
  });

  it('keeps epochs contiguous and in difficulty order', () => {
    const order: Epoch[] = ['Foundational', 'Intermediate', 'Advanced', 'Expert'];
    const seen = levels.map((l) => l.epoch).filter((e, i, arr) => i === 0 || arr[i - 1] !== e);
    expect(seen).toEqual(order.filter((e) => seen.includes(e)));
  });
});

describe.each(levels)('level $id — $title', (level) => {
  let expected: QueryResult;

  it('solution query is read-only and executes', () => {
    expect(() => assertReadOnlyQuery(level.solutionQuery)).not.toThrow();
    expected = runReadOnlyQuery(db, level.solutionQuery);
  });

  it('solution returns a non-empty result', () => {
    expect(expected.columns.length).toBeGreaterThan(0);
    expect(expected.values.length).toBeGreaterThan(0);
  });

  it('solution validates against itself', () => {
    const orderMatters = level.orderMatters ?? solutionRequiresOrder(level.solutionQuery);
    expect(compareResults(expected, expected, orderMatters)).toBeNull();
  });

  it('seed query is not already a passing answer', () => {
    let seedResult: QueryResult;
    try {
      seedResult = runReadOnlyQuery(db, level.seedQuery);
    } catch {
      return; // seed scaffold doesn't even parse — that's fine
    }
    const orderMatters = level.orderMatters ?? solutionRequiresOrder(level.solutionQuery);
    const orderKeys = orderMatters
      ? extractOrderKeyIndices(level.solutionQuery, expected.columns)
      : null;
    expect(compareResults(seedResult, expected, orderMatters, orderKeys)).not.toBeNull();
  });
});

describe('order-only ties accept any tie order (level 20 regression)', () => {
  it('accepts a correct query whose tied rows come out in a different order', () => {
    const level = levels.find((l) => l.id === 20)!;
    const userQuery = `SELECT
  customer_name,
  count(distinct account_id) as account_count
  FROM customers c
  JOIN accounts a ON c.customer_id = a.customer_id
 GROUP BY customer_name
HAVING account_count > 1
 ORDER BY account_count desc`;
    const expected = runReadOnlyQuery(db, level.solutionQuery);
    const user = runReadOnlyQuery(db, userQuery);
    const orderMatters = level.orderMatters ?? solutionRequiresOrder(level.solutionQuery);
    const orderKeys = extractOrderKeyIndices(level.solutionQuery, expected.columns);
    expect(orderMatters).toBe(true);
    expect(orderKeys).toEqual([1]);
    expect(compareResults(user, expected, orderMatters, orderKeys)).toBeNull();
  });
});

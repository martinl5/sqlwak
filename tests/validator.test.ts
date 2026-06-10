import { describe, expect, it } from 'vitest';
import { compareResults, solutionRequiresOrder, valuesEqual } from '@/lib/validator';
import type { QueryResult } from '@/types';

const result = (columns: string[], values: unknown[][]): QueryResult => ({ columns, values });

describe('valuesEqual', () => {
  it('matches identical primitives and NULLs', () => {
    expect(valuesEqual(1, 1)).toBe(true);
    expect(valuesEqual('a', 'a')).toBe(true);
    expect(valuesEqual(null, null)).toBe(true);
    expect(valuesEqual(null, 0)).toBe(false);
    expect(valuesEqual(null, '')).toBe(false);
  });

  it('absorbs float arithmetic noise but not real differences', () => {
    expect(valuesEqual(0.1 + 0.2, 0.3)).toBe(true);
    expect(valuesEqual(1_000_000.0000001, 1_000_000.0000002)).toBe(true);
    expect(valuesEqual(1_000_000.0, 1_000_000.01)).toBe(false);
    expect(valuesEqual(2.5, 2.51)).toBe(false);
  });

  it('compares strings exactly — SQLite string equality is case-sensitive', () => {
    expect(valuesEqual('Active', 'active')).toBe(false);
    expect(valuesEqual(' Active', 'Active')).toBe(false);
  });

  it('does not coerce across types', () => {
    expect(valuesEqual('600', 600)).toBe(false);
  });
});

describe('compareResults', () => {
  const expected = result(['name', 'balance'], [['Tan', 100], ['Lim', 50]]);

  it('passes an exact match', () => {
    expect(compareResults(result(['name', 'balance'], [['Tan', 100], ['Lim', 50]]), expected, true)).toBeNull();
  });

  it('accepts any column-name casing', () => {
    expect(compareResults(result(['NAME', 'Balance'], [['Tan', 100], ['Lim', 50]]), expected, true)).toBeNull();
  });

  it('rejects wrong column names with a specific message', () => {
    const msg = compareResults(result(['name', 'amount'], [['Tan', 100], ['Lim', 50]]), expected, true);
    expect(msg).toContain('balance');
    expect(msg).toContain('amount');
  });

  it('rejects a column-count mismatch with a specific message', () => {
    const msg = compareResults(result(['name'], [['Tan'], ['Lim']]), expected, true);
    expect(msg).toContain('2 column(s)');
  });

  it('rejects a row-count mismatch with a specific message', () => {
    const msg = compareResults(result(['name', 'balance'], [['Tan', 100]]), expected, true);
    expect(msg).toContain('1 row(s)');
    expect(msg).toContain('2');
  });

  it('accepts reordered rows when order does not matter', () => {
    const reordered = result(['name', 'balance'], [['Lim', 50], ['Tan', 100]]);
    expect(compareResults(reordered, expected, false)).toBeNull();
    expect(compareResults(reordered, expected, true)).not.toBeNull();
  });

  it('points at ORDER BY when ordered values mismatch positionally', () => {
    const reordered = result(['name', 'balance'], [['Lim', 50], ['Tan', 100]]);
    expect(compareResults(reordered, expected, true)).toContain('ORDER BY');
  });

  it('rejects wrong values even as a multiset', () => {
    const wrong = result(['name', 'balance'], [['Tan', 100], ['Lim', 51]]);
    expect(compareResults(wrong, expected, false)).not.toBeNull();
  });
});

describe('solutionRequiresOrder', () => {
  it('detects a top-level ORDER BY', () => {
    expect(solutionRequiresOrder('SELECT a FROM t ORDER BY a')).toBe(true);
  });

  it('ignores ORDER BY inside window functions and subqueries', () => {
    expect(solutionRequiresOrder('SELECT RANK() OVER (ORDER BY a) FROM t')).toBe(false);
    expect(solutionRequiresOrder('SELECT * FROM (SELECT a FROM t ORDER BY a)')).toBe(false);
  });

  it('ignores ORDER BY inside string literals', () => {
    expect(solutionRequiresOrder("SELECT 'order by x' FROM t")).toBe(false);
  });

  it('detects ORDER BY after a CTE', () => {
    expect(solutionRequiresOrder('WITH c AS (SELECT a FROM t) SELECT * FROM c ORDER BY a')).toBe(true);
  });
});

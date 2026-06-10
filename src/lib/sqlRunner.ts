import type { Database } from 'sql.js';
import type { QueryResult } from '@/types';

/**
 * Strips SQL comments and string/identifier literals so structural checks
 * (leading keyword, top-level clauses) can't be fooled by their contents.
 */
function stripCommentsAndLiterals(sql: string): string {
  return sql
    .replace(/'(?:[^']|'')*'/g, "''")
    .replace(/"(?:[^"]|"")*"/g, '""')
    .replace(/--[^\n]*/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ');
}

/**
 * The game only ever needs to read data: every level is answered with a
 * SELECT (optionally prefixed by WITH). Anything else — DML, DDL, PRAGMA,
 * ATTACH — would mutate or reconfigure the shared in-memory database and
 * silently corrupt validation for the rest of the session.
 */
export function assertReadOnlyQuery(sql: string): void {
  const stripped = stripCommentsAndLiterals(sql).trim();
  if (!/^(SELECT|WITH)\b/i.test(stripped)) {
    throw new Error(
      'Only read-only queries are allowed in the terminal. Start your query with SELECT (or WITH for CTEs).'
    );
  }
  // db.prepare() only compiles the first statement; reject trailing ones so a
  // second statement is never silently ignored. (A ';' inside a string
  // literal is already masked out above.)
  if (/;\s*\S/.test(stripped)) {
    throw new Error('Run one SQL statement at a time.');
  }
}

/**
 * Executes a single read-only statement and returns its full result set.
 * Uses prepare/step rather than db.exec so exactly one statement runs.
 */
export function runReadOnlyQuery(db: Database, sql: string): QueryResult {
  assertReadOnlyQuery(sql);
  const stmt = db.prepare(sql);
  try {
    const columns = stmt.getColumnNames();
    const values: unknown[][] = [];
    while (stmt.step()) {
      values.push(stmt.get());
    }
    return { columns, values };
  } finally {
    stmt.free();
  }
}

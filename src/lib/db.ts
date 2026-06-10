import type { Database, SqlJsStatic } from 'sql.js';
import { seedDatabase } from './seed';
import { runReadOnlyQuery } from './sqlRunner';
import type { QueryResult } from '@/types';

// sql.js is loaded as a classic script from /vendor/sqljs (copied out of
// node_modules by scripts/sync-sql-assets.mjs on dev/build), keeping the
// wasm runtime version-locked to package.json and off third-party CDNs.
// A script tag is used instead of a bundler import because sql.js's UMD
// wrapper probes for Node's fs/path modules, which browser bundles reject.
const SQL_JS_BASE = '/vendor/sqljs';

type InitSqlJs = (config?: { locateFile?: (file: string) => string }) => Promise<SqlJsStatic>;

// The script tag below defines window.initSqlJs; @types/sql.js already
// declares a UMD global of the same name, so probe via a cast instead of
// augmenting Window.
function getInitSqlJs(): InitSqlJs | undefined {
  return (window as unknown as { initSqlJs?: InitSqlJs }).initSqlJs;
}

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;
let seedSnapshot: Uint8Array | null = null;
let initPromise: Promise<Database> | null = null;

function loadSqlJs(): Promise<SqlJsStatic> {
  return new Promise((resolve, reject) => {
    const boot = () => {
      const init = getInitSqlJs();
      if (!init) {
        reject(new Error('initSqlJs not found on window'));
        return;
      }
      init({ locateFile: (file) => `${SQL_JS_BASE}/${file}` })
        .then(resolve)
        .catch(reject);
    };
    if (getInitSqlJs()) {
      boot();
      return;
    }
    const script = document.createElement('script');
    script.src = `${SQL_JS_BASE}/sql-wasm.js`;
    script.onload = boot;
    script.onerror = () => reject(new Error('Failed to load the SQL engine script'));
    document.head.appendChild(script);
  });
}

export async function initDatabase(): Promise<Database> {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (!SQL) SQL = await loadSqlJs();
    const fresh = new SQL.Database();
    seedDatabase(fresh);
    // Snapshot the pristine state so resetDatabase() is instant.
    seedSnapshot = fresh.export();
    db = fresh;
    return db;
  })();

  return initPromise;
}

/** Restores the database to its freshly-seeded state. */
export function resetDatabase(): Database {
  if (!SQL || !seedSnapshot) throw new Error('Database not initialized');
  db?.close();
  db = new SQL.Database(seedSnapshot);
  return db;
}

/**
 * Executes a single read-only statement against the game database.
 * Mutating statements are rejected — see sqlRunner.ts.
 */
export function executeQuery(sql: string): QueryResult {
  if (!db) throw new Error('Database not initialized');
  return runReadOnlyQuery(db, sql);
}

export function getDatabase(): Database | null {
  return db;
}

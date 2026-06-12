// Copies third-party runtime assets out of node_modules into public/ so the
// game serves the exact versions pinned in package.json instead of CDN
// builds (no outage/CSP/supply-chain exposure for the core experience).
// Runs automatically via the predev/prebuild npm hooks.
import { copyFileSync, cpSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// sql.js — the in-browser SQLite engine
const sqlSrc = join(root, 'node_modules', 'sql.js', 'dist');
const sqlDest = join(root, 'public', 'vendor', 'sqljs');
mkdirSync(sqlDest, { recursive: true });
for (const file of ['sql-wasm.js', 'sql-wasm.wasm']) {
  copyFileSync(join(sqlSrc, file), join(sqlDest, file));
}
console.log(`Copied sql.js runtime to ${sqlDest}`);

// monaco-editor — the SQL editor itself (otherwise pulled from jsdelivr at
// runtime, taking the whole terminal down whenever the CDN is unreachable)
const monacoSrc = join(root, 'node_modules', 'monaco-editor', 'min', 'vs');
const monacoDest = join(root, 'public', 'vendor', 'monaco', 'vs');
cpSync(monacoSrc, monacoDest, { recursive: true });
console.log(`Copied monaco-editor runtime to ${monacoDest}`);

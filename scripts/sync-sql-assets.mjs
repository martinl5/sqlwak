// Copies the sql.js runtime out of node_modules into public/ so the game
// serves the exact version pinned in package.json instead of a CDN build.
// Runs automatically via the predev/prebuild npm hooks.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', 'sql.js', 'dist');
const dest = join(root, 'public', 'vendor', 'sqljs');

mkdirSync(dest, { recursive: true });
for (const file of ['sql-wasm.js', 'sql-wasm.wasm']) {
  copyFileSync(join(src, file), join(dest, file));
}
console.log(`Copied sql.js runtime to ${dest}`);

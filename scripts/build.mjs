// Prepare only the browser application for static hosting. No package install required.
import {copyFile, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const assets = [
  'index.html', 'styles.css', 'favicon.svg',
  'engine.js', 'advanced.js', 'parser.js', 'storage.js', 'exports.js', 'app.js',
];

// Validate references before replacing the previous generated output.
const html = await readFile(path.join(root, 'index.html'), 'utf8');
for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  const target = match[1];
  if (target.startsWith('#')) continue;
  if (!assets.includes(target)) {
    throw new Error(`Unexpected application asset reference: ${target}`);
  }
}
await Promise.all(assets.map(file => readFile(path.join(root, file))));
await rm(dist, {recursive: true, force: true});
await mkdir(dist, {recursive: true});
for (const file of assets) await copyFile(path.join(root, file), path.join(dist, file));
await writeFile(path.join(dist, '.nojekyll'), '');
console.log(`Static website ready: dist/ (${assets.length} application files).`);

import { cp, mkdir, rm, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const out = new URL('../www/', import.meta.url);
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const excluded = new Set(['.git','node_modules','android','ios','www','scripts']);
const files = await readdir(new URL('../', import.meta.url), { withFileTypes: true });
for (const f of files) {
  if (excluded.has(f.name)) continue;
  if (['server.mjs','start.command','package.json','package-lock.json','capacitor.config.json','README.md'].includes(f.name)) continue;
  const src = new URL('../' + f.name, import.meta.url);
  const dest = new URL('../www/' + f.name, import.meta.url);
  await cp(src, dest, { recursive: true });
}
console.log('Abu Shreek web assets prepared in www/.');
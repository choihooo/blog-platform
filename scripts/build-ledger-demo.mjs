import { build } from 'esbuild';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'demos/personal-ledger/src');
const output = resolve(root, 'public/demos/personal-ledger');
await mkdir(output, { recursive: true });
await build({
  absWorkingDir: root, entryPoints: [resolve(source, 'entry.tsx')], outfile: resolve(output, 'app.js'),
  bundle: true, minify: true, platform: 'browser', format: 'iife', target: 'es2020',
  define: { 'process.env.NODE_ENV': '"production"' }, jsx: 'automatic',
});
const cssPath = resolve(source, 'app.css');
// Disable automatic scanning of unrelated blog/archived sources.
const css = (await readFile(cssPath, 'utf8')).replace('@import "tailwindcss";', '@import "tailwindcss" source(none);\n@source "./";');
const result = await postcss([tailwind({ base: source, optimize: true })]).process(css, { from: cssPath, to: resolve(output, 'app.css') });
await writeFile(resolve(output, 'app.css'), result.css);
await copyFile(resolve(root, 'app/fonts/suit/SUIT-Variable.woff2'), resolve(output, 'suit.woff2'));
await writeFile(resolve(output, 'index.html'), `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'none'; worker-src 'none'; form-action 'none'; base-uri 'none'"><title>가계부 체험 · 예시 데이터</title><link rel="stylesheet" href="./app.css"><script src="./app.js" defer></script></head><body><div id="root"></div><noscript>가계부 체험에는 JavaScript가 필요합니다.</noscript></body></html>`);
console.log('Ledger demo built: /demos/personal-ledger/index.html');

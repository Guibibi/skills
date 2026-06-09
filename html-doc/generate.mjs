#!/usr/bin/env node
// html-doc generator
// Reads a compact component-JSON document and writes a self-contained HTML file.
//
//   node generate.mjs doc.json --out report.html
//   node generate.mjs doc.json > report.html
//   cat doc.json | node generate.mjs --out report.html
//   node generate.mjs doc.json --check        (validate only, no output)
//
// Document shape:
//   { "title": "...", "subtitle"?: "...", "meta"?: {k:v}, "blocks": [ {t,...}, ... ] }
// See references/components.md for the full block vocabulary.

import { readFileSync, writeFileSync } from 'node:fs';
import { styles } from './lib/styles.mjs';
import { renderBlocks, prepare } from './lib/blocks.mjs';
import { inline, escapeHtml } from './lib/inline.mjs';

function parseArgs(argv) {
  const opts = { input: null, out: null, title: null, check: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out' || a === '-o') opts.out = argv[++i];
    else if (a === '--title') opts.title = argv[++i];
    else if (a === '--check') opts.check = true;
    else if (a === '--help' || a === '-h') opts.help = true;
    else if (!a.startsWith('-') && !opts.input) opts.input = a;
  }
  return opts;
}

function readInput(path) {
  // file path if given, otherwise stdin (fd 0)
  return readFileSync(path || 0, 'utf8');
}

function buildHtml(doc, titleOverride, ctx) {
  const title = titleOverride || doc.title || 'Document';
  const subtitle = doc.subtitle
    ? `<p class="subtitle">${inline(doc.subtitle)}</p>` : '';
  let metaStrip = '';
  if (doc.meta && typeof doc.meta === 'object') {
    const pairs = Object.keys(doc.meta).map((k) =>
      `<div class="pair"><span class="k">${inline(k)}</span><span class="v">${inline(doc.meta[k])}</span></div>`
    ).join('');
    if (pairs) metaStrip = `<div class="meta-strip">${pairs}</div>`;
  }

  const body = renderBlocks(doc.blocks, ctx);

  // Mermaid is loaded from a CDN, and only when a mermaid block is present, so
  // documents without diagrams stay fully self-contained.
  const mermaidScript = ctx.needsMermaid
    ? `\n<script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
</script>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${styles}</style>
</head>
<body>
<main class="doc">
<header class="doc-header">
<h1 class="title">${inline(title)}</h1>
${subtitle}
${metaStrip}
</header>
${body}
</main>${mermaidScript}
</body>
</html>
`;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    process.stdout.write('Usage: node generate.mjs <doc.json> [--out file.html] [--title "..."] [--check]\n');
    return;
  }

  let raw;
  try {
    raw = readInput(opts.input);
  } catch (e) {
    process.stderr.write(`error: cannot read input (${e.message})\n`);
    process.exit(1);
  }

  let doc;
  try {
    doc = JSON.parse(raw);
  } catch (e) {
    process.stderr.write(`error: invalid JSON — ${e.message}\n`);
    process.exit(1);
  }

  if (!doc || typeof doc !== 'object' || !Array.isArray(doc.blocks)) {
    process.stderr.write('error: document must be an object with a "blocks" array\n');
    process.exit(1);
  }

  const unknown = new Set();
  const ctx = { onUnknown: (t) => unknown.add(String(t)), headings: [] };
  prepare(doc.blocks, ctx); // assign heading ids + collect them for any toc block

  if (opts.check) {
    // render to nowhere just to collect unknown types
    renderBlocks(doc.blocks, ctx);
    if (unknown.size) {
      process.stderr.write(`unknown block types: ${[...unknown].join(', ')}\n`);
      process.exit(2);
    }
    process.stdout.write(`ok: ${doc.blocks.length} blocks, all types known\n`);
    return;
  }

  const html = buildHtml(doc, opts.title, ctx);
  if (unknown.size) {
    process.stderr.write(`warning: unknown block types rendered as placeholders: ${[...unknown].join(', ')}\n`);
  }

  if (opts.out) {
    writeFileSync(opts.out, html);
    process.stderr.write(`wrote ${opts.out}\n`);
  } else {
    process.stdout.write(html);
  }
}

main();

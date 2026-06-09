// Block renderers: one pure function per block type, each returning an HTML string.
// Text fields are run through inline() (escape + inline markdown). Structural fields
// are escaped directly. Unknown types render a visible placeholder rather than crash.
//
// Renderers receive (block, ctx). ctx carries:
//   - onUnknown(t): called for unrecognized block types
//   - headings: [{l, x, id}] collected by prepare(), used by the `toc` block
// A `prepare()` pre-pass assigns stable ids to heading blocks and collects them so a
// `toc` block placed anywhere can link to every heading.

import { inline, escapeHtml } from './inline.mjs';
import { renderArch } from './arch.mjs';

const CALLOUT_ICONS = { info: 'ℹ', note: '✎', success: '✓', warn: '⚠', error: '✕' };
const SEV_LABEL = { blocking: 'Blocking', warn: 'Warning', nit: 'Nit', info: 'Info' };

const CALLOUT_KINDS = new Set(['info', 'note', 'success', 'warn', 'error']);
const BADGE_KINDS = new Set(['info', 'note', 'success', 'warn', 'error', 'blocking', 'nit']);

function codeBlock(lang, x) {
  const label = lang ? `<span class="lang">${escapeHtml(lang)}</span>` : '';
  return `<pre>${label}<code>${escapeHtml(x)}</code></pre>`;
}

function fileChip(path, line, label) {
  const ln = line != null ? `:<span class="ln">${escapeHtml(line)}</span>` : '';
  const lbl = label ? `<span class="lbl">${inline(label)}</span>` : '';
  return `<span class="fileref">${escapeHtml(path)}${ln}${lbl}</span>`;
}

// strip markdown/inline markup to a plain slug for heading anchors
function slugify(text) {
  return String(text || '')
    .replace(/[`*_]/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';
}

const renderers = {
  h(b) {
    const l = Math.min(Math.max(parseInt(b.l, 10) || 1, 1), 3);
    const id = b._id ? ` id="${b._id}"` : '';
    const anchor = b._id ? `<a class="anchor" href="#${b._id}" aria-label="link">#</a>` : '';
    return `<h${l}${id}>${inline(b.x)}${anchor}</h${l}>`;
  },

  p(b) { return `<p>${inline(b.x)}</p>`; },

  ul(b) {
    const items = (b.items || []).map((it) => `<li>${inline(it)}</li>`).join('');
    return `<ul>${items}</ul>`;
  },

  ol(b) {
    const items = (b.items || []).map((it) => `<li>${inline(it)}</li>`).join('');
    return `<ol>${items}</ol>`;
  },

  code(b) { return codeBlock(b.lang, b.x); },

  quote(b) { return `<blockquote>${inline(b.x)}</blockquote>`; },

  hr() { return '<hr>'; },

  callout(b) {
    const k = CALLOUT_KINDS.has(b.k) ? b.k : 'note';
    const ico = CALLOUT_ICONS[k] || '';
    const title = b.title
      ? `<div class="ct"><span class="ico">${ico}</span>${inline(b.title)}</div>`
      : '';
    const body = b.x ? `<p>${inline(b.x)}</p>` : '';
    return `<div class="callout ${k}">${title}${body}</div>`;
  },

  badge(b) {
    const k = BADGE_KINDS.has(b.k) ? b.k : 'info';
    return `<span class="badge ${k}">${inline(b.x)}</span>`;
  },

  file(b) { return `<p>${fileChip(b.path, b.line, b.x)}</p>`; },

  diff(b) {
    const head = b.file ? `<div class="diff-head">${escapeHtml(b.file)}</div>` : '';
    const lines = (b.lines || []).map((raw) => {
      const line = String(raw);
      const c = line[0];
      let cls = 'ctx', text = line.slice(1);
      if (c === '+') cls = 'add';
      else if (c === '-') cls = 'del';
      else if (line.startsWith('@@')) { cls = 'hunk'; text = line; }
      else text = line.startsWith(' ') ? line.slice(1) : line;
      return `<div class="dl ${cls}">${escapeHtml(text)}</div>`;
    }).join('');
    return `<div class="diff">${head}${lines}</div>`;
  },

  finding(b) {
    const sev = ['blocking', 'warn', 'nit', 'info'].includes(b.sev) ? b.sev : 'info';
    const badge = `<span class="badge ${sev}">${SEV_LABEL[sev]}</span>`;
    const loc = b.file ? fileChip(b.file, b.line) : '';
    const body = [];
    if (b.x) body.push(`<p>${inline(b.x)}</p>`);
    if (b.code) body.push(codeBlock(b.code.lang, b.code.x));
    return `<div class="finding">` +
      `<div class="f-head">${badge}<span class="f-title">${inline(b.title)}</span>${loc}</div>` +
      `<div class="f-body">${body.join('')}</div>` +
      `</div>`;
  },

  table(b) {
    const cols = (b.cols || []).map((c) => `<th>${inline(c)}</th>`).join('');
    const rows = (b.rows || []).map((r) =>
      `<tr>${(r || []).map((cell) => `<td>${inline(cell)}</td>`).join('')}</tr>`
    ).join('');
    return `<table><thead><tr>${cols}</tr></thead><tbody>${rows}</tbody></table>`;
  },

  meta(b) {
    const items = b.items || {};
    const pairs = Object.keys(items).map((k) =>
      `<div class="pair"><span class="k">${inline(k)}</span><span class="v">${inline(items[k])}</span></div>`
    ).join('');
    return `<div class="meta-strip">${pairs}</div>`;
  },

  steps(b) {
    const items = (b.items || []).map((s) => {
      const status = s.status
        ? ` <span class="s-status badge ${statusKind(s.status)}">${inline(s.status)}</span>` : '';
      const body = s.x ? `<div class="s-body">${inline(s.x)}</div>` : '';
      return `<li><div class="s-title">${inline(s.title)}${status}</div>${body}</li>`;
    }).join('');
    return `<ol class="steps">${items}</ol>`;
  },

  stat(b) {
    const tiles = (b.items || []).map((it) => {
      const k = BADGE_KINDS.has(it.k) ? it.k : 'neutral';
      const delta = it.delta != null
        ? `<div class="stat-delta ${k}">${inline(it.delta)}</div>` : '';
      return `<div class="stat">` +
        `<div class="stat-value">${inline(it.value)}</div>` +
        `<div class="stat-label">${inline(it.label)}</div>` +
        `${delta}</div>`;
    }).join('');
    return `<div class="stat-row">${tiles}</div>`;
  },

  details(b, ctx) {
    return `<details><summary>${inline(b.summary)}</summary>` +
      `<div class="d-body">${renderBlocks(b.blocks, ctx)}</div></details>`;
  },

  columns(b, ctx) {
    const cols = (b.cols || []).map((col) => {
      const title = col.title ? `<div class="col-title">${inline(col.title)}</div>` : '';
      return `<div class="col">${title}${renderBlocks(col.blocks, ctx)}</div>`;
    }).join('');
    return `<div class="columns" style="--n:${(b.cols || []).length || 1}">${cols}</div>`;
  },

  toc(b, ctx) {
    const headings = (ctx && ctx.headings) || [];
    if (!headings.length) return '';
    const title = b.title ? inline(b.title) : 'Contents';
    const items = headings.map((h) =>
      `<li class="lvl-${h.l}"><a href="#${h.id}">${inline(h.x)}</a></li>`
    ).join('');
    return `<nav class="toc"><div class="toc-title">${title}</div><ul>${items}</ul></nav>`;
  },

  arch(b) { return renderArch(b); },

  mermaid(b, ctx) {
    // Diagram rendered client-side by Mermaid loaded from a CDN. Signals the
    // generator to inject the loader script (only when a mermaid block exists).
    // NOTE: unlike every other block, the output is NOT self-contained — it
    // needs internet at view time to fetch Mermaid and draw the diagram.
    if (ctx) ctx.needsMermaid = true;
    const caption = b.title ? `<div class="mermaid-caption">${inline(b.title)}</div>` : '';
    // Escaped source; Mermaid reads textContent, so entities decode back to the
    // real diagram syntax. The <pre> is a readable fallback if JS is blocked.
    return `<figure class="mermaid-figure"><pre class="mermaid">${escapeHtml(b.code || b.x || '')}</pre>${caption}</figure>`;
  },
};

function statusKind(status) {
  const s = String(status).toLowerCase();
  if (/done|complete|shipped|merged/.test(s)) return 'success';
  if (/block|fail|risk/.test(s)) return 'error';
  if (/progress|wip|review/.test(s)) return 'warn';
  return 'info';
}

// Pre-pass: assign stable, de-duplicated ids to heading blocks and collect them in
// document order (recursing into columns; details are collapsed so we skip them for
// the TOC). Mutates the heading blocks with `_id`.
export function prepare(blocks, ctx) {
  const c = ctx || { headings: [], _seen: new Map() };
  if (!c._seen) c._seen = new Map();
  if (!c.headings) c.headings = [];
  if (!Array.isArray(blocks)) return c;
  for (const b of blocks) {
    if (!b || typeof b !== 'object') continue;
    if (b.t === 'h') {
      let base = slugify(b.x);
      const n = c._seen.get(base) || 0;
      c._seen.set(base, n + 1);
      b._id = n ? `${base}-${n}` : base;
      c.headings.push({ l: Math.min(Math.max(parseInt(b.l, 10) || 1, 1), 3), x: b.x, id: b._id });
    } else if (b.t === 'columns' && Array.isArray(b.cols)) {
      for (const col of b.cols) prepare(col.blocks, c);
    }
  }
  return c;
}

export function renderBlock(block, ctx) {
  if (!block || typeof block !== 'object') return '';
  const fn = renderers[block.t];
  if (!fn) {
    if (ctx && ctx.onUnknown) ctx.onUnknown(block.t);
    return `<div class="unknown-block">⚠ unknown block type: ${escapeHtml(block.t)}</div>`;
  }
  return fn(block, ctx);
}

export function renderBlocks(blocks, ctx) {
  if (!Array.isArray(blocks)) return '';
  return blocks.map((b) => renderBlock(b, ctx)).join('\n');
}

export const KNOWN_TYPES = Object.keys(renderers);

// Architecture graph -> inline SVG (self-contained, no library).
// Nodes are placed on a grid: explicit `c` (column) / `r` (row) coords when given,
// otherwise a simple BFS auto-layering (roots at row 0, children one row deeper).
// Edges are drawn as orthogonal elbow connectors with arrowheads.

import { escapeHtml } from './inline.mjs';

const COL = {
  slate: '#141413', gray700: '#3D3D3A', gray500: '#87867F',
  gray300: '#D1CFC5', gray150: '#F0EEE6', white: '#FFFFFF',
  clay: '#D97757', olive: '#788C5D', rust: '#B04A3F', oat: '#E3DACC',
};

// node tint by kind `k`
const KIND_FILL = {
  primary: '#FBEDE6', // clay tint
  client:  '#F0EEE6',
  service: '#FFFFFF',
  store:   '#F3EEE3', // oat tint
  db:      '#F3EEE3',
  external:'#F0EEE6',
  success: '#EDF0E7', // olive tint
  warn:    '#FBEDE6',
};
const KIND_STROKE = {
  primary: COL.clay, store: '#B79B6F', db: '#B79B6F',
  success: COL.olive, warn: COL.clay,
};

const BASE_NODE_H = 46;
const LINE_H = 16;       // per text line inside a node
const GAP_X = 46;
const GAP_Y = 40;
const PAD = 12;

let archSeq = 0; // unique marker ids when several arch blocks share a page

// A label may contain newlines (real `\n` from JSON); render each as its own line.
function labelLines(label) {
  return String(label ?? '').split(/\r?\n/);
}

function nodeWidth(label) {
  const longest = labelLines(label).reduce((m, l) => Math.max(m, l.length), 0);
  return Math.min(240, Math.max(110, longest * 7.4 + 28));
}

function autoLayer(nodes, edges) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const indeg = new Map(nodes.map((n) => [n.id, 0]));
  for (const e of edges) if (indeg.has(e.to)) indeg.set(e.to, indeg.get(e.to) + 1);

  const depth = new Map();
  const queue = nodes.filter((n) => (indeg.get(n.id) || 0) === 0).map((n) => n.id);
  queue.forEach((id) => depth.set(id, 0));
  // relax depths along edges (handles DAGs; cycles settle at first-seen depth)
  let guard = 0;
  const q = [...queue];
  while (q.length && guard++ < nodes.length * edges.length + nodes.length + 1) {
    const id = q.shift();
    const d = depth.get(id) || 0;
    for (const e of edges) {
      if (e.from === id && byId.has(e.to)) {
        const nd = d + 1;
        if (nd > (depth.get(e.to) ?? -1)) { depth.set(e.to, nd); q.push(e.to); }
      }
    }
  }
  // any node never reached -> row 0
  const rowOf = new Map();
  for (const n of nodes) rowOf.set(n.id, depth.get(n.id) || 0);

  // assign columns by encounter order within each row
  const colCounter = new Map();
  const colOf = new Map();
  for (const n of nodes) {
    const r = rowOf.get(n.id);
    const c = colCounter.get(r) || 0;
    colOf.set(n.id, c);
    colCounter.set(r, c + 1);
  }
  return { rowOf, colOf };
}

export function renderArch(block) {
  const nodes = Array.isArray(block.nodes) ? block.nodes : [];
  const edges = Array.isArray(block.edges) ? block.edges : [];
  if (!nodes.length) return '<div class="unknown-block">⚠ arch block has no nodes</div>';

  const mid = `arrow${archSeq++}`;
  const explicit = nodes.some((n) => n.c != null || n.r != null);
  let rowOf, colOf;
  if (explicit) {
    rowOf = new Map(nodes.map((n) => [n.id, parseInt(n.r, 10) || 0]));
    colOf = new Map(nodes.map((n) => [n.id, parseInt(n.c, 10) || 0]));
  } else {
    ({ rowOf, colOf } = autoLayer(nodes, edges));
  }

  // Uniform node height sized to the tallest (multi-line) label, so the grid
  // math stays simple and boxes line up.
  const maxLines = Math.max(1, ...nodes.map((n) => labelLines(n.label).length));
  const NODE_H = Math.max(BASE_NODE_H, maxLines * LINE_H + 18);

  // per-column max width to lay out x without overlap
  const widths = new Map(nodes.map((n) => [n.id, nodeWidth(n.label)]));
  const colMaxW = new Map();
  for (const n of nodes) {
    const c = colOf.get(n.id);
    colMaxW.set(c, Math.max(colMaxW.get(c) || 0, widths.get(n.id)));
  }
  const cols = [...colMaxW.keys()].sort((a, b) => a - b);
  const colX = new Map();
  let x = PAD;
  for (const c of cols) { colX.set(c, x); x += colMaxW.get(c) + GAP_X; }
  const totalW = x - GAP_X + PAD;

  const maxRow = Math.max(0, ...nodes.map((n) => rowOf.get(n.id)));
  const rowY = (r) => PAD + r * (NODE_H + GAP_Y);
  const totalH = rowY(maxRow) + NODE_H + PAD;

  // geometry per node
  const geo = new Map();
  for (const n of nodes) {
    const w = widths.get(n.id);
    const cw = colMaxW.get(colOf.get(n.id));
    const nx = colX.get(colOf.get(n.id)) + (cw - w) / 2;
    const ny = rowY(rowOf.get(n.id));
    geo.set(n.id, { x: nx, y: ny, w, h: NODE_H, cx: nx + w / 2, cy: ny + NODE_H / 2 });
  }

  // edges
  const edgeSvg = edges.map((e) => {
    const a = geo.get(e.from), b = geo.get(e.to);
    if (!a || !b) return '';
    let path, lx, ly;
    if (b.y > a.y + 1) { // target below
      const my = (a.y + a.h + b.y) / 2;
      path = `M${a.cx},${a.y + a.h} L${a.cx},${my} L${b.cx},${my} L${b.cx},${b.y}`;
      lx = (a.cx + b.cx) / 2; ly = my;
    } else if (b.y < a.y - 1) { // target above
      const my = (a.y + (b.y + b.h)) / 2;
      path = `M${a.cx},${a.y} L${a.cx},${my} L${b.cx},${my} L${b.cx},${b.y + b.h}`;
      lx = (a.cx + b.cx) / 2; ly = my;
    } else { // same row
      const right = b.cx >= a.cx;
      const ax = right ? a.x + a.w : a.x;
      const bx = right ? b.x : b.x + b.w;
      const mx = (ax + bx) / 2;
      path = `M${ax},${a.cy} L${mx},${a.cy} L${mx},${b.cy} L${bx},${b.cy}`;
      lx = mx; ly = (a.cy + b.cy) / 2;
    }
    // Edge labels stay single-line; collapse any newlines so the pill sizes right.
    const el = e.label != null ? String(e.label).replace(/\s*\r?\n\s*/g, ' ') : '';
    const label = el
      ? `<rect x="${lx - el.length * 3.4 - 4}" y="${ly - 9}" width="${el.length * 6.8 + 8}" height="18" rx="4" fill="${COL.gray150}" stroke="${COL.gray300}"/>` +
        `<text x="${lx}" y="${ly + 3}" text-anchor="middle" font-size="11" fill="${COL.gray700}">${escapeHtml(el)}</text>`
      : '';
    return `<path d="${path}" fill="none" stroke="${COL.gray500}" stroke-width="1.5" marker-end="url(#${mid})"/>${label}`;
  }).join('');

  // nodes
  const nodeSvg = nodes.map((n) => {
    const g = geo.get(n.id);
    const fill = KIND_FILL[n.k] || COL.white;
    const stroke = KIND_STROKE[n.k] || COL.gray300;
    // Center the block of lines vertically around the node's mid-line.
    const lines = labelLines(n.label);
    const startY = g.cy + 4 - ((lines.length - 1) * LINE_H) / 2;
    const tspans = lines.map((ln, i) =>
      `<tspan x="${g.cx.toFixed(1)}" y="${(startY + i * LINE_H).toFixed(1)}">${escapeHtml(ln)}</tspan>`
    ).join('');
    return `<g>` +
      `<rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>` +
      `<text text-anchor="middle" font-size="13" font-weight="500" fill="${COL.slate}" font-family="system-ui, sans-serif">${tspans}</text>` +
      `</g>`;
  }).join('');

  const title = block.title ? `<div class="arch-title">${escapeHtml(block.title)}</div>` : '';
  return `<div class="arch">${title}` +
    `<svg viewBox="0 0 ${Math.ceil(totalW)} ${Math.ceil(totalH)}" width="${Math.ceil(totalW)}" role="img">` +
    `<defs><marker id="${mid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">` +
    `<path d="M0,0 L10,5 L0,10 z" fill="${COL.gray500}"/></marker></defs>` +
    `${edgeSvg}${nodeSvg}</svg></div>`;
}

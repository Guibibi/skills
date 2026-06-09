// Self-contained CSS for the generated document.
// Design tokens ported from the Anthropic "html-effectiveness" reference pages:
// clean reading document, ivory/slate/clay palette, serif headings, system fonts
// (no web fonts, no CDN for the core document — output works offline / over
// file://; the optional `mermaid` block is the lone exception and loads from a
// CDN at view time).

export const styles = `
:root {
  --ivory:    #FAF9F5;
  --white:    #FFFFFF;
  --oat:      #E3DACC;
  --gray-150: #F0EEE6;
  --gray-300: #D1CFC5;
  --gray-500: #87867F;
  --gray-700: #3D3D3A;
  --slate:    #141413;
  --clay:     #D97757;
  --olive:    #788C5D;
  --rust:     #B04A3F;

  --sans: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --serif: ui-serif, Georgia, 'Times New Roman', serif;
  --mono: ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, monospace;

  --radius-panel: 12px;
  --radius-row: 8px;
  --border: 1.5px solid var(--gray-300);
}

* { box-sizing: border-box; }

html { background: var(--ivory); }

body {
  margin: 0;
  padding: 56px 24px 96px;
  font-family: var(--sans);
  font-size: 16px;
  line-height: 1.65;
  color: var(--gray-700);
  -webkit-font-smoothing: antialiased;
}

.doc { max-width: 760px; margin: 0 auto; }

/* ——— document header ——— */
.doc-header { margin-bottom: 40px; }
.doc-header h1.title {
  font-family: var(--serif);
  font-weight: 600;
  font-size: 34px;
  line-height: 1.2;
  color: var(--slate);
  margin: 0 0 8px;
  letter-spacing: -0.01em;
}
.doc-header .subtitle {
  font-size: 18px;
  color: var(--gray-500);
  margin: 0 0 20px;
}
.meta-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  padding: 14px 18px;
  background: var(--gray-150);
  border: var(--border);
  border-radius: var(--radius-row);
  font-size: 14px;
}
.meta-strip .pair { display: flex; gap: 6px; }
.meta-strip .pair .k { color: var(--gray-500); }
.meta-strip .pair .v { color: var(--slate); font-weight: 500; }

/* ——— headings ——— */
h1, h2, h3 {
  font-family: var(--serif);
  font-weight: 600;
  color: var(--slate);
  line-height: 1.25;
  letter-spacing: -0.01em;
}
h1 { font-size: 28px; margin: 44px 0 14px; }
h2 { font-size: 22px; margin: 38px 0 12px; padding-bottom: 8px; border-bottom: var(--border); }
h3 { font-size: 18px; margin: 28px 0 10px; }
h1, h2, h3 { scroll-margin-top: 16px; }
.anchor {
  margin-left: 8px; font-family: var(--mono); font-size: 0.7em; font-weight: 400;
  color: var(--gray-300); border: none; opacity: 0; transition: opacity .12s;
}
h1:hover .anchor, h2:hover .anchor, h3:hover .anchor { opacity: 1; }
.anchor:hover { color: var(--clay); }

/* ——— table of contents ——— */
.toc {
  margin: 0 0 28px; padding: 16px 20px;
  background: var(--gray-150); border: var(--border); border-radius: var(--radius-row);
}
.toc-title {
  font-family: var(--mono); font-size: 12px; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--gray-500); margin-bottom: 8px;
}
.toc ul { list-style: none; margin: 0; padding: 0; }
.toc li { margin: 3px 0; }
.toc li a { color: var(--gray-700); border: none; }
.toc li a:hover { color: var(--clay); }
.toc li.lvl-2 { padding-left: 16px; }
.toc li.lvl-3 { padding-left: 32px; font-size: 0.92em; }

/* ——— text ——— */
p { margin: 0 0 16px; }
a { color: var(--clay); text-decoration: none; border-bottom: 1px solid color-mix(in srgb, var(--clay) 35%, transparent); }
a:hover { border-bottom-color: var(--clay); }
strong { color: var(--slate); font-weight: 600; }

ul, ol { margin: 0 0 16px; padding-left: 26px; }
li { margin: 4px 0; }
li::marker { color: var(--gray-500); }

blockquote {
  margin: 0 0 16px;
  padding: 4px 18px;
  border-left: 3px solid var(--clay);
  color: var(--gray-700);
  font-style: italic;
}

hr { border: none; border-top: var(--border); margin: 32px 0; }

/* ——— inline + block code ——— */
code {
  font-family: var(--mono);
  font-size: 0.88em;
  background: var(--gray-150);
  border: 1px solid var(--gray-300);
  border-radius: 5px;
  padding: 1px 5px;
}
pre {
  margin: 0 0 18px;
  background: var(--slate);
  border-radius: var(--radius-row);
  overflow: auto;
}
pre .lang {
  display: block;
  padding: 7px 14px;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--gray-300);
  background: rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
pre code {
  display: block;
  padding: 14px;
  background: none;
  border: none;
  border-radius: 0;
  color: var(--gray-150);
  font-size: 13px;
  line-height: 1.6;
}

/* ——— callouts ——— */
.callout {
  margin: 0 0 18px;
  padding: 14px 16px 14px 18px;
  border: var(--border);
  border-left-width: 4px;
  border-radius: var(--radius-row);
  background: var(--white);
}
.callout .ct { font-weight: 600; color: var(--slate); margin-bottom: 4px; display: flex; align-items: center; gap: 7px; }
.callout p:last-child { margin-bottom: 0; }
.callout .ico { font-size: 14px; }
.callout.info    { border-left-color: var(--clay); background: color-mix(in srgb, var(--clay) 5%, var(--white)); }
.callout.note    { border-left-color: var(--gray-500); background: var(--gray-150); }
.callout.success { border-left-color: var(--olive); background: color-mix(in srgb, var(--olive) 7%, var(--white)); }
.callout.warn    { border-left-color: #C8922A; background: color-mix(in srgb, #C8922A 8%, var(--white)); }
.callout.error   { border-left-color: var(--rust); background: color-mix(in srgb, var(--rust) 6%, var(--white)); }

/* ——— badges ——— */
.badge {
  display: inline-block;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: 100px;
  border: 1px solid transparent;
  vertical-align: middle;
}
.badge.info, .badge.note { background: var(--gray-150); color: var(--gray-700); border-color: var(--gray-300); }
.badge.success { background: color-mix(in srgb, var(--olive) 16%, var(--white)); color: var(--olive); border-color: var(--olive); }
.badge.warn    { background: color-mix(in srgb, #C8922A 16%, var(--white)); color: #946a13; border-color: #C8922A; }
.badge.error, .badge.blocking { background: color-mix(in srgb, var(--rust) 14%, var(--white)); color: var(--rust); border-color: var(--rust); }
.badge.nit     { background: var(--oat); color: var(--gray-700); border-color: var(--gray-300); }

/* ——— file reference chip ——— */
.fileref {
  display: inline-flex;
  align-items: baseline;
  gap: 1px;
  font-family: var(--mono);
  font-size: 13px;
  background: var(--gray-150);
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  padding: 2px 8px;
  color: var(--slate);
}
.fileref .ln { color: var(--clay); }
.fileref .lbl { color: var(--gray-500); margin-left: 6px; font-family: var(--sans); }

/* ——— diff ——— */
.diff {
  margin: 0 0 18px;
  border: var(--border);
  border-radius: var(--radius-row);
  overflow: hidden;
  font-family: var(--mono);
  font-size: 13px;
}
.diff .diff-head {
  padding: 7px 14px;
  background: var(--gray-150);
  border-bottom: var(--border);
  color: var(--gray-700);
  font-weight: 600;
}
.diff .dl { padding: 1px 14px; white-space: pre-wrap; word-break: break-word; }
.diff .dl.add { background: color-mix(in srgb, var(--olive) 12%, var(--white)); }
.diff .dl.add::before { content: '+ '; color: var(--olive); }
.diff .dl.del { background: color-mix(in srgb, var(--rust) 10%, var(--white)); }
.diff .dl.del::before { content: '- '; color: var(--rust); }
.diff .dl.ctx { color: var(--gray-500); }
.diff .dl.ctx::before { content: '  '; }
.diff .dl.hunk { background: var(--slate); color: var(--gray-300); }

/* ——— finding card ——— */
.finding {
  margin: 0 0 18px;
  border: var(--border);
  border-radius: var(--radius-panel);
  background: var(--white);
  overflow: hidden;
}
.finding .f-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--gray-150);
  border-bottom: var(--border);
}
.finding .f-title { font-weight: 600; color: var(--slate); flex: 1; }
.finding .f-body { padding: 14px 16px; }
.finding .f-body > :last-child { margin-bottom: 0; }
.finding .f-body pre { margin-top: 12px; }

/* ——— table ——— */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 18px;
  font-size: 14px;
  border: var(--border);
  border-radius: var(--radius-row);
  overflow: hidden;
}
thead th {
  text-align: left;
  padding: 10px 14px;
  background: var(--gray-150);
  color: var(--slate);
  font-weight: 600;
  border-bottom: var(--border);
}
tbody td { padding: 9px 14px; border-bottom: 1px solid var(--gray-300); }
tbody tr:last-child td { border-bottom: none; }
tbody tr:nth-child(even) { background: color-mix(in srgb, var(--gray-150) 50%, var(--white)); }

/* ——— steps / timeline ——— */
.steps { list-style: none; counter-reset: step; padding: 0; margin: 0 0 18px; }
.steps > li {
  position: relative;
  counter-increment: step;
  padding: 0 0 22px 42px;
  margin: 0;
}
.steps > li::before {
  content: counter(step);
  position: absolute; left: 0; top: 0;
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--mono); font-size: 13px; font-weight: 600;
  color: var(--white); background: var(--clay);
  border-radius: 50%;
}
.steps > li::after {
  content: ''; position: absolute; left: 13.5px; top: 30px; bottom: 2px;
  width: 1.5px; background: var(--gray-300);
}
.steps > li:last-child::after { display: none; }
.steps .s-title { font-weight: 600; color: var(--slate); }
.steps .s-status { font-size: 12px; }
.steps .s-body { color: var(--gray-700); margin-top: 2px; }

/* ——— collapsible ——— */
details {
  margin: 0 0 18px;
  border: var(--border);
  border-radius: var(--radius-row);
  background: var(--white);
  overflow: hidden;
}
details > summary {
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 600;
  color: var(--slate);
  background: var(--gray-150);
  list-style: none;
}
details > summary::-webkit-details-marker { display: none; }
details > summary::before { content: '▸ '; color: var(--gray-500); }
details[open] > summary::before { content: '▾ '; }
details .d-body { padding: 14px 16px; }
details .d-body > :last-child { margin-bottom: 0; }

/* ——— stat / KPI tiles ——— */
.stat-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin: 0 0 20px;
}
.stat {
  padding: 16px 18px;
  border: var(--border); border-radius: var(--radius-panel);
  background: var(--white);
}
.stat-value {
  font-family: var(--serif); font-size: 28px; font-weight: 600;
  color: var(--slate); line-height: 1.1;
}
.stat-label { font-size: 13px; color: var(--gray-500); margin-top: 4px; }
.stat-delta {
  display: inline-block; margin-top: 8px;
  font-family: var(--mono); font-size: 12px; font-weight: 600;
  color: var(--gray-500);
}
.stat-delta.success { color: var(--olive); }
.stat-delta.warn { color: #946a13; }
.stat-delta.error, .stat-delta.blocking { color: var(--rust); }

/* ——— columns ——— */
.columns {
  display: grid;
  grid-template-columns: repeat(var(--n, 2), minmax(0, 1fr));
  gap: 18px;
  margin: 0 0 20px;
}
@media (max-width: 640px) { .columns { grid-template-columns: 1fr; } }
.columns .col {
  padding: 16px 18px;
  border: var(--border); border-radius: var(--radius-panel);
  background: var(--white);
}
.columns .col > :last-child { margin-bottom: 0; }
.columns .col-title {
  font-weight: 600; color: var(--slate); margin-bottom: 10px;
  padding-bottom: 8px; border-bottom: var(--border);
}

/* ——— architecture svg ——— */
.arch { margin: 0 0 22px; }
.arch .arch-title { font-weight: 600; color: var(--slate); margin-bottom: 8px; }
.arch svg { max-width: 100%; height: auto; display: block; }

/* ——— mermaid diagrams (rendered client-side, content swapped to SVG) ——— */
.mermaid-figure { margin: 0 0 18px; }
pre.mermaid {
  background: none; border: none; padding: 0; margin: 0;
  text-align: center; line-height: normal;
}
.mermaid-caption {
  margin-top: 8px; text-align: center;
  font-size: 13px; color: var(--gray-500);
}

/* ——— fallback for unknown block types ——— */
.unknown-block {
  margin: 0 0 18px; padding: 10px 14px;
  border: 1.5px dashed var(--rust); border-radius: var(--radius-row);
  background: color-mix(in srgb, var(--rust) 5%, var(--white));
  font-family: var(--mono); font-size: 13px; color: var(--rust);
}
`;

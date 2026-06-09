---
name: html-doc
description: >-
  Turn a review, plan, report, analysis, architecture overview, or any structured message into a clean, self-contained HTML document for easier reading and sharing. You write a compact component-JSON (not HTML), and a bundled Node generator renders it. Use this whenever the user wants an HTML version, a "nice writeup", a shareable/readable report, or a visual rendering of a code review, implementation plan, status update, post-mortem, or architecture diagram — even if they don't say the word "HTML". Prefer this over hand-writing HTML/CSS: it is far cheaper in tokens and looks consistent.
---

# html-doc

Render structured content as a polished, self-contained HTML file **without writing any
HTML or CSS yourself**. You emit a small JSON document describing *components* (headings,
callouts, findings, diffs, tables, steps, architecture graphs, …); the bundled
`generate.mjs` turns it into a styled page using the Anthropic reading-document design
language. This keeps your output tiny — a few hundred tokens of JSON instead of thousands
of tokens of markup — and the result is consistent every time.

## When to use

Reach for this whenever the user wants something **read or shared as a document** rather
than as chat: a code review, an implementation plan, a status report, an incident
write-up, a research explainer, or an architecture overview. If they ask for "an HTML
version", "a nice writeup", "a report I can send", or "a diagram of the system", this is
the tool.

## How to use it

1. **Write a JSON document** to a file (e.g. `doc.json`). Shape:
   ```json
   {
     "title": "Code Review — PR #247",
     "subtitle": "optional one-liner",
     "meta": { "Author": "alex", "Branch": "feat/x", "Risk": "Medium" },
     "blocks": [ { "t": "p", "x": "..." }, ... ]
   }
   ```
   `title` is required-ish (defaults to "Document"); `subtitle` and `meta` are optional.
   `meta` renders as a key/value header strip. `blocks` is the ordered content.

2. **Run the generator** (Node ≥ 18, no dependencies to install):
   ```sh
   node <skill-dir>/generate.mjs doc.json --out <name>.html
   ```
   Use the absolute path to this skill's `generate.mjs`. You can also pipe JSON via stdin
   (`cat doc.json | node generate.mjs > out.html`) or pass `--check` to validate block
   types without writing output.

3. **Report the saved file path** to the user. Do **not** open it or paste the HTML back
   into the chat — the whole point is to keep your response small.

## Block cheat-sheet

Every block is `{ "t": "<type>", ... }`. **Text fields accept inline markdown**:
`**bold**`, `*italic*`, `` `code` ``, and `[label](url)`. Use that instead of nesting
components for simple emphasis — it saves tokens.

| `t` | fields | use for |
|-----|--------|---------|
| `h` | `l` (1–3), `x` | section headings |
| `p` | `x` | paragraph |
| `ul` / `ol` | `items: []` | bullet / numbered list (items are inline-md strings) |
| `code` | `lang`, `x` | code block |
| `quote` | `x` | blockquote |
| `hr` | — | divider |
| `callout` | `k`, `title?`, `x` | admonition box; `k` = `info\|note\|success\|warn\|error` |
| `badge` | `k`, `x` | inline status pill |
| `file` | `path`, `line?`, `x?` | file reference chip |
| `diff` | `file?`, `lines: []` | diff; each line starts with `+`, `-`, ` `, or `@@` |
| `finding` | `sev`, `title`, `file?`, `line?`, `x`, `code?` | code-review finding (`sev` = `blocking\|warn\|nit\|info`) |
| `table` | `cols: []`, `rows: [[]]` | data table |
| `meta` | `items: {k:v}` | key/value grid (inline, not the header strip) |
| `steps` | `items: [{title, x?, status?}]` | numbered plan/timeline |
| `stat` | `items: [{label, value, delta?, k?}]` | KPI tiles (big number + delta) |
| `columns` | `cols: [{title?, blocks: []}]` | side-by-side panels (nests blocks) |
| `toc` | `title?` | auto table of contents (links to every `h`) |
| `details` | `summary`, `blocks: []` | collapsible section (nests blocks) |
| `arch` | `title?`, `nodes: [{id,label,c?,r?,k?}]`, `edges: [{from,to,label?}]` | architecture / flow diagram (SVG, self-contained) |
| `mermaid` | `code`, `title?` | Mermaid diagram (`code` is Mermaid syntax). **Loads Mermaid from a CDN at view time — not self-contained / needs internet.** |

Headings (`h`) automatically get clickable anchor ids; a `toc` block placed anywhere
links to all of them in document order.

**`arch` vs `mermaid`:** prefer `arch` for boxes-and-arrows — it renders inline SVG and
keeps the document fully offline. Use `mermaid` when you need a diagram type `arch` can't
do (sequence, gantt, class, state, pie, etc.) and accept that those docs require internet
to draw the diagram. Mermaid is only loaded when at least one `mermaid` block is present.

For the **full** field reference, examples per block, and `arch` layout details, read
`references/components.md` — you only need it for `diff`, `finding`, and `arch`; the rest
are obvious from the table above.

## Tips

- Keep it compact. Short JSON in, rich document out. Don't pre-format text into HTML.
- For an architecture graph, give nodes explicit `c` (column) / `r` (row) coords when you
  want a specific layout; omit them to let the generator auto-layer a simple flow.
- Unknown `t` values won't crash — they render a visible placeholder and a stderr warning,
  so run `--check` if you want to catch typos first.
- See `examples/` (`review.json`, `plan.json`, `architecture.json`, `status.json`) for
  complete documents.

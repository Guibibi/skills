# Component reference

Full field reference for every block type. Each block is an object with a `t` (type)
key. **Text fields** (`x`, `title`, `summary`, list items, table cells, `meta` values)
accept inline markdown: `**bold**`, `*italic*`, `` `code` ``, `[label](url)`. Structural
fields (`path`, `lang`, `id`, etc.) are treated as plain text.

## Contents
- [Document envelope](#document-envelope)
- [h — heading](#h--heading)
- [p — paragraph](#p--paragraph)
- [ul / ol — lists](#ul--ol--lists)
- [code — code block](#code--code-block)
- [quote — blockquote](#quote--blockquote)
- [hr — divider](#hr--divider)
- [callout — admonition](#callout--admonition)
- [badge — status pill](#badge--status-pill)
- [file — file reference](#file--file-reference)
- [diff — diff block](#diff--diff-block)
- [finding — review finding](#finding--review-finding)
- [table — data table](#table--data-table)
- [meta — key/value grid](#meta--keyvalue-grid)
- [steps — timeline](#steps--timeline)
- [stat — KPI tiles](#stat--kpi-tiles)
- [columns — side-by-side panels](#columns--side-by-side-panels)
- [toc — table of contents](#toc--table-of-contents)
- [details — collapsible](#details--collapsible)
- [arch — architecture diagram](#arch--architecture-diagram)
- [mermaid — Mermaid diagram (CDN)](#mermaid--mermaid-diagram-cdn)

---

## Document envelope

```json
{
  "title": "string (shown as the page H1; defaults to \"Document\")",
  "subtitle": "string, optional",
  "meta": { "Key": "Value", "...": "..." },
  "blocks": [ /* ordered array of blocks */ ]
}
```
`meta` renders as a header strip of key/value pairs under the title. Only `blocks` is
required (must be an array).

## h — heading
`{ "t": "h", "l": 1, "x": "Section title" }` — `l` is 1–3 (clamped). Rendered in the serif
display face.

## p — paragraph
`{ "t": "p", "x": "Body text with **markdown**." }`

## ul / ol — lists
`{ "t": "ul", "items": ["first", "second `with code`"] }`
`{ "t": "ol", "items": ["step one", "step two"] }`
Items are inline-markdown strings. (For nested or rich list entries, use `steps` or
`details` instead.)

## code — code block
`{ "t": "code", "lang": "ts", "x": "const x = 1;" }` — `lang` is an optional label shown
above the block; `x` is rendered verbatim (escaped, not markdown-parsed).

## quote — blockquote
`{ "t": "quote", "x": "A quoted line." }`

## hr — divider
`{ "t": "hr" }`

## callout — admonition
```json
{ "t": "callout", "k": "warn", "title": "Heads up", "x": "Body **markdown** here." }
```
`k` ∈ `info` (clay), `note` (gray), `success` (olive), `warn` (amber), `error` (rust).
Unknown kinds fall back to `note`. `title` is optional.

## badge — status pill
`{ "t": "badge", "k": "success", "x": "Passing" }` — inline pill. `k` ∈ `info`, `note`,
`success`, `warn`, `error`/`blocking`, `nit`. (Badges also appear automatically inside
`finding` and `steps`.)

## file — file reference
`{ "t": "file", "path": "src/auth.ts", "line": 42, "x": "optional label" }` — renders a
monospace chip like `src/auth.ts:42`. `line` and `x` are optional.

## diff — diff block
```json
{
  "t": "diff",
  "file": "src/hooks/useTasks.ts",
  "lines": [
    "@@ -39,6 +39,8 @@",
    " unchanged context line",
    "-removed line",
    "+added line"
  ]
}
```
The **first character** of each string decides its style: `+` = added (green),
`-` = removed (red), leading space = context, a line starting with `@@` = hunk header.
The leading marker character is stripped from display. `file` is an optional header.

## finding — review finding
```json
{
  "t": "finding",
  "sev": "blocking",
  "title": "Race condition on rapid edits",
  "file": "src/hooks/useTasks.ts",
  "line": 42,
  "x": "Explanation in **markdown**.",
  "code": { "lang": "ts", "x": "const prev = qc.getQueryData(key);" }
}
```
A card with a severity badge. `sev` ∈ `blocking` (rust), `warn` (amber), `nit` (oat),
`info` (gray). `file`/`line` render a chip in the header. `code` is an optional embedded
code block. `x` is the body.

## table — data table
```json
{ "t": "table", "cols": ["Area", "Status"], "rows": [["auth", "✓"], ["cache", "✗"]] }
```
`cols` are header cells; `rows` is an array of row arrays. All cells accept inline markdown.

## meta — key/value grid
`{ "t": "meta", "items": { "Owner": "platform", "ETA": "Q3" } }` — an inline key/value
strip you can place anywhere in the body (distinct from the document-level `meta`).

## steps — timeline
```json
{
  "t": "steps",
  "items": [
    { "title": "Add interface", "x": "Define the type.", "status": "done" },
    { "title": "Wire it up", "status": "in progress" },
    { "title": "Roll out" }
  ]
}
```
A numbered vertical timeline. `x` and `status` are optional. `status` is auto-colored:
words like *done/complete/merged* → green, *progress/wip/review* → amber,
*block/fail/risk* → red, else neutral.

## stat — KPI tiles
```json
{
  "t": "stat",
  "items": [
    { "label": "p50 latency", "value": "42ms", "delta": "▼ 18%", "k": "success" },
    { "label": "error rate", "value": "0.31%", "delta": "▲ 0.1%", "k": "warn" },
    { "label": "events/day", "value": "1.2B", "delta": "▲ 6%" }
  ]
}
```
A responsive row of metric tiles (big serif `value`, small `label`, optional `delta`).
`delta` is colored by `k` ∈ `success` (olive), `warn` (amber), `error`/`blocking` (rust);
omit `k` for a neutral delta. Decide good/bad yourself — e.g. a latency drop is `success`,
an error-rate rise is `warn` — since "down" isn't always good.

## columns — side-by-side panels
```json
{
  "t": "columns",
  "cols": [
    { "title": "Option A", "blocks": [ { "t": "p", "x": "..." } ] },
    { "title": "Option B", "blocks": [ { "t": "ul", "items": ["..."] } ] }
  ]
}
```
Lays panels side by side (collapses to a single column on narrow screens). Each column has
an optional `title` and its own `blocks` array (recurses — any block type allowed). Best
for 2–3 columns; comparisons, before/after, shipped vs. in-flight.

## toc — table of contents
`{ "t": "toc", "title": "Contents" }` — renders a navigation box linking to **every** `h`
block in the document, in order, indented by heading level. Headings automatically receive
clickable anchor ids, so you can place a `toc` anywhere (usually near the top) without
adding ids yourself. `title` is optional (defaults to "Contents"). Renders nothing if the
document has no headings.

## details — collapsible
```json
{ "t": "details", "summary": "Show test sketch", "blocks": [ { "t": "code", "lang": "ts", "x": "..." } ] }
```
A `<details>` disclosure. `blocks` is a nested array of any block types (recurses).

## arch — architecture diagram
```json
{
  "t": "arch",
  "title": "Request path",
  "nodes": [
    { "id": "br", "label": "Browser", "k": "client" },
    { "id": "api", "label": "API", "c": 0, "r": 1, "k": "primary" }
  ],
  "edges": [
    { "from": "br", "to": "api", "label": "GET" }
  ]
}
```
Renders an inline SVG of boxes and arrows.

**Layout.** Each node may carry explicit grid coordinates: `c` (column, integer — may be
negative) and `r` (row, integer, 0 at top). Provide coords on **all** nodes when you want
a deliberate layout. If no node has coords, the generator auto-layers: nodes with no
incoming edge sit at row 0, and each edge pushes its target one row deeper (good for
linear or tree-like flows). Rows stack top-to-bottom; columns spread left-to-right.

**Edges** connect `from`/`to` node `id`s and draw orthogonal elbow connectors with an
arrowhead. An optional `label` is placed at the bend.

**Node kind `k`** tints the box: `primary` (clay), `client`/`external` (gray),
`service` (white), `store`/`db` (oat), `success` (olive), `warn` (clay). Omit for a plain
white box.

Tips: keep labels short (they size the box; long labels are clamped to ~240px). For wide
flows, lay nodes out by hand with `c`/`r`; for a quick chain, just list nodes and edges
and let auto-layout handle it.

## mermaid — Mermaid diagram (CDN)
```json
{
  "t": "mermaid",
  "title": "Auth sequence",
  "code": "sequenceDiagram\n  Client->>Hearth: POST /login\n  Hearth-->>Client: JWT"
}
```
- `code` — the raw Mermaid source (any Mermaid diagram type: `graph`/`flowchart`,
  `sequenceDiagram`, `classDiagram`, `stateDiagram`, `gantt`, `pie`, `erDiagram`, …).
  Newlines are significant — use real `\n` in the JSON string.
- `title?` — optional caption shown under the diagram.

**Not self-contained.** Unlike every other block, this loads Mermaid from
`cdn.jsdelivr.net` at view time, so the document needs internet to draw the diagram (and
won't render it offline, over `file://` with no network, or behind a CDN-blocking proxy).
The loader script is injected **only** when at least one `mermaid` block is present, so
diagram-free documents stay fully offline-capable. If the script can't load, the raw
Mermaid source shows as a readable `<pre>` fallback.

**Prefer `arch`** for simple boxes-and-arrows (it's inline SVG and stays offline); reach
for `mermaid` only when you need a diagram type `arch` doesn't provide.

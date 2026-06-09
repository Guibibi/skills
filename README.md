# skills

A small collection of [agent skills](https://github.com/vercel-labs/skills) for
Claude Code (and other compatible coding agents). Each skill lives in its own
folder with a `SKILL.md` describing what it does and how to invoke it.

## Installing

These install with the [`skills`](https://github.com/vercel-labs/skills) CLI — no
global install needed, just `npx`.

Install **everything** in this repo:

```sh
# Project scope → ./.claude/skills/
npx skills add Guibibi/skills

# Global scope → ~/.claude/skills/ (available in every project)
npx skills add -g Guibibi/skills
```

Install a **single skill** by pointing at its subfolder:

```sh
npx skills add Guibibi/skills/html-doc
```

The CLI auto-detects which coding agents you have installed and drops the skill
into the right place (e.g. `.claude/skills/` for Claude Code). After installing,
restart your agent session so it picks up the new skill.

List what's installed:

```sh
npx skills list   # or: npx skills ls
```

> Sources can also be a full GitHub URL, a GitLab/any git URL, or a local path —
> see the [CLI docs](https://github.com/vercel-labs/skills).

## Skills

### html-doc

Turn a review, plan, report, analysis, or architecture overview into a clean,
**self-contained HTML document** — without writing any HTML/CSS yourself. You
emit a compact component-JSON (headings, callouts, findings, diffs, tables,
steps, KPI tiles, architecture graphs, …) and the bundled `generate.mjs` renders
a styled page in the Anthropic reading-document design language. Far cheaper in
tokens than hand-written markup, and consistent every time.

- **Use it for:** code reviews, implementation plans, status reports, incident
  write-ups, research explainers, "a nice writeup I can send", system diagrams.
- **Diagrams:** an inline-SVG `arch` block for boxes-and-arrows (stays fully
  offline), plus an optional `mermaid` block for richer diagram types (sequence,
  gantt, class, state, …) — the latter loads Mermaid from a CDN at view time.
- **Runtime:** Node ≥ 18, zero dependencies to install.

Run the generator directly:

```sh
node html-doc/generate.mjs doc.json --out report.html
node html-doc/generate.mjs doc.json --check   # validate block types only
```

See [`html-doc/SKILL.md`](html-doc/SKILL.md) for the full workflow and
[`html-doc/references/components.md`](html-doc/references/components.md) for the
complete block vocabulary.

## Adding a new skill

Scaffold one with the CLI, then commit it here:

```sh
npx skills init my-skill
```

Each skill needs a `SKILL.md` with `name` and `description` frontmatter. A single
repo can hold many skills in subfolders — the CLI discovers each one.

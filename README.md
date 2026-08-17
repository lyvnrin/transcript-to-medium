# Transcript to Medium

Turns raw session transcripts from PacePort's biweekly Applied AI series into polished, Medium-ready articles. Drop in a `.pdf` or `.docx` transcript, and Claude extracts the discussion, structures it into topics, pulls link previews for anything referenced, and formats the result into clean HTML you can copy straight into a Medium draft.

## How it works

1. **Upload** — drop a `.pdf` or `.docx` transcript export on the New edition tab.
2. **Extract** — the server pulls raw text via `mammoth` (docx) or `pdf-parse` (pdf).
3. **Structure** — Claude reads the transcript and returns structured JSON: title, subtitle, per-topic summaries, key takeaways, and any links mentioned.
4. **Link previews** — for each topic's featured link, the server scrapes Open Graph metadata (title, description, image) to build a preview card.
5. **Format** — Claude turns the structured JSON into a magazine-style HTML article, ranked by how interesting each topic is, with link preview cards spliced in.
6. **Export** — copy the article to the clipboard as rich text (headings, bold/italic, links, and images all carry over into Medium's editor), or revisit it later from Past editions, which persist in a local SQLite database.

## Stack

- **Frontend** — React 19 + Vite, no UI framework, hand-rolled CSS
- **Backend** — Express, streaming progress over Server-Sent Events
- **AI** — Anthropic SDK (Claude) for both the structuring and formatting passes
- **Storage** — SQLite (`better-sqlite3`) for past editions
- **Parsing** — `mammoth` for `.docx`, `pdf-parse` for `.pdf`

## Getting started

```bash
npm install
```

Add your Anthropic API key to a `.env` file in the project root:

```
ANTHROPIC_API_KEY=your-key-here
```

Then run the app — this starts the Vite dev server (port 5174) and the Express API (port 3002) together:

```bash
npm run dev
```

Other scripts:

```bash
npm run lint      # oxlint
npm run build     # production build
npm run preview   # preview the production build
```

## Design

The site's visual identity is editorial rather than dashboard-like — it's meant to read like a small magazine, not a tool.

### Palette

Three core colors, each carried through both a light and a dark theme:

| Name | Hex | Role |
| --- | --- | --- |
| Maritime Blue | `#27293d` | primary text (light) / page background (dark) |
| Blue Glow | `#b2d4dd` | accent (dark theme) / ambient highlight |
| Coconut Milk | `#f0ede5` | page background (light) / primary text (dark) |

Light and dark aren't just inverted — the accent shifts too: a deeper teal-blue (`#34697d`) carries the accent role in light mode, handing off to Blue Glow itself once the background goes dark. Surfaces, borders, and hover tints are derived from these three, not picked separately, so the palette stays consistent as it's reused across buttons, cards, and the ambient background glow.

### Typography

Two typefaces, split by role rather than mixed within the same block of text:

- **Source Serif 4** — headings and the article body itself. Gives generated articles and page titles an editorial, print-like feel.
- **IBM Plex Sans** — UI chrome: nav, buttons, labels, metadata. Keeps interface text legible and clearly distinct from the "content" the app is producing.

### Layout

No framework — plain CSS with custom properties (`--bg`, `--accent`, `--surface`, etc.) that get reassigned wholesale under `:root[data-theme='dark']`, so every component just references the token and gets the right value in either theme. Chrome elements (menus, panels, buttons) use soft shadows and gentle gradients for depth; the generated article itself stays flat and borderless, closer to how Medium's own reader renders long-form text.

## Notes

- Medium has stopped issuing new integration tokens, so there's no direct "Publish" button — the reliable path is copying the article and pasting it into a new Medium draft.
- Uploaded files are processed in memory/temp storage and deleted after processing; only the generated article (not the source file) is persisted.

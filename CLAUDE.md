# CLAUDE.md

## Project
Transcript-to-Medium: converts fortnightly AI/Tech knowledge-sharing meeting transcripts into polished, Medium-ready articles.

## Stack
- React + Vite frontend, Express backend, Claude API (Anthropic SDK)
- Article preview rendered via `dangerouslySetInnerHTML` (`ArticlePreview.jsx`) — no rich text editor library
- Plain CSS, no Tailwind
- Oxlint for linting

## Architecture
- Frontend: transcript upload → article preview → export (copy to clipboard for Medium)
- Backend: Express with `/api/extract` (transcript → structured JSON), `/api/template` (structured JSON → HTML), and `/api/process` (streams the full pipeline over SSE), all proxying to Claude API
- Medium's API is legacy — users copy output and paste into Medium drafts

## Pipeline
Upload transcript (.pdf/.docx) → extract text → Claude structures into editorial JSON → Claude renders JSON into HTML → user copies to Medium

## Writing style
Articles should read like Wired/Verge-style explainers. No meeting language ("the team discussed"), no speaker attribution. Sections are standalone tech explainers.

## Images
- Section header photos: Claude extracts a topic keyword per section → backend fetches a matching photo from Pexels → spliced into the article HTML with photographer credit. See `fetchSectionImage` / `buildSectionImageHtml` in `server/index.js`.
- Switched from Unsplash to Pexels (2026-09-17) because Unsplash's API approval was taking too long; Pexels issues keys instantly. Swapping back or adding Unsplash as a second provider is straightforward — same shape, different endpoint/response fields.

## Conventions
- Keep code minimal, no over-engineering
- Plain CSS, no utility frameworks
- Oxlint for linting

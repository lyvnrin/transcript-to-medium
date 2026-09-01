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

## Pending
- Unsplash API approval (~Sep 1 2026, 5-10 business days). Once approved, integrate image suggestions: Claude extracts keywords → backend fetches Unsplash image → user reviews in the article preview.

## Conventions
- Keep code minimal, no over-engineering
- Plain CSS, no utility frameworks
- Oxlint for linting

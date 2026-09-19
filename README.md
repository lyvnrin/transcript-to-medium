# Transcript to Medium

A web app that converts raw transcripts from PacePort's biweekly Applied AI & Tech knowledge-sharing sessions into polished, Medium-ready articles using Claude.

## Features

- **File upload:** accepts `.pdf` and `.docx` transcripts.
- **Multi-stage Claude pipeline:** structuring, fact-checking, and formatting, streamed to the UI as progress updates.
- **Section header photos:** each section gets a matching photo from Pexels, with photographer credit.
- **Link preview cards:** Open Graph scraping turns referenced links into cards with title, description, and image.
- **Article settings:** control length, tone, and audience before generating.
- **Edition history:** past articles are stored in SQLite so you can reopen them later.
- **Export:** copy as rich text for pasting into a Medium draft, or download as markdown or PDF.

## Tech Stack

- React 19 + Vite 8 (frontend)
- Express 5 (backend)
- Anthropic SDK / Claude (AI)
- better-sqlite3 (edition storage)
- mammoth + pdf-parse (text extraction)
- Pexels API (section images)
- oxlint (linting)
- Plain CSS (no framework)

## Getting Started

See [DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Documentation

- [PROJECT.md](docs/PROJECT.md)
- [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [DEPLOYMENT.md](docs/DEPLOYMENT.md)

## License

MIT. See [LICENSE](LICENSE).

# Deployment

This guide takes a clean machine to a running instance of Transcript to Medium.

## Prerequisites

- **Node.js** `^20.19.0` or `>=22.12.0`. Check with `node --version`.
- **npm**, which ships with Node.
- **Git**, to clone the repository.
- **An Anthropic API key** (required). Create one in the Anthropic Console.
- **A Pexels API key** (optional). Get one free at [pexels.com/api](https://www.pexels.com/api/); approval is instant.

## Clone and Install

Clone the repository and install dependencies:

```bash
git clone https://github.com/lyvnrin/transcript-to-medium.git
cd transcript-to-medium
npm install
```

Run `npm install` once. The frontend and backend share a single `package.json`.

## Environment Configuration

Create a `.env` file in the project root:

```
ANTHROPIC_API_KEY=your-anthropic-key
PEXELS_API_KEY=your-pexels-key
```

- `ANTHROPIC_API_KEY` is required.
- `PEXELS_API_KEY` is optional. Without it, section header photos are skipped and everything else works.

The `.env` file is gitignored. Do not commit it.

## Running Locally

Start the frontend and backend together:

```bash
npm run dev
```

This uses `concurrently` to start the Vite dev server (port 5174) and the Express API server (port 3002). Open [http://localhost:5174](http://localhost:5174).

The Vite config proxies `/api` requests to the Express server. The two run on separate ports, but the frontend calls `/api` as if it were the same origin.

The first run creates the SQLite database at `server/data/editions.db`. No setup is needed.

## Building for Production

Create a production bundle in `dist/`:

```bash
npm run build
```

Serve the bundle locally with:

```bash
npm run preview
```

The Express server does not start with `preview`. Run it in a second terminal, or the app cannot process transcripts:

```bash
npm run server
```

`vite preview` serves on port 4173 by default and reuses the `/api` proxy from `vite.config.js`, so it forwards API requests to the Express server on port 3002.

`npm run build` produces static files only. To host the app anywhere other than your own machine, serve `dist/` with a web server that forwards `/api` to the Express server.

## Other Scripts

- `npm run lint` runs oxlint.
- `npm run server` starts only the Express backend.

## Troubleshooting

### Claude calls fail: `ANTHROPIC_API_KEY` is missing or invalid

The server starts without a key, but every Claude call is rejected (a 401 from the API). The app then shows "Failed to generate the article from Claude." Check that `.env` is in the project root, that the variable name is spelled exactly `ANTHROPIC_API_KEY`, and that the key is active. Restart the server after editing `.env`, because it is read once at startup.

### `better-sqlite3` fails to install or build

`better-sqlite3` is a native module and may need to compile. Install a C++ toolchain, then rerun `npm install`:

- macOS: `xcode-select --install`
- Ubuntu: `sudo apt install build-essential`

### Port 5174 or 3002 is already in use

Stop the process using the port, or change the port:

- Frontend: set `port` in `vite.config.js` (currently 5174; `strictPort` is on, so Vite exits instead of picking another).
- Backend: change the `PORT` constant in `server/index.js` (currently 3002), and update the `/api` proxy target in `vite.config.js` to match.

### An uploaded file returns "no readable text"

The file may contain only images. `pdf-parse` reads embedded text and cannot OCR scanned documents. Run the file through an OCR tool first, or export the transcript from the source as text-based PDF or `.docx`.

### Pexels images do not appear

Check that `PEXELS_API_KEY` is set in `.env` and restart the server. Without the key, the feature is skipped silently, with no error. Photos are also skipped for any section that already has a link preview image, and when a Pexels request fails or finds no match.

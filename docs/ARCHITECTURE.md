# Architecture

## System Overview

A user uploads a `.pdf`, `.docx` or `.md` transcript in the React frontend, optionally with up to five supplementary files such as chat threads, and it sends them to the Express backend as a multipart form. The server extracts the raw text (`mammoth` for `.docx`, `pdf-parse` for `.pdf`), combines the files into one source, and makes a first Claude API call that structures the transcript into editorial JSON. A second Claude call then fact-checks that JSON against the original transcript. The server enriches the checked JSON with Open Graph link previews and Pexels section photos, and a third Claude call formats it into HTML. The result is stored in SQLite. Throughout, the server streams status events to the client over Server-Sent Events (SSE), ending with the finished HTML.

Counting the fact-check, the pipeline makes three Claude calls. The two that carry the main design are the structuring call and the formatting call; the fact-check sits between them.

## Pipeline Stages

All stages run inside the `/api/process` handler in `server/index.js`, in the order below.

1. **File upload.** The frontend sends a multipart `POST` to `/api/process`, with the transcript in the `file` field, up to five optional files in the repeated `extras` field, and a JSON-encoded `settings` field. The request is built in `src/utils/api.js` (`processTranscript`), and the files are picked in `src/components/UploadZone.jsx`, where the optional files sit behind an "Add optional files" toggle. The server accepts them with `multer` (`upload.fields`).

2. **Text extraction.** `extractText` in `server/index.js` uses `mammoth` for `.docx`, `pdf-parse` for `.pdf`, and a plain read for `.md` to pull raw text from each uploaded file. `combineSources` then joins the results into one string: the transcript first under a `=== MEETING TRANSCRIPT (name) ===` header, then each supplementary file under `=== SUPPLEMENTARY: name ===`. An empty transcript ends the run with an error event; an empty supplementary file is skipped. With no extra files, the transcript is passed through unchanged.

3. **Article generation.** `generateArticle` calls Claude with an editorial system prompt and the combined source text. The prompt tells Claude to treat the transcript and supplementary material as one source and to fold the chat threads' links, tools, and context into the relevant topics rather than covering the chat separately. Claude returns structured JSON (see Data Flow below). This is the structuring stage.

4. **Fact-checking.** `factCheckAttribution` makes a second Claude call that receives the transcript and the draft JSON. It targets one specific error: a draft crediting a speaker as the author of a work they only mentioned. Where the transcript names the real author, the summary is corrected. If this call fails or returns unparseable output, the unchecked draft is used, so a fact-check failure never blocks an article.

5. **Link preview enrichment.** `enrichLinkPreviews` runs `fetchLinkPreview` for each section's `featuredLink`, in parallel. It fetches the page (with a size limit) and reads the Open Graph metadata: title, description, image, and site name. The result is stored on the section as `linkPreview`.

6. **Section image enrichment.** `enrichSectionImages` runs `fetchSectionImage` for each section, in parallel. It searches Pexels for one landscape photo matching the section's topic and stores it as `sectionImage`, with a caption and the photographer's name and profile URL for credit. The caption is Pexels' own description of the photo, or "Stock photo illustrating <topic>" when Pexels provides none. A section is skipped if it already has a link preview with an image, so two large images do not sit back to back. If `PEXELS_API_KEY` is unset or the request fails, the section simply has no photo.

7. **HTML formatting.** `generateHtml` makes the formatting Claude call. It sends the structured JSON plus any settings instructions, and Claude returns semantic HTML following a fixed template: an `h1` title, a short intro, a Key Takeaways list, one write-up per section, a closing note, and the PacePort tagline. Sections are ranked by how interesting they are rather than by transcript order. Claude leaves HTML comment placeholders (`<!--SECTION_IMAGE:N-->` and `<!--LINK_CARD:N-->`) in each section, and `renderArticleHtml` replaces them with the real photo and preview card markup. Each photo is a `figure` whose `figcaption` holds the caption (trimmed to about 90 characters by `formatImageCaption`) with the "Photo by … on Pexels" credit on the line below. `N` is the section's index in the input JSON, so the splice still works after Claude reorders sections.

8. **Storage.** `insertEdition` in `server/db.js` writes the title, HTML, and source filename to the `editions` table in SQLite. The uploaded files, including any supplementary ones, are deleted once processing ends.

9. **SSE delivery.** Each stage emits a status event so the frontend can drive a progress stepper. The sequence is `extracting`, `structuring`, `fact-checking`, `previewing`, `formatting`, and `done`. The `done` event carries the final HTML and the edition `id`. An `error` event carries a message if any stage fails.

## Key Architectural Decisions

**Separate Claude calls for structuring and formatting.** Asking Claude for finished HTML directly from a transcript mixes two jobs: deciding what the content is, and deciding how it looks. Splitting them means the structuring pass produces clean JSON that the formatting pass can template against. It also gives the fact-check a natural place to sit, between the two, where it can correct data before any markup exists. Link previews and photos are added at the same point, as data.

**SSE rather than websockets.** The pipeline is a one-way sequence of status updates that ends in a single final payload. SSE covers that with a plain HTTP response, and needs no connection upgrade or message protocol. The client never sends anything after the initial upload.

**SQLite via `better-sqlite3` rather than a hosted database.** This is a single-user tool and the data is local: a list of generated articles. An embedded database has no service to run or credentials to manage, and `better-sqlite3` is synchronous, which keeps the storage module short.

**`dangerouslySetInnerHTML` rather than a rich text editor.** The output is read-only, and the user's workflow ends at copying it to the clipboard. An editor library would add weight and behaviour that nothing here needs. `ArticlePreview.jsx` renders the HTML directly. The HTML comes from Claude and the server's own templates, not from other users.

**Pexels rather than Unsplash.** Pexels issues API keys instantly, while Unsplash requires an approval period. The two APIs have the same shape (search by keyword, get a photo and credit fields), so swapping back or adding Unsplash as a second provider would only mean changing the endpoint and response fields in `fetchSectionImage`.

## Data Flow and Schemas

### Structured JSON

This is the shape passed from the structuring stage to the formatting stage. Fact-checking preserves it, and the enrichment steps add `linkPreview` and `sectionImage` to each section.

```json
{
  "title": "string",
  "subtitle": "string",
  "date": "string or null",
  "edition": "number or null",
  "sections": [
    {
      "topic": "string",
      "speaker": "string or null",
      "summary": "string",
      "keyTakeaway": "string",
      "links": ["string"],
      "featuredLink": "string or null",
      "linkPreview": {
        "title": "string",
        "description": "string",
        "image": "string",
        "siteName": "string"
      },
      "sectionImage": {
        "url": "string",
        "alt": "string",
        "caption": "string",
        "photographer": "string or null",
        "photographerUrl": "string or null"
      }
    }
  ],
  "closingNote": "string"
}
```

`linkPreview` and `sectionImage` are `null` when no preview or photo was found. `speaker` is kept in the JSON for the fact-check, but the formatting prompt tells Claude to leave speakers out of the article.

### Article settings

The frontend sends this object as a JSON string in the `settings` form field. The server turns each value into an extra instruction appended to the formatting call. Missing or unrecognised values add nothing.

```json
{
  "length": "quick | standard | deep",
  "tone": "casual | editorial | technical",
  "tldr": true,
  "pullQuotes": false,
  "audience": "general | developers | leadership"
}
```

`quick` targets roughly 500 words, `deep` roughly 1800, and `standard` uses the default template length. `tldr` adds a short summary after the title, and `pullQuotes` adds one or two blockquotes.

## External Integrations

- **Anthropic Claude API.** Model `claude-sonnet-4-6`, used for structuring, fact-checking, and formatting.
- **Pexels API.** Image search for section header photos. Optional: without a key, articles are generated without photos.
- **Open Graph scraping.** Not an API: the server fetches each featured link directly and reads its meta tags.

Credentials (`ANTHROPIC_API_KEY`, `PEXELS_API_KEY`) are configured through a `.env` file. See [DEPLOYMENT.md](DEPLOYMENT.md) for setup.

## Version Control

The project is a mono-repo: `src/` holds the React frontend, `server/` holds the Express backend, and `docs/` holds documentation. Linting runs through oxlint. `server/data/`, where the SQLite database lives, is gitignored, along with `.env`, `node_modules`, and `dist`.

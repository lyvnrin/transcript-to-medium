# Project Brief

## Problem Statement

PacePort runs a biweekly Applied AI & Tech knowledge-sharing series. The sessions are recorded and transcribed, but the raw transcripts are messy: they contain filler, crosstalk, and topics that surface in fragments across the whole conversation. Turning one into something publishable takes hours of manual editing.

Existing note-taking tools do not close that gap. They produce meeting minutes (who said what, action items, a chronological summary), which is a different artifact from editorial content. Minutes record that a discussion happened; an article explains the subject to someone who was not in the room.

## What Transcript to Medium Does

Transcript to Medium converts a session transcript into a Medium-ready article. The pipeline runs in the following stages:

1. **Upload.** The user uploads a `.pdf` or `.docx` transcript.
2. **Text extraction.** The server pulls the raw text out of the file (`mammoth` for `.docx`, `pdf-parse` for `.pdf`).
3. **Structuring.** Claude reads the transcript and returns editorial JSON: a title, per-topic summaries, key takeaways, and any links mentioned.
4. **Fact-checking.** A second pass cross-references the structured content against the original transcript, so claims in the article can be traced back to what was said.
5. **Link preview enrichment.** For each topic's featured link, the server scrapes Open Graph metadata (title, description, image) to build a preview card.
6. **Header photos.** Claude picks a topic keyword for each section, and the server fetches a matching photo from Pexels, with photographer credit.
7. **Formatting.** Claude renders the JSON into magazine-style HTML, with the link cards and photos spliced in.
8. **Preview and export.** The user previews the article in the app and copies it into a Medium draft.

Before generating, the user can adjust article settings: length, tone, and audience. Each generated article is saved as an edition, so earlier output stays available without rerunning the pipeline.

The writing style is that of a technology explainer. Articles avoid meeting language ("the team discussed") and speaker attribution, and each section stands alone as an explanation of one topic.

## Key Capabilities and Output Formats

The tool produces a single output: a polished HTML article styled for Medium. There are three ways to export it:

- **Copy to clipboard as rich text.** Headings, bold text, links, and images carry over when pasted into Medium's editor.
- **Download as markdown.**
- **Download as PDF.**

Medium no longer issues new integration tokens, so there is no direct publish action. Copying the article and pasting it into a new draft is the supported route.

Past editions persist in a local SQLite database. They can be reopened or deleted from the Past Editions view. Uploaded source files are processed and discarded; only the generated article is stored.

## Target Audience

The primary users are the PacePort Applied AI team, specifically whoever publishes the session write-ups. The tool assumes the user has a transcript file and a Medium account. It does not need technical knowledge of the underlying pipeline; the user uploads a file, reviews the result, and copies it out.

## Team Context

I built Transcript to Medium during a summer 2026 internship at TCS. It is a sister project to a "transcript-to-html" tool and shares much of that project's architecture: both take a transcript, have Claude structure it into JSON, and render the JSON into a presentable format. The difference is the target. The sister project produces a standalone HTML page, while this tool produces an article for Medium.

The project may be open-sourced or handed off to TCS at the end of the internship. The repository is licensed under MIT.

## Use Cases

**1. Publishing a session write-up.** A facilitator finishes a session covering three topics and exports the transcript as a `.docx`. They upload it, wait for the pipeline to finish, and get back an article in the style of a Wired explainer: one section per topic, each with a header photo, key takeaways, and inline link previews for anything referenced. They review it in the preview and copy it into a Medium draft in one step.

**2. Producing a different version for a different audience.** The team wants a shorter, more casual take on the same session for a broader audience. They change the length and tone settings and regenerate. The result is a second edition of the same session, and the original stays in the history.

**3. Retrieving an older edition.** Someone needs a quote from an article published a few weeks earlier. They open Past Editions, find the edition, and read or copy from it directly. The original transcript does not need to be uploaded again.

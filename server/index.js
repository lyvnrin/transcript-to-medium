import path from 'node:path'
import fs from 'node:fs/promises'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import mammoth from 'mammoth'
import { PDFParse } from 'pdf-parse'
import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'

dotenv.config()

const PORT = 3002
const MODEL = 'claude-sonnet-4-6'

const SYSTEM_PROMPT = `You are an editorial assistant for a biweekly Applied AI & Tech knowledge-sharing series. You receive raw meeting transcripts. Extract and structure the content into JSON with this shape:

{
  "title": "string — a catchy Medium headline for this edition",
  "subtitle": "string — a one-line summary",
  "date": "string — meeting date if mentioned, otherwise null",
  "edition": "number or null — edition number if mentioned",
  "sections": [
    {
      "topic": "string — the topic/tool/concept discussed",
      "speaker": "string or null — who presented it",
      "summary": "string — 2-4 paragraph write-up of what was shared, written in an engaging editorial voice, not meeting minutes",
      "keyTakeaway": "string — one sentence takeaway",
      "links": ["any URLs mentioned"]
    }
  ],
  "closingNote": "string — a brief editorial wrap-up paragraph"
}

Strip all filler words, ums, tangents, and crosstalk. Restructure for readability. Write like a tech journalist, not a note-taker. Return ONLY valid JSON, no markdown fences.`

const TEMPLATE_SYSTEM_PROMPT = `You are a tech editorial writer. You receive structured JSON about topics from a biweekly Applied AI & Tech session. Transform it into a polished Medium article in clean HTML (no classes, no inline styles — just semantic tags: h1, h2, p, ul, li, hr, em, strong, a).

Follow this template structure exactly:

1. TITLE — as an h1. Make it catchy and magazine-like, weave in the most interesting topic. Include the edition number naturally (e.g. 'AI Briefing #14: ...').

2. INTRO — one short paragraph. Two sentences about PacePort's Applied AI sessions (a biweekly knowledge-sharing series where the team explores what's new and interesting in AI, tech, and the world around them), then a line like 'This edition covers:' followed by a quick list of the topics covered.

3. KEY TAKEAWAYS — an unordered list where each item is the topic name bolded, followed by a one-sentence takeaway. This doubles as a table of contents.

4. SECTIONS — for each topic, an h2 with an editorial angle headline (not just the topic name — frame it like a Verge or Wired subheading). Then 2-4 paragraphs of pure topic explanation. Write like a tech journalist — explain what the thing is, why it matters, what's interesting about it. No meeting language. No speakers. No 'the team discussed' or 'one member shared'. Just straight tech writing as if you're writing a standalone explainer. Include any relevant links inline.

5. CLOSING NOTE — a short paragraph wrapping up the edition.

6. Then an hr tag, followed by a short paragraph: 'Brought to you by the PacePort Applied AI team.'

Rank the sections by how interesting or novel the topic is, not by the order they appeared in the transcript. Lead with the strongest stuff.

Return ONLY the HTML. No markdown. No code fences.`

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const upload = multer({ dest: '/tmp' })

function httpError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

async function extractText(file) {
  const extension = path.extname(file.originalname).toLowerCase()

  try {
    if (extension === '.docx') {
      const { value } = await mammoth.extractRawText({ path: file.path })
      return value
    }

    if (extension === '.pdf') {
      const buffer = await fs.readFile(file.path)
      const parser = new PDFParse({ data: buffer })
      const { text } = await parser.getText()
      return text
    }
  } catch {
    throw httpError(500, 'Failed to extract text from the uploaded file.')
  }

  throw httpError(400, 'Unsupported file type. Please upload a .docx or .pdf file.')
}

function parseClaudeJson(text) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/, '')
    .replace(/```\s*$/, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    throw httpError(502, 'Claude returned invalid JSON.')
  }
}

async function generateArticle(transcript) {
  let message
  try {
    message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: transcript }],
    })
  } catch {
    throw httpError(502, 'Failed to generate the article from Claude.')
  }

  const responseText = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')

  return parseClaudeJson(responseText)
}

function cleanHtmlResponse(text) {
  return text
    .trim()
    .replace(/^```(?:html)?\s*/, '')
    .replace(/```\s*$/, '')
    .trim()
}

async function generateHtml(structuredData) {
  let message
  try {
    message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: TEMPLATE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: JSON.stringify(structuredData) }],
    })
  } catch {
    throw httpError(502, 'Failed to generate the article HTML from Claude.')
  }

  const responseText = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')

  return cleanHtmlResponse(responseText)
}

const app = express()
app.use(cors())
app.use(express.json())

app.post('/api/extract', upload.single('file'), async (req, res, next) => {
  if (!req.file) {
    next(httpError(400, 'No file uploaded.'))
    return
  }

  try {
    const transcript = await extractText(req.file)
    if (!transcript.trim()) {
      next(httpError(400, 'The uploaded file has no readable text.'))
      return
    }

    const article = await generateArticle(transcript)
    res.json(article)
  } catch (err) {
    next(err)
  } finally {
    await fs.unlink(req.file.path).catch(() => {})
  }
})

app.post('/api/template', async (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    next(httpError(400, 'Request body must be the structured JSON from /api/extract.'))
    return
  }

  try {
    const html = await generateHtml(req.body)
    res.json({ html })
  } catch (err) {
    next(err)
  }
})

app.post('/api/process', upload.single('file'), async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const sendEvent = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`)
  }

  if (!req.file) {
    sendEvent({ status: 'error', error: 'No file uploaded.' })
    res.end()
    return
  }

  try {
    sendEvent({ status: 'extracting' })
    const transcript = await extractText(req.file)
    if (!transcript.trim()) {
      sendEvent({ status: 'error', error: 'The uploaded file has no readable text.' })
      return
    }

    sendEvent({ status: 'structuring' })
    const structured = await generateArticle(transcript)

    sendEvent({ status: 'formatting' })
    const html = await generateHtml(structured)

    sendEvent({ status: 'done', html })
  } catch (err) {
    sendEvent({ status: 'error', error: err.message || 'Something went wrong.' })
  } finally {
    await fs.unlink(req.file.path).catch(() => {})
    res.end()
  }
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Something went wrong.' })
})

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})

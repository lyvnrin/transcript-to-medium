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

const PORT = 3001
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

const app = express()
app.use(cors())

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

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Something went wrong.' })
})

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})

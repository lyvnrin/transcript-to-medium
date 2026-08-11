import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

async function extractTxt(file) {
  return file.text()
}

async function extractDocx(file) {
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const { value } = await mammoth.extractRawText({ arrayBuffer })
  return value
}

async function extractPdf(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pageTexts = []
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    pageTexts.push(content.items.map((item) => item.str).join(' '))
  }
  return pageTexts.join('\n\n')
}

// Reads a .txt, .docx, or .pdf file and returns its plain text contents.
export async function parseTranscriptFile(file) {
  const extension = file.name.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'txt':
      return extractTxt(file)
    case 'docx':
      return extractDocx(file)
    case 'pdf':
      return extractPdf(file)
    default:
      throw new Error('Unsupported file type. Please upload a .txt, .docx, or .pdf file.')
  }
}

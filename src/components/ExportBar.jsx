import { useState } from 'react'
import { copyToClipboard, downloadAsPdf, downloadTextFile, htmlToMarkdown } from '../utils/export.js'

function ExportBar({ article, onRegenerate, canRegenerate = true }) {
  const [status, setStatus] = useState('')

  const flash = (message) => {
    setStatus(message)
    setTimeout(() => setStatus(''), 1800)
  }

  const handleCopy = async () => {
    await copyToClipboard(article.html)
    flash('Copied to clipboard')
  }

  const handleSaveMarkdown = () => {
    downloadTextFile(htmlToMarkdown(article.html), `edition-${article.id}.md`, 'text/markdown')
  }

  const handleDownloadPdf = () => {
    downloadAsPdf(article.html, `Edition ${article.id}`)
  }

  return (
    <div className="export-bar">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={onRegenerate}
        disabled={!canRegenerate}
        title={canRegenerate ? undefined : 'The original transcript file isn’t available in this session.'}
      >
        Regenerate
      </button>
      <button type="button" className="btn btn-primary" onClick={handleCopy}>
        Copy to clipboard
      </button>
      <button type="button" className="btn btn-secondary" onClick={handleSaveMarkdown}>
        Save as .md
      </button>
      <button type="button" className="btn btn-secondary" onClick={handleDownloadPdf}>
        Download as PDF
      </button>
      {status && <span className="export-status">{status}</span>}
    </div>
  )
}

export default ExportBar

import { useState } from 'react'
import { copyToClipboard } from '../utils/export.js'

function ExportBar({ article, onReset, onBrowse }) {
  const [status, setStatus] = useState('')

  const flash = (message) => {
    setStatus(message)
    setTimeout(() => setStatus(''), 1800)
  }

  const handleCopy = async () => {
    await copyToClipboard(article.html)
    flash('Copied to clipboard')
  }

  const handleSendToMedium = () => {
    flash('Medium publishing is coming soon')
  }

  return (
    <div className="export-bar">
      <div className="export-actions">
        <button type="button" className="btn btn-primary" onClick={handleCopy}>
          Copy to clipboard
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleSendToMedium}>
          Send to Medium as draft
        </button>
      </div>
      {status && <span className="export-status">{status}</span>}
      <div className="export-nav">
        <button type="button" className="text-link" onClick={onBrowse}>
          Past editions
        </button>
        <button type="button" className="text-link" onClick={onReset}>
          Start over
        </button>
      </div>
    </div>
  )
}

export default ExportBar

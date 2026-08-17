import { useState } from 'react'
import { copyToClipboard } from '../utils/export.js'

function ExportBar({ article }) {
  const [status, setStatus] = useState('')

  const flash = (message) => {
    setStatus(message)
    setTimeout(() => setStatus(''), 1800)
  }

  const handleCopy = async () => {
    await copyToClipboard(article.html)
    flash('Copied to clipboard')
  }

  return (
    <div className="export-bar">
      <button type="button" className="btn btn-primary" onClick={handleCopy}>
        Copy to clipboard
      </button>
      {status && <span className="export-status">{status}</span>}
    </div>
  )
}

export default ExportBar

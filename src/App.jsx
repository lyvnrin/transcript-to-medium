import { useState } from 'react'
import UploadZone from './components/UploadZone.jsx'
import ArticlePreview from './components/ArticlePreview.jsx'
import ExportBar from './components/ExportBar.jsx'
import { convertTranscript } from './utils/api.js'
import { parseTranscriptFile } from './utils/parseFile.js'
import './App.css'

function App() {
  const [status, setStatus] = useState('upload') // 'upload' | 'processing' | 'preview'
  const [file, setFile] = useState(null)
  const [processingMessage, setProcessingMessage] = useState('')
  const [article, setArticle] = useState(null)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!file) return

    setError('')
    setStatus('processing')
    setProcessingMessage('Extracting content...')

    try {
      const transcript = await parseTranscriptFile(file)
      setProcessingMessage('Building article...')
      const result = await convertTranscript(transcript)
      setArticle(result)
      setStatus('preview')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setStatus('upload')
    }
  }

  const handleReset = () => {
    setFile(null)
    setArticle(null)
    setError('')
    setStatus('upload')
  }

  return (
    <div className="app">
      {status !== 'preview' && (
        <header className="app-header">
          <h1>Transcript to Medium</h1>
          <p>Turn Applied AI session transcripts into polished Medium articles</p>
        </header>
      )}

      <main className="app-main">
        {status === 'upload' && (
          <div className="upload-stage">
            <UploadZone file={file} onFileSelected={setFile} />
            {error && <p className="app-error">{error}</p>}
            <button
              type="button"
              className="btn btn-primary generate-btn"
              disabled={!file}
              onClick={handleGenerate}
            >
              Generate article
            </button>
          </div>
        )}

        {status === 'processing' && (
          <div className="processing-stage">
            <div className="spinner" />
            <p className="processing-message">{processingMessage}</p>
          </div>
        )}

        {status === 'preview' && article && (
          <div className="preview-stage">
            <ArticlePreview article={article} />
            <ExportBar article={article} onReset={handleReset} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App

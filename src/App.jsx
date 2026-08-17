import { useEffect, useState } from 'react'
import UploadZone from './components/UploadZone.jsx'
import ArticlePreview from './components/ArticlePreview.jsx'
import ExportBar from './components/ExportBar.jsx'
import EditionsList from './components/EditionsList.jsx'
import { processTranscript, fetchEditions, fetchEdition } from './utils/api.js'
import './App.css'

const STATUS_MESSAGES = {
  extracting: 'Extracting content...',
  structuring: 'Structuring article...',
  previewing: 'Fetching link previews...',
  formatting: 'Formatting for Medium...',
}

const LAST_EDITION_KEY = 'transcript-to-medium:last-edition-id'

function App() {
  const [view, setView] = useState('upload') // 'upload' | 'processing' | 'preview' | 'history'
  const [file, setFile] = useState(null)
  const [processingMessage, setProcessingMessage] = useState('')
  const [article, setArticle] = useState(null) // { id, html }
  const [editions, setEditions] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const lastId = localStorage.getItem(LAST_EDITION_KEY)
    if (!lastId) return

    fetchEdition(lastId)
      .then((edition) => {
        setArticle({ id: edition.id, html: edition.html })
        setView('preview')
      })
      .catch(() => localStorage.removeItem(LAST_EDITION_KEY))
  }, [])

  const handleGenerate = async () => {
    if (!file) return

    setError('')
    setView('processing')
    setProcessingMessage(STATUS_MESSAGES.extracting)

    try {
      const { html, id } = await processTranscript(file, (stage) => {
        setProcessingMessage(STATUS_MESSAGES[stage] || '')
      })
      setArticle({ id, html })
      localStorage.setItem(LAST_EDITION_KEY, id)
      setView('preview')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setView('upload')
    }
  }

  const handleReset = () => {
    setFile(null)
    setArticle(null)
    setError('')
    localStorage.removeItem(LAST_EDITION_KEY)
    setView('upload')
  }

  const openHistory = async () => {
    setError('')
    setView('history')
    try {
      setEditions(await fetchEditions())
    } catch (err) {
      setError(err.message || 'Failed to load past editions.')
    }
  }

  const openEdition = async (id) => {
    try {
      const edition = await fetchEdition(id)
      setArticle({ id: edition.id, html: edition.html })
      localStorage.setItem(LAST_EDITION_KEY, edition.id)
      setView('preview')
    } catch (err) {
      setError(err.message || 'Failed to load that edition.')
    }
  }

  return (
    <div className="app">
      {view !== 'preview' && view !== 'processing' && (
        <header className="app-header">
          <h1>Transcript to Medium</h1>
          <p>Turn Applied AI session transcripts into polished Medium articles</p>
          <nav className="app-nav">
            <button type="button" className={view === 'upload' ? 'active' : ''} onClick={handleReset}>
              New edition
            </button>
            <button type="button" className={view === 'history' ? 'active' : ''} onClick={openHistory}>
              Past editions
            </button>
          </nav>
        </header>
      )}

      <main className="app-main">
        {view === 'upload' && (
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

        {view === 'processing' && (
          <div className="processing-stage">
            <div className="spinner" />
            <p className="processing-message">{processingMessage}</p>
          </div>
        )}

        {view === 'history' && (
          <div className="history-stage">
            {error && <p className="app-error">{error}</p>}
            <EditionsList editions={editions} onSelect={openEdition} />
          </div>
        )}

        {view === 'preview' && article && (
          <div className="preview-stage">
            <ArticlePreview html={article.html} />
            <ExportBar article={article} onReset={handleReset} onBrowse={openHistory} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App

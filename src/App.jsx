import { useEffect, useState } from 'react'
import Grainient from './components/Grainient/Grainient.jsx'
import UploadZone from './components/UploadZone.jsx'
import ArticlePreview from './components/ArticlePreview.jsx'
import ExportBar from './components/ExportBar.jsx'
import EditionsList from './components/EditionsList.jsx'
import ArticleMenu from './components/ArticleMenu.jsx'
import BackToTop from './components/BackToTop.jsx'
import InfoPage from './components/InfoPage.jsx'
import { processTranscript, fetchEditions, fetchEdition, deleteAllEditions } from './utils/api.js'
import './App.css'

const STATUS_MESSAGES = {
  extracting: 'Extracting content...',
  structuring: 'Structuring article...',
  previewing: 'Fetching link previews...',
  formatting: 'Formatting for Medium...',
}

const LAST_EDITION_KEY = 'transcript-to-medium:last-edition-id'
const THEME_KEY = 'transcript-to-medium:theme'

function toArticle(edition) {
  return { id: edition.id, html: edition.html, sourceFilename: edition.source_filename }
}

function App() {
  const [view, setView] = useState('upload') // 'upload' | 'processing' | 'preview' | 'history' | 'info'
  const [file, setFile] = useState(null)
  const [processingMessage, setProcessingMessage] = useState('')
  const [article, setArticle] = useState(null) // { id, html, sourceFilename }
  const [editions, setEditions] = useState([])
  const [editionSearch, setEditionSearch] = useState('')
  const [panelSearch, setPanelSearch] = useState('')
  const [editionsPanelOpen, setEditionsPanelOpen] = useState(false)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light')
  const isLanding = view !== 'preview' && view !== 'processing'

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    const loadPath = async (pathname) => {
      setError('')
      const editionMatch = pathname.match(/^\/edition\/(\d+)$/)

      if (editionMatch) {
        try {
          const edition = await fetchEdition(Number(editionMatch[1]))
          setArticle(toArticle(edition))
          localStorage.setItem(LAST_EDITION_KEY, edition.id)
          setView('preview')
        } catch {
          localStorage.removeItem(LAST_EDITION_KEY)
          window.history.replaceState(null, '', '/')
          setView('upload')
        }
        return
      }

      if (pathname === '/history') {
        setView('history')
        try {
          setEditions(await fetchEditions())
        } catch (err) {
          setError(err.message || 'Failed to load past editions.')
        }
        return
      }

      if (pathname === '/info') {
        setView('info')
        return
      }

      setView('upload')
    }

    let initialPath = window.location.pathname
    if (initialPath === '/') {
      const lastId = localStorage.getItem(LAST_EDITION_KEY)
      if (lastId) {
        initialPath = `/edition/${lastId}`
        window.history.replaceState(null, '', initialPath)
      }
    }
    loadPath(initialPath)

    const onPopState = () => loadPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
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
      setArticle({ id, html, sourceFilename: file.name })
      localStorage.setItem(LAST_EDITION_KEY, id)
      window.history.pushState(null, '', `/edition/${id}`)
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
    setEditionsPanelOpen(false)
    localStorage.removeItem(LAST_EDITION_KEY)
    window.history.pushState(null, '', '/')
    setView('upload')
  }

  const openInfo = () => {
    window.history.pushState(null, '', '/info')
    setView('info')
  }

  const openHistory = async () => {
    setError('')
    setEditionSearch('')
    window.history.pushState(null, '', '/history')
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
      setArticle(toArticle(edition))
      localStorage.setItem(LAST_EDITION_KEY, edition.id)
      window.history.pushState(null, '', `/edition/${edition.id}`)
      setView('preview')
    } catch (err) {
      setError(err.message || 'Failed to load that edition.')
    }
  }

  const handleDeleteAllEditions = async () => {
    if (!editions.length) return
    if (!window.confirm('Delete all past editions? This cannot be undone.')) return

    try {
      await deleteAllEditions()
      setEditions([])
      localStorage.removeItem(LAST_EDITION_KEY)
    } catch (err) {
      setError(err.message || 'Failed to delete past editions.')
    }
  }

  const toggleEditionsPanel = async () => {
    if (editionsPanelOpen) {
      setEditionsPanelOpen(false)
      return
    }

    try {
      setEditions(await fetchEditions())
      setPanelSearch('')
      setEditionsPanelOpen(true)
    } catch (err) {
      setError(err.message || 'Failed to load past editions.')
    }
  }

  return (
    <div className="app">
      {isLanding && (
        <div className="landing-bg" aria-hidden="true">
          <Grainient
            color1="#f0ede5"
            color2="#b2d4dd"
            color3="#27293d"
            zoom={1.1}
            contrast={1.15}
            grainAmount={0.05}
            warpAmplitude={70}
          />
        </div>
      )}

      <div className={isLanding ? 'landing-panel' : 'view-passthrough'}>
      <div className={isLanding ? 'landing-card' : 'view-passthrough'}>

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
            <button type="button" className={view === 'info' ? 'active' : ''} onClick={openInfo}>
              How it works
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
            <p className="history-notice">
              Past editions are stored locally, not backed up or synced anywhere else. Deleting them here removes
              them for good.
            </p>

            <div className="history-toolbar">
              <input
                type="search"
                className="history-search"
                placeholder="Search past editions..."
                value={editionSearch}
                onChange={(event) => setEditionSearch(event.target.value)}
                aria-label="Search past editions"
              />
              <button
                type="button"
                className="btn btn-secondary history-delete-all"
                onClick={handleDeleteAllEditions}
                disabled={!editions.length}
              >
                Delete all
              </button>
            </div>

            {error && <p className="app-error">{error}</p>}
            <EditionsList
              editions={editions.filter((edition) =>
                edition.title.toLowerCase().includes(editionSearch.trim().toLowerCase()),
              )}
              onSelect={openEdition}
              emptyMessage={
                editionSearch.trim() && editions.length
                  ? 'No editions match your search.'
                  : undefined
              }
            />
          </div>
        )}

        {view === 'info' && <InfoPage />}

        {view === 'preview' && article && (
          <div className="preview-stage">
            <ArticleMenu
              article={article}
              onReset={handleReset}
              editionsPanelOpen={editionsPanelOpen}
              onToggleEditionsPanel={toggleEditionsPanel}
              theme={theme}
              onSetTheme={setTheme}
            />
            <BackToTop />

            <div className={`preview-layout${editionsPanelOpen ? ' with-panel' : ''}`}>
              <div className="preview-main">
                <ArticlePreview html={article.html} />
                <ExportBar article={article} />
              </div>

              {editionsPanelOpen && (
                <aside className="editions-panel">
                  <div className="editions-panel-header">
                    <h2>Past editions</h2>
                    <button
                      type="button"
                      className="editions-panel-close"
                      aria-label="Close past editions"
                      onClick={() => setEditionsPanelOpen(false)}
                    >
                      ×
                    </button>
                  </div>
                  <input
                    type="search"
                    className="history-search panel-search"
                    placeholder="Search past editions..."
                    value={panelSearch}
                    onChange={(event) => setPanelSearch(event.target.value)}
                    aria-label="Search past editions"
                  />
                  <EditionsList
                    editions={editions.filter((edition) =>
                      edition.title.toLowerCase().includes(panelSearch.trim().toLowerCase()),
                    )}
                    onSelect={openEdition}
                    activeId={article.id}
                    emptyMessage={
                      panelSearch.trim() && editions.length ? 'No editions match your search.' : undefined
                    }
                  />
                </aside>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Developed by Lavanya Kamble</p>
      </footer>

      </div>
      </div>
    </div>
  )
}

export default App

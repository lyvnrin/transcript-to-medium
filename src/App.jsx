import { useEffect, useState } from 'react'
import Grainient from './components/Grainient/Grainient.jsx'
import UploadZone from './components/UploadZone.jsx'
import ArticlePreview from './components/ArticlePreview.jsx'
import ExportBar from './components/ExportBar.jsx'
import EditionsList from './components/EditionsList.jsx'
import ArticleMenu from './components/ArticleMenu.jsx'
import ArticleSettingsFields from './components/ArticleSettingsFields.jsx'
import Stepper, { Step } from './components/Stepper/Stepper.jsx'
import Pill from './components/Pill.jsx'
import BackToTop from './components/BackToTop.jsx'
import InfoPage from './components/InfoPage.jsx'
import { processTranscript, fetchEditions, fetchEdition, deleteAllEditions, deleteEdition } from './utils/api.js'
import './App.css'

const STATUS_MESSAGES = {
  extracting: 'Extracting content...',
  structuring: 'Structuring article...',
  'fact-checking': 'Fact-checking attributions...',
  previewing: 'Fetching link previews...',
  formatting: 'Formatting for Medium...',
}

const STEP_LABELS = ['Upload', 'Settings', 'Review']
const TICKER_LIMIT = 6

const LAST_EDITION_KEY = 'transcript-to-medium:last-edition-id'
const THEME_KEY = 'transcript-to-medium:theme'

const DEFAULT_ARTICLE_SETTINGS = {
  length: 'standard',
  tone: 'editorial',
  tldr: false,
  pullQuotes: false,
  audience: 'general',
}

function toArticle(edition) {
  return { id: edition.id, html: edition.html, sourceFilename: edition.source_filename }
}

function App() {
  const [view, setView] = useState('home') // 'home' | 'history' | 'info'
  const [step, setStep] = useState(1) // 1 upload, 2 settings, 3 review — only meaningful for 'home'
  const [file, setFile] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [processingMessage, setProcessingMessage] = useState('')
  const [article, setArticle] = useState(null) // { id, html, sourceFilename }
  const [articleSettings, setArticleSettings] = useState(DEFAULT_ARTICLE_SETTINGS)
  const [editions, setEditions] = useState([])
  const [editionSearch, setEditionSearch] = useState('')
  const [error, setError] = useState('')
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light')
  const isWorkspace = view === 'home' && step === 3
  const isLanding = !isWorkspace
  const unlockedStep = article ? 3 : file ? 2 : 1

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
          setView('home')
          setStep(3)
        } catch {
          localStorage.removeItem(LAST_EDITION_KEY)
          window.history.replaceState(null, '', '/')
          setView('home')
          setStep(1)
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

      setView('home')
      setStep(1)
    }

    loadPath(window.location.pathname)

    const onPopState = () => loadPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Keep the review-step ticker fresh whenever a fresh or newly regenerated article lands there.
  useEffect(() => {
    if (view !== 'home' || step !== 3 || !article || generating) return
    let cancelled = false
    fetchEditions()
      .then((list) => {
        if (!cancelled) setEditions(list)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [view, step, article?.id, generating])

  const handleGenerate = async () => {
    if (!file) return

    setError('')
    setStep(3)
    setGenerating(true)
    setProcessingMessage(STATUS_MESSAGES.extracting)

    try {
      const { html, id } = await processTranscript(file, articleSettings, (stage) => {
        setProcessingMessage(STATUS_MESSAGES[stage] || '')
      })
      setArticle({ id, html, sourceFilename: file.name })
      localStorage.setItem(LAST_EDITION_KEY, id)
      window.history.pushState(null, '', `/edition/${id}`)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setStep(2)
    } finally {
      setGenerating(false)
    }
  }

  const handleStepChange = (newStep) => {
    const isGenerateStep = step === 2 && newStep === 3
    if (newStep > unlockedStep && !isGenerateStep) return
    if (isGenerateStep) {
      handleGenerate()
      return
    }
    setStep(newStep)
  }

  const handleReset = () => {
    setFile(null)
    setArticle(null)
    setStep(1)
    setError('')
    localStorage.removeItem(LAST_EDITION_KEY)
    window.history.pushState(null, '', '/')
    setView('home')
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
      setView('home')
      setStep(3)
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

  const handleDeleteEdition = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return

    try {
      await deleteEdition(id)
      setEditions((prev) => prev.filter((edition) => edition.id !== id))
      if (localStorage.getItem(LAST_EDITION_KEY) === String(id)) {
        localStorage.removeItem(LAST_EDITION_KEY)
      }
      if (article?.id === id) {
        handleReset()
      }
    } catch (err) {
      setError(err.message || 'Failed to delete that edition.')
    }
  }

  return (
    <div className={`app${isWorkspace ? ' is-workspace' : ''}`}>
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

      {isLanding && (
        <header className="app-header">
          <h1>Transcript to Medium</h1>
          <p>Turn Applied AI session transcripts into polished Medium articles</p>
          <nav className="app-nav">
            <button type="button" className={view === 'home' ? 'active' : ''} onClick={handleReset}>
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
        {isWorkspace && (
          <div className="workspace-toolbar">
            <div className="pill-nav-items">
              <Pill label="Home" onClick={handleReset} />
              {article && <ArticleMenu article={article} theme={theme} onSetTheme={setTheme} />}
            </div>
          </div>
        )}

        {view === 'home' && (
          <div className={isWorkspace ? 'stepper-stage stepper-stage-wide' : 'stepper-stage'}>
            <Stepper
              currentStep={step}
              onStepChange={handleStepChange}
              labels={STEP_LABELS}
              nextLabel={step === 2 ? 'Generate article' : 'Next'}
              nextDisabled={step === 1 && !file}
              hideNext={step === 3}
              disableStepIndicators={generating}
            >
              <Step>
                <UploadZone file={file} onFileSelected={setFile} />
              </Step>

              <Step>
                <ArticleSettingsFields settings={articleSettings} onChange={setArticleSettings} />
                {error && <p className="app-error">{error}</p>}
              </Step>

              <Step>
                {generating ? (
                  <div className="processing-inline">
                    <div className="spinner" />
                    <p className="processing-message">{processingMessage}</p>
                  </div>
                ) : article ? (
                  <>
                    <span className="edition-badge">Edition #{article.id}</span>
                    <ArticlePreview html={article.html} />
                    <ExportBar article={article} onRegenerate={handleGenerate} canRegenerate={!!file} />
                    {error && <p className="app-error">{error}</p>}

                    <div className="ticker-section">
                      <div className="ticker-header">
                        <p className="article-menu-label">Past editions</p>
                        <button type="button" className="ticker-view-all" onClick={openHistory}>
                          View all
                        </button>
                      </div>
                      <EditionsList
                        editions={editions.slice(0, TICKER_LIMIT)}
                        onSelect={openEdition}
                        onDelete={handleDeleteEdition}
                        activeId={article.id}
                        emptyMessage="No past editions yet."
                      />
                    </div>
                  </>
                ) : null}
              </Step>
            </Stepper>
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
              onDelete={handleDeleteEdition}
              emptyMessage={
                editionSearch.trim() && editions.length
                  ? 'No editions match your search.'
                  : undefined
              }
            />
          </div>
        )}

        {view === 'info' && <InfoPage />}
      </main>

      {isWorkspace && <BackToTop />}

      {!isWorkspace && (
        <footer className="app-footer">
          <p>Developed by Lavanya Kamble</p>
        </footer>
      )}

      </div>
      </div>
    </div>
  )
}

export default App

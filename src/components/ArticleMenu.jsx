import { useEffect, useMemo, useRef, useState } from 'react'

function countWords(html) {
  const text = html.replace(/<[^>]+>/g, ' ')
  const matches = text.trim().match(/\S+/g)
  return matches ? matches.length : 0
}

function ArticleMenu({ article, theme, onSetTheme }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const wordCount = useMemo(() => countWords(article.html), [article.html])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false)
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="article-menu" ref={menuRef}>
      <button
        type="button"
        className="article-menu-trigger"
        aria-label="Options"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        Options
      </button>

      {open && (
        <div className="article-menu-panel">
          <div className="article-menu-section">
            <p className="article-menu-label">This edition</p>
            <p className="article-menu-detail">Edition #{article.id}</p>
            <p className="article-menu-detail">Source: {article.sourceFilename || 'Unknown'}</p>
          </div>

          <div className="article-menu-section">
            <p className="article-menu-label">Appearance</p>
            <div className="theme-toggle">
              <button
                type="button"
                className={theme === 'light' ? 'active' : ''}
                onClick={() => onSetTheme('light')}
              >
                Light
              </button>
              <button type="button" className={theme === 'dark' ? 'active' : ''} onClick={() => onSetTheme('dark')}>
                Dark
              </button>
            </div>
          </div>

          <div className="article-menu-section">
            <p className="article-menu-label">Word count</p>
            <p className="article-menu-detail">{wordCount.toLocaleString()} words</p>
          </div>

          <button type="button" className="article-menu-item article-menu-item-bottom" disabled>
            Download as PDF
          </button>
        </div>
      )}
    </div>
  )
}

export default ArticleMenu

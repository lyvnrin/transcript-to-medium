import { useEffect, useRef, useState } from 'react'
import EditionsList from './EditionsList.jsx'

function PastEditionsMenu({ editions, activeId, onSelect, onOpen }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const menuRef = useRef(null)

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

  const handleToggle = async () => {
    if (open) {
      setOpen(false)
      return
    }
    setSearch('')
    await onOpen()
    setOpen(true)
  }

  const handleSelect = (id) => {
    setOpen(false)
    onSelect(id)
  }

  const filtered = editions.filter((edition) => edition.title.toLowerCase().includes(search.trim().toLowerCase()))

  return (
    <div className="article-menu" ref={menuRef}>
      <button
        type="button"
        className="article-menu-trigger"
        aria-label="Past editions"
        aria-expanded={open}
        onClick={handleToggle}
      >
        Past editions
      </button>

      {open && (
        <div className="article-menu-panel editions-dropdown">
          <input
            type="search"
            className="history-search panel-search"
            placeholder="Search past editions..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search past editions"
          />
          <EditionsList
            editions={filtered}
            onSelect={handleSelect}
            activeId={activeId}
            emptyMessage={search.trim() && editions.length ? 'No editions match your search.' : undefined}
          />
        </div>
      )}
    </div>
  )
}

export default PastEditionsMenu

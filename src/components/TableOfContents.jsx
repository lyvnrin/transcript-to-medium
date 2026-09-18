import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

function TableOfContents({ containerRef, html }) {
  const [headings, setHeadings] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [flashId, setFlashId] = useState(null)
  const [atBottom, setAtBottom] = useState(true)
  const listRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const elements = Array.from(container.querySelectorAll('h2'))
    const items = elements.map((el, index) => {
      const id = `toc-section-${index}`
      el.id = id
      return { id, text: el.textContent }
    })
    setHeadings(items)
    if (!items.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: '-15% 0px -75% 0px' },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [containerRef, html])

  const updateAtBottom = () => {
    const el = listRef.current
    if (!el) return
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 2)
  }

  useEffect(() => {
    updateAtBottom()
  }, [headings])

  if (headings.length < 2) return null

  const keyTakeaways = headings.find((heading) => heading.text.trim().toLowerCase() === 'key takeaways')
  const sections = headings.filter((heading) => heading !== keyTakeaways)

  const handleClick = (id) => (event) => {
    event.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setFlashId(id)
    window.setTimeout(() => setFlashId((current) => (current === id ? null : current)), 900)
  }

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return createPortal(
    <nav className="toc" aria-label="Section contents">
      <p className="toc-label">Contents</p>
      <div className={`toc-scroll${atBottom ? ' at-bottom' : ''}`}>
        <ul className="toc-list" ref={listRef} onScroll={updateAtBottom}>
          {keyTakeaways && (
            <li>
              <a
                href={`#${keyTakeaways.id}`}
                className={`toc-link toc-link-minor${keyTakeaways.id === activeId ? ' is-active' : ''}${keyTakeaways.id === flashId ? ' toc-link-flash' : ''}`}
                onClick={handleClick(keyTakeaways.id)}
              >
                {keyTakeaways.text}
              </a>
            </li>
          )}
          {sections.map((heading, index) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={`toc-link${heading.id === activeId ? ' is-active' : ''}${heading.id === flashId ? ' toc-link-flash' : ''}`}
                onClick={handleClick(heading.id)}
              >
                <span className="toc-number">{index + 1}</span>
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <button type="button" className="toc-top-link" onClick={handleBackToTop}>
        Back to top
      </button>
    </nav>,
    document.body,
  )
}

export default TableOfContents

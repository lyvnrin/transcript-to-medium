import { useEffect, useState } from 'react'

function TableOfContents({ containerRef, html }) {
  const [headings, setHeadings] = useState([])
  const [activeId, setActiveId] = useState(null)

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

  if (headings.length < 2) return null

  const keyTakeaways = headings.find((heading) => heading.text.trim().toLowerCase() === 'key takeaways')
  const sections = headings.filter((heading) => heading !== keyTakeaways)

  const handleClick = (id) => (event) => {
    event.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="toc" aria-label="Section contents">
      <p className="toc-label">Contents</p>
      <ul className="toc-list">
        {keyTakeaways && (
          <li>
            <a
              href={`#${keyTakeaways.id}`}
              className={`toc-link toc-link-minor${keyTakeaways.id === activeId ? ' is-active' : ''}`}
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
              className={`toc-link${heading.id === activeId ? ' is-active' : ''}`}
              onClick={handleClick(heading.id)}
            >
              <span className="toc-number">{index + 1}</span>
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default TableOfContents

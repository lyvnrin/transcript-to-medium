function formatDateTime(sqliteTimestamp) {
  return new Date(`${sqliteTimestamp.replace(' ', 'T')}Z`).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function EditionsList({
  editions,
  onSelect,
  onDelete,
  activeId,
  emptyMessage = 'No past editions yet. Generate one to see it here.',
}) {
  if (!editions.length) {
    return <p className="editions-empty">{emptyMessage}</p>
  }

  const handleClick = (event, id) => {
    // Let ctrl/cmd/middle/shift-click fall through to native "open in new tab" behavior.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    onSelect(id)
  }

  const handleDeleteClick = (event, edition) => {
    event.preventDefault()
    event.stopPropagation()
    onDelete(edition.id, edition.title)
  }

  return (
    <ul className="editions-list">
      {editions.map((edition) => (
        <li key={edition.id} className="edition-row">
          <a
            href={`/edition/${edition.id}`}
            className={`edition-item${edition.id === activeId ? ' is-active' : ''}`}
            onClick={(event) => handleClick(event, edition.id)}
          >
            <div className="edition-item-main">
              <span className="edition-index">Edition #{edition.id}</span>
              <span className="edition-title">{edition.title}</span>
            </div>
            <span className="edition-date">{formatDateTime(edition.created_at)}</span>
          </a>

          {onDelete && (
            <button
              type="button"
              className="edition-delete"
              aria-label={`Delete edition #${edition.id}`}
              onClick={(event) => handleDeleteClick(event, edition)}
            >
              ×
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

export default EditionsList

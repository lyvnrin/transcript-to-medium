function formatDateTime(sqliteTimestamp) {
  return new Date(`${sqliteTimestamp.replace(' ', 'T')}Z`).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function EditionsList({ editions, onSelect, activeId }) {
  if (!editions.length) {
    return <p className="editions-empty">No past editions yet. Generate one to see it here.</p>
  }

  return (
    <ul className="editions-list">
      {editions.map((edition) => (
        <li key={edition.id}>
          <button
            type="button"
            className={`edition-item${edition.id === activeId ? ' is-active' : ''}`}
            onClick={() => onSelect(edition.id)}
          >
            <div className="edition-item-main">
              <span className="edition-index">Edition #{edition.id}</span>
              <span className="edition-title">{edition.title}</span>
            </div>
            <span className="edition-date">{formatDateTime(edition.created_at)}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default EditionsList

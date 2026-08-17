function formatDate(sqliteTimestamp) {
  return new Date(`${sqliteTimestamp.replace(' ', 'T')}Z`).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function EditionsList({ editions, onSelect }) {
  if (!editions.length) {
    return <p className="editions-empty">No past editions yet. Generate one to see it here.</p>
  }

  return (
    <ul className="editions-list">
      {editions.map((edition) => (
        <li key={edition.id}>
          <button type="button" className="edition-item" onClick={() => onSelect(edition.id)}>
            <span className="edition-title">{edition.title}</span>
            <span className="edition-date">{formatDate(edition.created_at)}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default EditionsList

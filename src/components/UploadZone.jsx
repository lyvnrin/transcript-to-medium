import { useRef, useState } from 'react'

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.md']
const MAX_EXTRA_FILES = 5

function isAccepted(file) {
  return ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
}

function UploadZone({ file, onFileSelected, extraFiles, onExtraFilesChange }) {
  const [extrasOpen, setExtrasOpen] = useState(extraFiles.length > 0)
  const [isExtraDragging, setIsExtraDragging] = useState(false)
  const [extraError, setExtraError] = useState('')
  const extraInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState('')
  const inputRef = useRef(null)

  const handleFiles = (fileList) => {
    const selected = fileList?.[0]
    if (!selected) return

    if (!isAccepted(selected)) {
      setLocalError('Please upload a .pdf, .docx or .md file.')
      return
    }

    setLocalError('')
    onFileSelected(selected)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  const handleExtraFiles = (fileList) => {
    const incoming = Array.from(fileList || [])
    if (!incoming.length) return

    const valid = incoming.filter(isAccepted)
    const known = new Set(extraFiles.map((f) => `${f.name}:${f.size}`))
    const fresh = valid.filter((f) => !known.has(`${f.name}:${f.size}`))
    const merged = [...extraFiles, ...fresh].slice(0, MAX_EXTRA_FILES)

    if (valid.length < incoming.length) setExtraError('Only .pdf, .docx or .md files are accepted.')
    else if (extraFiles.length + fresh.length > MAX_EXTRA_FILES) setExtraError(`Up to ${MAX_EXTRA_FILES} extra files.`)
    else setExtraError('')

    onExtraFilesChange(merged)
  }

  const removeExtra = (index) => {
    setExtraError('')
    onExtraFilesChange(extraFiles.filter((_, i) => i !== index))
  }

  return (
    <div className="upload-wrap">
      <div
        className={`upload-zone${isDragging ? ' is-dragging' : ''}${file ? ' has-file' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click()
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.md"
          className="visually-hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
        {file ? (
          <>
            <p className="upload-zone-title">{file.name}</p>
            <p className="upload-zone-hint">Click or drop to replace</p>
          </>
        ) : (
          <>
            <p className="upload-zone-title">Drop your transcript here</p>
            <p className="upload-zone-hint">or click to browse — .pdf, .docx or .md</p>
          </>
        )}
      </div>
      {localError && <p className="upload-error">{localError}</p>}

      <button
        type="button"
        className="ticker-toggle extras-toggle"
        onClick={() => setExtrasOpen((open) => !open)}
        aria-expanded={extrasOpen}
      >
        <span className={`ticker-chevron${extrasOpen ? ' is-open' : ''}`} aria-hidden="true">
          ▸
        </span>
        Add optional files{extraFiles.length > 0 && ` (${extraFiles.length})`}
      </button>

      {extrasOpen && (
        <>
          <div
            className={`upload-zone upload-zone-small${isExtraDragging ? ' is-dragging' : ''}${extraFiles.length ? ' has-file' : ''}`}
            onClick={() => extraInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault()
              setIsExtraDragging(true)
            }}
            onDragLeave={() => setIsExtraDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setIsExtraDragging(false)
              handleExtraFiles(event.dataTransfer.files)
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') extraInputRef.current?.click()
            }}
          >
            <input
              ref={extraInputRef}
              type="file"
              accept=".pdf,.docx,.md"
              multiple
              className="visually-hidden"
              onChange={(event) => {
                handleExtraFiles(event.target.files)
                event.target.value = ''
              }}
            />
            <p className="upload-zone-title">Drop chat threads or extra notes</p>
            <p className="upload-zone-hint">up to {MAX_EXTRA_FILES} files — .pdf, .docx or .md</p>
          </div>

          {extraFiles.length > 0 && (
            <ul className="extra-files">
              {extraFiles.map((extra, index) => (
                <li key={`${extra.name}:${extra.size}`}>
                  <span>{extra.name}</span>
                  <button type="button" onClick={() => removeExtra(index)} aria-label={`Remove ${extra.name}`}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          {extraError && <p className="upload-error">{extraError}</p>}
        </>
      )}
    </div>
  )
}

export default UploadZone

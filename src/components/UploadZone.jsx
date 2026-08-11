import { useRef, useState } from 'react'

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx']

function isAccepted(file) {
  return ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
}

function UploadZone({ file, onFileSelected }) {
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState('')
  const inputRef = useRef(null)

  const handleFiles = (fileList) => {
    const selected = fileList?.[0]
    if (!selected) return

    if (!isAccepted(selected)) {
      setLocalError('Please upload a .pdf or .docx file.')
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
          accept=".pdf,.docx"
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
            <p className="upload-zone-hint">or click to browse — .pdf or .docx</p>
          </>
        )}
      </div>
      {localError && <p className="upload-error">{localError}</p>}
    </div>
  )
}

export default UploadZone

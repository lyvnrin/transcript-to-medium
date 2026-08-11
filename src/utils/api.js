async function readJsonOrThrow(response, fallbackMessage) {
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.error || fallbackMessage)
  }
  return data
}

export async function extractTranscript(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/extract', {
    method: 'POST',
    body: formData,
  })

  return readJsonOrThrow(response, 'Failed to extract the transcript.')
}

export async function generateArticleHtml(structuredData) {
  const response = await fetch('/api/template', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(structuredData),
  })

  const data = await readJsonOrThrow(response, 'Failed to build the article.')
  return data.html
}

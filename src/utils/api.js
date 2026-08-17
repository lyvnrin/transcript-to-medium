export async function processTranscript(file, onStatus) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/process', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok || !response.body) {
    throw new Error('Failed to start processing.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''

    for (const event of events) {
      const line = event.split('\n').find((entry) => entry.startsWith('data: '))
      if (!line) continue

      const payload = JSON.parse(line.slice('data: '.length))

      if (payload.status === 'error') {
        throw new Error(payload.error || 'Something went wrong.')
      }

      if (payload.status === 'done') {
        return { html: payload.html, id: payload.id }
      }

      onStatus?.(payload.status)
    }
  }

  throw new Error('Connection closed before processing finished.')
}

export async function fetchEditions() {
  const response = await fetch('/api/editions')
  if (!response.ok) throw new Error('Failed to load past editions.')
  return response.json()
}

export async function fetchEdition(id) {
  const response = await fetch(`/api/editions/${id}`)
  if (!response.ok) throw new Error('Failed to load that edition.')
  return response.json()
}

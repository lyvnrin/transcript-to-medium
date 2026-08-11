function htmlToPlainText(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent?.trim() || ''
}

// Writes both text/html and text/plain so pasting into a rich-text editor
// like Medium's keeps formatting, with a plain-text fallback for editors
// that don't support the Clipboard API's multi-format write.
export async function copyToClipboard(html) {
  const plainText = htmlToPlainText(html)

  if (window.ClipboardItem) {
    try {
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
      })
      await navigator.clipboard.write([item])
      return
    } catch {
      // fall through to plain text
    }
  }

  await navigator.clipboard.writeText(plainText)
}

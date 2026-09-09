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

function inlineToMarkdown(node) {
  let text = ''
  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      text += child.textContent
      continue
    }
    const inner = inlineToMarkdown(child)
    switch (child.tagName) {
      case 'STRONG':
      case 'B':
        text += `**${inner}**`
        break
      case 'EM':
      case 'I':
        text += `*${inner}*`
        break
      case 'A':
        text += `[${inner}](${child.getAttribute('href') || ''})`
        break
      default:
        text += inner
    }
  }
  return text
}

function blockToMarkdown(node) {
  switch (node.tagName) {
    case 'H1':
      return `# ${inlineToMarkdown(node)}\n\n`
    case 'H2':
      return `## ${inlineToMarkdown(node)}\n\n`
    case 'H3':
      return `### ${inlineToMarkdown(node)}\n\n`
    case 'P':
      return `${inlineToMarkdown(node)}\n\n`
    case 'HR':
      return '---\n\n'
    case 'UL':
    case 'OL':
      return (
        Array.from(node.children)
          .map((li) => `- ${inlineToMarkdown(li)}`)
          .join('\n') + '\n\n'
      )
    case 'FIGURE': {
      const img = node.querySelector('img')
      const caption = node.querySelector('figcaption')
      const alt = img?.getAttribute('alt') || ''
      const src = img?.getAttribute('src') || ''
      const md = img ? `![${alt}](${src})\n\n` : ''
      return caption ? `${md}*${inlineToMarkdown(caption)}*\n\n` : md
    }
    default:
      return Array.from(node.children)
        .map(blockToMarkdown)
        .join('')
  }
}

export function htmlToMarkdown(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return Array.from(doc.body.children)
    .map(blockToMarkdown)
    .join('')
    .trim()
}

export function downloadTextFile(text, filename, mimeType) {
  const blob = new Blob([text], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// No PDF library in the project — route through the browser's native
// print-to-PDF instead of pulling in a rendering dependency.
export function downloadAsPdf(html, title) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 18px; line-height: 1.7; color: #27293d; max-width: 680px; margin: 40px auto; padding: 0 20px; }
  h1 { font-size: 34px; line-height: 1.25; }
  h2 { font-size: 24px; margin-top: 32px; }
  img { max-width: 100%; }
  hr { border: none; border-top: 1px solid #27293d; opacity: 0.5; margin: 28px 0 18px; }
</style>
</head>
<body>${html}</body>
</html>`)
  printWindow.document.close()
  printWindow.focus()
  printWindow.onload = () => printWindow.print()
}

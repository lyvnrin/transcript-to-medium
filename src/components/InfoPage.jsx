function InfoPage() {
  return (
    <div className="info-stage">
      <section className="info-section">
        <h2>Getting started</h2>
        <p>
          Drop a session transcript (a .pdf or .docx export of the meeting) into the upload zone on the New
          edition tab, or click it to browse for the file. Hit Generate article and the pipeline extracts the
          text, structures it into topics, fetches link previews for anything referenced, and formats the whole
          thing into a polished Medium-ready article.
        </p>
      </section>

      <section className="info-section">
        <h2>The article menu</h2>
        <p>Once an article is generated, the Menu link in the top right of the preview opens a panel with:</p>
        <ul>
          <li>
            <strong>Home:</strong> back to the upload screen to start a new edition.
          </li>
          <li>
            <strong>This edition:</strong> the edition number and the source file it was generated from.
          </li>
          <li>
            <strong>Past editions:</strong> opens a side panel listing every edition generated so far, so you can
            flick between them without losing your place.
          </li>
          <li>
            <strong>Light / Dark:</strong> switches the site's appearance, and your choice is remembered.
          </li>
          <li>
            <strong>Word count:</strong> a rough word count for the generated article.
          </li>
          <li>
            <strong>Download as PDF:</strong> not wired up yet.
          </li>
        </ul>
      </section>

      <section className="info-section">
        <h2>Publishing to Medium</h2>
        <p>
          Medium has stopped issuing new integration tokens, so there's no direct "publish" button here right
          now. The reliable workaround is Copy to clipboard, then paste straight into a new draft on medium.com.
          Medium's editor reads the copied content as rich formatted text, so headings, bold and italic text,
          links, and the embedded link-preview images all carry over correctly, with no manual reformatting
          needed.
        </p>
      </section>
    </div>
  )
}

export default InfoPage

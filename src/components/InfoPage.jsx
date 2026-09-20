function InfoPage() {
  return (
    <div className="info-stage">
      <section className="info-section">
        <h2>How it works</h2>
        <div className="info-steps">
          <div className="info-step">
            <span className="info-step-number">1</span>
            <p>
              Drop a <strong>.pdf</strong> or <strong>.docx</strong> transcript into the upload zone.
            </p>
          </div>
          <div className="info-step">
            <span className="info-step-number">2</span>
            <p>Tweak article settings — length, tone, audience.</p>
          </div>
          <div className="info-step">
            <span className="info-step-number">3</span>
            <p>
              Hit <strong>Generate</strong> and let the pipeline do its thing.
            </p>
          </div>
        </div>
      </section>

      <section className="info-section">
        <h2>Publishing</h2>
        <p>
          Copy the article to your clipboard, open a new Medium draft, and paste. Headings, links, and images
          carry over as-is.
        </p>
      </section>
    </div>
  )
}

export default InfoPage

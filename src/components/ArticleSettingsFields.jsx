const LENGTH_OPTIONS = [
  { value: 'quick', label: 'Quick Recap', hint: '~500 words' },
  { value: 'standard', label: 'Standard', hint: '~1000 words' },
  { value: 'deep', label: 'Deep Dive', hint: '~1800 words' },
]

const TONE_OPTIONS = [
  { value: 'casual', label: 'Casual', hint: 'Blog-friendly' },
  { value: 'editorial', label: 'Editorial', hint: 'Wired / Verge style' },
  { value: 'technical', label: 'Technical', hint: 'Jargon-forward' },
]

const AUDIENCE_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'developers', label: 'Developers' },
  { value: 'leadership', label: 'Leadership' },
]

function SegmentedField({ label, options, value, onChange }) {
  return (
    <div className="settings-field">
      <span className="settings-field-label">{label}</span>
      <div className="theme-toggle settings-segmented">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={value === option.value ? 'active' : ''}
            onClick={() => onChange(option.value)}
          >
            <span>{option.label}</span>
            <span className="settings-segmented-hint">{option.hint}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Chip({ label, active, onChange }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`settings-chip${active ? ' is-active' : ''}`}
      onClick={() => onChange(!active)}
    >
      {active ? '✓ ' : '+ '}
      {label}
    </button>
  )
}

function ArticleSettingsFields({ settings, onChange }) {
  const set = (key) => (value) => onChange({ ...settings, [key]: value })

  return (
    <div className="settings-fields">
      <SegmentedField label="Article Length" options={LENGTH_OPTIONS} value={settings.length} onChange={set('length')} />
      <SegmentedField label="Tone" options={TONE_OPTIONS} value={settings.tone} onChange={set('tone')} />

      <div className="settings-divider" />

      <div className="settings-chips-row">
        <Chip label="Include TL;DR" active={settings.tldr} onChange={set('tldr')} />
        <Chip label="Include Pull Quotes" active={settings.pullQuotes} onChange={set('pullQuotes')} />
      </div>

      <div className="settings-divider" />

      <div className="settings-audience-row">
        <div className="settings-audience-label-group">
          <label className="settings-field-label" htmlFor="settings-audience">
            Audience
          </label>
          <span className="settings-audience-hint">Who's reading this?</span>
        </div>
        <select
          id="settings-audience"
          className="settings-audience-select"
          value={settings.audience}
          onChange={(event) => set('audience')(event.target.value)}
        >
          {AUDIENCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default ArticleSettingsFields

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

function StopSlider({ label, options, value, onChange }) {
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const current = options[index]

  return (
    <div className="settings-field">
      <div className="settings-field-header">
        <span className="settings-field-label">{label}</span>
        <span className="settings-field-value">{current.label}</span>
      </div>
      <input
        type="range"
        className="settings-slider"
        min={0}
        max={options.length - 1}
        step={1}
        value={index}
        onChange={(event) => onChange(options[Number(event.target.value)].value)}
        aria-label={label}
      />
      <div className="settings-slider-ticks">
        {options.map((option) => (
          <span key={option.value}>{option.hint}</span>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="settings-toggle">
      <span className="settings-toggle-label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`settings-switch${checked ? ' is-on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="settings-switch-thumb" />
      </button>
    </div>
  )
}

function ArticleSettingsFields({ settings, onChange }) {
  const set = (key) => (value) => onChange({ ...settings, [key]: value })

  return (
    <div className="settings-fields">
      <StopSlider label="Article Length" options={LENGTH_OPTIONS} value={settings.length} onChange={set('length')} />
      <StopSlider label="Tone" options={TONE_OPTIONS} value={settings.tone} onChange={set('tone')} />

      <div className="settings-divider" />

      <Toggle label="Include TL;DR" checked={settings.tldr} onChange={set('tldr')} />
      <Toggle label="Include Pull Quotes" checked={settings.pullQuotes} onChange={set('pullQuotes')} />

      <div className="settings-divider" />

      <div className="settings-field">
        <span className="settings-field-label">Audience</span>
        <div className="theme-toggle settings-audience">
          {AUDIENCE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={settings.audience === option.value ? 'active' : ''}
              onClick={() => set('audience')(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ArticleSettingsFields

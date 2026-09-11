function IconBase({ children }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
}

function HomeIcon() {
  return (
    <IconBase>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </IconBase>
  )
}

function ClockIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </IconBase>
  )
}

function InfoIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-5" />
      <path d="M12 8h.01" />
    </IconBase>
  )
}

function LandingNav({ view, onHome, onHistory, onInfo }) {
  return (
    <nav className="landing-nav" aria-label="Primary">
      <button
        type="button"
        className={`landing-nav-icon${view === 'home' ? ' active' : ''}`}
        onClick={onHome}
        aria-label="Home"
        title="Home"
      >
        <HomeIcon />
      </button>
      <button
        type="button"
        className={`landing-nav-icon${view === 'history' ? ' active' : ''}`}
        onClick={onHistory}
        aria-label="Past editions"
        title="Past editions"
      >
        <ClockIcon />
      </button>
      <button
        type="button"
        className={`landing-nav-icon${view === 'info' ? ' active' : ''}`}
        onClick={onInfo}
        aria-label="How it works"
        title="How it works"
      >
        <InfoIcon />
      </button>
    </nav>
  )
}

export default LandingNav

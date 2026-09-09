import { usePillHoverAnimation } from '../utils/pillHover.js'

function Pill({ label, onClick, active = false, ariaLabel, ariaExpanded, ease }) {
  const { circleRef, labelRef, hoverLabelRef, handleEnter, handleLeave } = usePillHoverAnimation(ease)

  return (
    <button
      type="button"
      className={`pill${active ? ' is-active' : ''}`}
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      aria-label={ariaLabel || label}
      aria-expanded={ariaExpanded}
    >
      <span className="hover-circle" aria-hidden="true" ref={circleRef} />
      <span className="label-stack">
        <span className="pill-label" ref={labelRef}>
          {label}
        </span>
        <span className="pill-label-hover" aria-hidden="true" ref={hoverLabelRef}>
          {label}
        </span>
      </span>
    </button>
  )
}

export default Pill

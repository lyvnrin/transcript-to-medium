import { useCallback, useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function usePillHoverAnimation(ease = 'power3.easeOut') {
  const circleRef = useRef(null)
  const labelRef = useRef(null)
  const hoverLabelRef = useRef(null)
  const timelineRef = useRef(null)
  const activeTweenRef = useRef(null)

  useEffect(() => {
    const layout = () => {
      const circle = circleRef.current
      if (!circle?.parentElement) return

      const pill = circle.parentElement
      const { width: w, height: h } = pill.getBoundingClientRect()
      if (!w || !h) return

      const radius = (w * w / 4 + h * h) / (2 * h)
      const diameter = Math.ceil(2 * radius) + 2
      const delta = Math.ceil(radius - Math.sqrt(Math.max(0, radius * radius - (w * w) / 4))) + 1
      const originY = diameter - delta

      circle.style.width = `${diameter}px`
      circle.style.height = `${diameter}px`
      circle.style.bottom = `-${delta}px`

      gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` })

      const label = labelRef.current
      const hoverLabel = hoverLabelRef.current
      if (label) gsap.set(label, { y: 0 })
      if (hoverLabel) gsap.set(hoverLabel, { y: h + 12, opacity: 0 })

      timelineRef.current?.kill()
      const tl = gsap.timeline({ paused: true })
      tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0)
      if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0)
      if (hoverLabel) {
        gsap.set(hoverLabel, { y: Math.ceil(h + 100), opacity: 0 })
        tl.to(hoverLabel, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0)
      }
      timelineRef.current = tl
    }

    layout()
    window.addEventListener('resize', layout)
    document.fonts?.ready?.then(layout).catch(() => {})

    return () => window.removeEventListener('resize', layout)
  }, [ease])

  const handleEnter = useCallback(() => {
    const tl = timelineRef.current
    if (!tl) return
    activeTweenRef.current?.kill()
    activeTweenRef.current = tl.tweenTo(tl.duration(), { duration: 0.3, ease, overwrite: 'auto' })
  }, [ease])

  const handleLeave = useCallback(() => {
    const tl = timelineRef.current
    if (!tl) return
    activeTweenRef.current?.kill()
    activeTweenRef.current = tl.tweenTo(0, { duration: 0.2, ease, overwrite: 'auto' })
  }, [ease])

  return { circleRef, labelRef, hoverLabelRef, handleEnter, handleLeave }
}

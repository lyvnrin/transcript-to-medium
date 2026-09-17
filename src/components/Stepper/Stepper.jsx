import { Children, Fragment, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import './Stepper.css'

export function Step({ children }) {
  return <div className="step-panel">{children}</div>
}

function CheckIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function StepIndicator({ step, currentStep, disabled, onClick }) {
  const status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete'

  return (
    <button
      type="button"
      className={`step-indicator step-indicator-${status}`}
      disabled={disabled || currentStep === step}
      aria-label={`Go to step ${step}`}
      aria-current={currentStep === step ? 'step' : undefined}
      onClick={() => onClick(step)}
    >
      {status === 'complete' ? <CheckIcon className="step-check-icon" /> : <span>{step}</span>}
    </button>
  )
}

function SlideTransition({ children, direction, onHeightReady }) {
  const containerRef = useRef(null)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    onHeightReady(el.offsetHeight)

    const observer = new ResizeObserver(() => onHeightReady(el.offsetHeight))
    observer.observe(el)
    return () => observer.disconnect()
  }, [children, onHeightReady])

  return (
    <motion.div
      ref={containerRef}
      className="step-slide"
      initial={{ x: direction >= 0 ? '4%' : '-4%', opacity: 0 }}
      animate={{ x: '0%', opacity: 1, pointerEvents: 'auto' }}
      exit={{ x: direction >= 0 ? '-4%' : '4%', opacity: 0, pointerEvents: 'none' }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

function Stepper({
  children,
  currentStep,
  onStepChange,
  labels = [],
  backLabel = 'Back',
  nextLabel = 'Next',
  onBack,
  onNext,
  nextDisabled = false,
  hideNext = false,
  hideBack = false,
  disableStepIndicators = false,
}) {
  const [direction, setDirection] = useState(0)
  const [height, setHeight] = useState(0)
  const steps = Children.toArray(children)
  const totalSteps = steps.length

  const goTo = (step) => {
    if (step < 1 || step > totalSteps || step === currentStep) return
    setDirection(step > currentStep ? 1 : -1)
    onStepChange(step)
  }

  const handleBack = () => (onBack ? onBack() : goTo(currentStep - 1))
  const handleNext = () => (onNext ? onNext() : goTo(currentStep + 1))

  return (
    <div className="stepper">
      <div className="step-indicator-row">
        {steps.map((_, index) => {
          const stepNumber = index + 1
          return (
            <Fragment key={stepNumber}>
              <div className="step-indicator-col">
                <StepIndicator
                  step={stepNumber}
                  currentStep={currentStep}
                  disabled={disableStepIndicators}
                  onClick={goTo}
                />
                {labels[index] && <span className="step-indicator-label">{labels[index]}</span>}
              </div>
              {index < totalSteps - 1 && (
                <div className="step-connector">
                  <div className={`step-connector-inner${currentStep > stepNumber ? ' is-complete' : ''}`} />
                </div>
              )}
            </Fragment>
          )
        })}
      </div>

      <div className="step-content" style={{ height }}>
        <AnimatePresence initial={false} mode="sync">
          <SlideTransition key={currentStep} direction={direction} onHeightReady={setHeight}>
            {steps[currentStep - 1]}
          </SlideTransition>
        </AnimatePresence>
      </div>

      {(() => {
        const hasBack = currentStep > 1 && !hideBack
        const hasNext = !hideNext
        if (!hasBack && !hasNext) return null

        const footerClass = hasBack && hasNext ? 'step-footer step-footer-split' : hasNext ? 'step-footer step-footer-center' : 'step-footer'

        return (
          <div className={footerClass}>
            {hasBack && (
              <button type="button" className="btn btn-secondary" onClick={handleBack}>
                {backLabel}
              </button>
            )}
            {hasNext && (
              <button type="button" className="btn btn-primary" disabled={nextDisabled} onClick={handleNext}>
                {nextLabel}
              </button>
            )}
          </div>
        )
      })()}
    </div>
  )
}

export default Stepper

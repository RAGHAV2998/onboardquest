import { useEffect } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type {
  VirtualDirection,
  VirtualInputManager,
} from '../game/systems/VirtualInputManager'

type MobileControlsProps = {
  readonly input: VirtualInputManager
  readonly dialogueOpen: boolean
  readonly interactionEnabled: boolean
  readonly disabled: boolean
}

type DirectionButtonProps = {
  readonly direction: VirtualDirection
  readonly label: string
  readonly symbol: string
  readonly input: VirtualInputManager
  readonly disabled: boolean
}

function DirectionButton({
  direction,
  label,
  symbol,
  input,
  disabled,
}: DirectionButtonProps) {
  const press = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    input.setDirection(direction, true)
  }

  const release = (event: ReactPointerEvent<HTMLButtonElement>) => {
    input.setDirection(direction, false)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <button
      type="button"
      className={`mobile-direction-button mobile-direction-${direction}`}
      aria-label={`Move ${label}`}
      disabled={disabled}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={() => input.setDirection(direction, false)}
      onContextMenu={(event) => event.preventDefault()}
    >
      {symbol}
    </button>
  )
}

export function MobileControls({
  input,
  dialogueOpen,
  interactionEnabled,
  disabled,
}: MobileControlsProps) {
  useEffect(() => {
    const resetInput = () => input.reset()
    const resetWhenHidden = () => {
      if (document.hidden) {
        input.reset()
      }
    }

    window.addEventListener('blur', resetInput)
    document.addEventListener('visibilitychange', resetWhenHidden)

    return () => {
      input.reset()
      window.removeEventListener('blur', resetInput)
      document.removeEventListener('visibilitychange', resetWhenHidden)
    }
  }, [input])

  useEffect(() => {
    if (disabled || dialogueOpen) {
      input.reset()
    }
  }, [dialogueOpen, disabled, input])

  const movementDisabled = disabled || dialogueOpen

  return (
    <section
      className="mobile-controls"
      aria-label="Touch game controls"
      data-dialogue-open={dialogueOpen}
    >
      <div className="mobile-direction-pad" aria-label="Movement controls">
        <DirectionButton
          direction="up"
          label="up"
          symbol={'\u2191'}
          input={input}
          disabled={movementDisabled}
        />
        <DirectionButton
          direction="left"
          label="left"
          symbol={'\u2190'}
          input={input}
          disabled={movementDisabled}
        />
        <DirectionButton
          direction="down"
          label="down"
          symbol={'\u2193'}
          input={input}
          disabled={movementDisabled}
        />
        <DirectionButton
          direction="right"
          label="right"
          symbol={'\u2192'}
          input={input}
          disabled={movementDisabled}
        />
      </div>

      <div className="mobile-action-controls">
        <button
          type="button"
          className="mobile-action-button"
          disabled={disabled || dialogueOpen || !interactionEnabled}
          onClick={() => input.requestInteraction()}
        >
          Interact
        </button>
        <button
          type="button"
          className="mobile-action-button mobile-continue-button"
          disabled={disabled || !dialogueOpen}
          onClick={() => input.requestAdvance()}
        >
          Continue
        </button>
      </div>
    </section>
  )
}
import { describe, expect, it } from 'vitest'
import { VirtualInputManager } from './VirtualInputManager'

describe('VirtualInputManager', () => {
  it('holds and releases independent movement directions', () => {
    const input = new VirtualInputManager()

    input.setDirection('up', true)
    input.setDirection('right', true)

    expect(input.isDirectionPressed('up')).toBe(true)
    expect(input.isDirectionPressed('right')).toBe(true)
    expect(input.isDirectionPressed('down')).toBe(false)

    input.setDirection('up', false)

    expect(input.isDirectionPressed('up')).toBe(false)
    expect(input.isDirectionPressed('right')).toBe(true)
  })

  it('consumes interaction and advance requests once', () => {
    const input = new VirtualInputManager()

    input.requestInteraction()
    input.requestAdvance()

    expect(input.consumeInteraction()).toBe(true)
    expect(input.consumeInteraction()).toBe(false)
    expect(input.consumeAdvance()).toBe(true)
    expect(input.consumeAdvance()).toBe(false)
  })

  it('clears held movement and queued actions on reset', () => {
    const input = new VirtualInputManager()

    input.setDirection('left', true)
    input.requestInteraction()
    input.requestAdvance()
    input.reset()

    expect(input.isDirectionPressed('left')).toBe(false)
    expect(input.consumeInteraction()).toBe(false)
    expect(input.consumeAdvance()).toBe(false)
  })
})
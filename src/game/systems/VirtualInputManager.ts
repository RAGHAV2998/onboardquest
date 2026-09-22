import type Phaser from 'phaser'

export const VIRTUAL_INPUT_REGISTRY_KEY = 'onboardquest-virtual-input'

export const virtualDirections = [
  'up',
  'down',
  'left',
  'right',
] as const

export type VirtualDirection = (typeof virtualDirections)[number]

export class VirtualInputManager {
  private readonly pressedDirections = new Set<VirtualDirection>()
  private interactionRequested = false
  private advanceRequested = false

  setDirection(direction: VirtualDirection, pressed: boolean): void {
    if (pressed) {
      this.pressedDirections.add(direction)
      return
    }

    this.pressedDirections.delete(direction)
  }

  isDirectionPressed(direction: VirtualDirection): boolean {
    return this.pressedDirections.has(direction)
  }

  requestInteraction(): void {
    this.interactionRequested = true
  }

  consumeInteraction(): boolean {
    const requested = this.interactionRequested
    this.interactionRequested = false
    return requested
  }

  requestAdvance(): void {
    this.advanceRequested = true
  }

  consumeAdvance(): boolean {
    const requested = this.advanceRequested
    this.advanceRequested = false
    return requested
  }

  reset(): void {
    this.pressedDirections.clear()
    this.interactionRequested = false
    this.advanceRequested = false
  }
}

export function getVirtualInput(scene: Phaser.Scene): VirtualInputManager {
  const input: unknown = scene.registry.get(VIRTUAL_INPUT_REGISTRY_KEY)

  if (!(input instanceof VirtualInputManager)) {
    throw new Error('Virtual input is unavailable.')
  }

  return input
}
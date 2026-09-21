import Phaser from 'phaser'
import { Npc } from '../entities/Npc'

type WorldPosition = {
  readonly x: number
  readonly y: number
}

export class InteractionSystem {
  private activeNpc: Npc | null = null
  private enabled = true

  constructor(
    private readonly player: WorldPosition,
    private readonly npcs: readonly Npc[],
    private readonly interactionKey: Phaser.Input.Keyboard.Key,
    private readonly onInteract: (npc: Npc) => void,
  ) {}

  update(): void {
    if (!this.enabled) {
      return
    }

    const closestNpc = this.findClosestNpcInRange()

    if (closestNpc !== this.activeNpc) {
      this.activeNpc?.setInteractionAvailable(false)
      closestNpc?.setInteractionAvailable(true)
      this.activeNpc = closestNpc
    }

    if (
      this.activeNpc &&
      Phaser.Input.Keyboard.JustDown(this.interactionKey)
    ) {
      this.onInteract(this.activeNpc)
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    this.activeNpc?.setInteractionAvailable(enabled)
  }

  private findClosestNpcInRange(): Npc | null {
    let closestNpc: Npc | null = null
    let closestDistance = Number.POSITIVE_INFINITY

    for (const npc of this.npcs) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        npc.x,
        npc.y,
      )

      if (distance <= npc.interactionRadius && distance < closestDistance) {
        closestNpc = npc
        closestDistance = distance
      }
    }

    return closestNpc
  }
}
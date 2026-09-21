import Phaser from 'phaser'
import type { NpcDefinition } from '../../types/npc'

export class Npc extends Phaser.GameObjects.Container {
  readonly definition: NpcDefinition

  private readonly interactionIndicator: Phaser.GameObjects.Text
  private readonly visitedIndicator: Phaser.GameObjects.Text

  constructor(
    scene: Phaser.Scene,
    definition: NpcDefinition,
    discovered: boolean,
  ) {
    super(scene, definition.position.x, definition.position.y)
    this.definition = definition

    const shadow = scene.add.ellipse(0, 15, 38, 14, 0x1d2a24, 0.22)
    const body =
      definition.appearance === 'mentor'
        ? scene.add.star(0, 0, 4, 12, 24, definition.color)
        : scene.add.circle(0, 0, 18, definition.color)
    body.setStrokeStyle(4, 0xf5f0dc)
    const mentorCape = scene.add
      .triangle(0, 20, -18, 12, 18, 12, 0, 40, 0x8c3c31)
      .setVisible(definition.appearance === 'mentor')
    const marker =
      definition.appearance === 'mentor'
        ? scene.add.star(0, -4, 5, 3, 8, 0xf3c95e)
        : scene.add.circle(0, -3, 6, 0xf3c95e)
    const nameLabel = scene.add
      .text(0, 27, definition.name.toUpperCase(), {
        color: '#1d2a24',
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)

    this.visitedIndicator = scene.add
      .text(0, 46, 'VISITED', {
        backgroundColor: '#f3c95e',
        color: '#1d2a24',
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        padding: { x: 5, y: 2 },
      })
      .setOrigin(0.5, 0)

    this.interactionIndicator = scene.add
      .text(0, -62, '[E] Talk', {
        backgroundColor: '#1d2a24',
        color: '#fff8e8',
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        padding: { x: 8, y: 5 },
      })
      .setOrigin(0.5, 1)
      .setVisible(false)

    this.add([
      shadow,
      mentorCape,
      body,
      marker,
      nameLabel,
      this.visitedIndicator,
      this.interactionIndicator,
    ])
    this.setDepth(3)
    this.setDiscovered(discovered)
    scene.add.existing(this)
  }

  get interactionRadius(): number {
    return this.definition.interactionRadius
  }

  setInteractionAvailable(available: boolean): void {
    this.interactionIndicator.setVisible(available)
  }

  setDiscovered(discovered: boolean): void {
    this.visitedIndicator.setVisible(discovered)
  }
}
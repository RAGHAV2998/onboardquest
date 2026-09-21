import Phaser from 'phaser'
import type { DiscoveryObjectDefinition } from '../../types/territory'

export class DiscoveryObject extends Phaser.GameObjects.Container {
  readonly definition: DiscoveryObjectDefinition

  private readonly marker: Phaser.GameObjects.Text
  private readonly documentBody: Phaser.GameObjects.Rectangle
  private discovered: boolean

  constructor(
    scene: Phaser.Scene,
    definition: DiscoveryObjectDefinition,
    discovered: boolean,
  ) {
    super(scene, definition.position.x, definition.position.y)
    this.definition = definition
    this.discovered = discovered

    const shadow = scene.add.ellipse(0, 25, 72, 20, 0x1d2a24, 0.18)
    const stand = scene.add.rectangle(0, 15, 58, 48, 0x6c5544)
    this.documentBody = scene.add
      .rectangle(0, -12, 54, 66, definition.color)
      .setStrokeStyle(4, 0xfff8e8)
    const page = scene.add.rectangle(0, -12, 34, 46, 0xf5f0dc)
    const pageLineOne = scene.add.rectangle(0, -22, 22, 3, definition.color)
    const pageLineTwo = scene.add.rectangle(-4, -12, 14, 3, definition.color)
    const pageLineThree = scene.add.rectangle(2, -2, 18, 3, definition.color)
    const title = scene.add
      .text(0, 46, definition.title.toUpperCase(), {
        color: '#1d2a24',
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)

    this.marker = scene.add
      .text(0, -67, 'VISIT', {
        backgroundColor: '#1d2a24',
        color: '#fff8e8',
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        padding: { x: 7, y: 4 },
      })
      .setOrigin(0.5, 1)

    this.add([
      shadow,
      stand,
      this.documentBody,
      page,
      pageLineOne,
      pageLineTwo,
      pageLineThree,
      title,
      this.marker,
    ])
    this.setDepth(2)
    this.setDiscovered(discovered)
    scene.add.existing(this)
  }

  get interactionRadius(): number {
    return this.definition.interactionRadius
  }

  setNearby(nearby: boolean): void {
    if (this.discovered) {
      return
    }

    this.marker.setScale(nearby ? 1.08 : 1)
    this.documentBody.setAlpha(nearby ? 1 : 0.86)
  }

  setDiscovered(discovered: boolean): void {
    this.discovered = discovered
    this.marker
      .setText(discovered ? 'DISCOVERED' : 'VISIT')
      .setBackgroundColor(discovered ? '#39705a' : '#1d2a24')
      .setScale(1)
    this.documentBody.setAlpha(discovered ? 1 : 0.86)
  }
}
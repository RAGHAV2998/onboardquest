import Phaser from 'phaser'

export class OraclePedestal extends Phaser.GameObjects.Container {
  private readonly prompt: Phaser.GameObjects.Text
  private readonly core: Phaser.GameObjects.Arc

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    readonly interactionRadius: number,
  ) {
    super(scene, x, y)

    const shadow = scene.add.ellipse(0, 33, 86, 24, 0x1d2a24, 0.2)
    const base = scene.add.rectangle(0, 24, 74, 42, 0x5a493e)
    const column = scene.add.rectangle(0, -2, 44, 62, 0x385d78)
    this.core = scene.add
      .circle(0, -48, 24, 0x73c7c1)
      .setStrokeStyle(5, 0xfff8e8)
    const innerCore = scene.add.circle(0, -48, 9, 0xf3c95e)
    const title = scene.add
      .text(0, 54, 'ORACLE', {
        color: '#1d2a24',
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)
    this.prompt = scene.add
      .text(0, -90, '[E] Consult', {
        backgroundColor: '#1d2a24',
        color: '#fff8e8',
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        padding: { x: 8, y: 5 },
      })
      .setOrigin(0.5, 1)
      .setVisible(false)

    this.add([shadow, base, column, this.core, innerCore, title, this.prompt])
    this.setDepth(2)
    scene.add.existing(this)
  }

  setInteractionAvailable(available: boolean): void {
    this.prompt.setVisible(available)
    this.core.setScale(available ? 1.1 : 1)
    this.core.setAlpha(available ? 1 : 0.84)
  }
}
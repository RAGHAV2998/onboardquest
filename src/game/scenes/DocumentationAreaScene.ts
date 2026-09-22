import Phaser from 'phaser'
import { DiscoveryObject } from '../entities/DiscoveryObject'
import { emitActiveTerritoryChanged } from '../events/gameEvents'
import { getGameState, type GameState } from '../systems/GameState'
import {
  getVirtualInput,
  type VirtualInputManager,
} from '../systems/VirtualInputManager'

type MovementKeys = {
  up: Phaser.Input.Keyboard.Key
  down: Phaser.Input.Keyboard.Key
  left: Phaser.Input.Keyboard.Key
  right: Phaser.Input.Keyboard.Key
}

const WORLD_WIDTH = 1440
const WORLD_HEIGHT = 900
const WORLD_MARGIN = 48

export class DocumentationAreaScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Arc
  private playerBody!: Phaser.Physics.Arcade.Body
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private movementKeys!: MovementKeys
  private discoveryObjects: readonly DiscoveryObject[] = []
  private gameState!: GameState
  private virtualInput!: VirtualInputManager

  constructor() {
    super('documentation-area')
  }

  create(): void {
    this.gameState = getGameState(this)
    this.virtualInput = getVirtualInput(this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.virtualInput.reset()
    })
    emitActiveTerritoryChanged('documentation')
    this.drawArea()
    this.physics.world.setBounds(
      WORLD_MARGIN,
      WORLD_MARGIN,
      WORLD_WIDTH - WORLD_MARGIN * 2,
      WORLD_HEIGHT - WORLD_MARGIN * 2,
    )
    this.createPlayer()
    this.discoveryObjects = this.gameState.contentRegistry.documentationObjects.map(
      (definition) =>
        new DiscoveryObject(
          this,
          definition,
          this.gameState.progressStore.hasDiscoveredObject(
            definition.objectId,
          ),
        ),
    )
    this.configureKeyboard()
    this.configureCamera()
  }

  update(): void {
    const left =
      this.cursors.left.isDown ||
      this.movementKeys.left.isDown ||
      this.virtualInput.isDirectionPressed('left')
    const right =
      this.cursors.right.isDown ||
      this.movementKeys.right.isDown ||
      this.virtualInput.isDirectionPressed('right')
    const up =
      this.cursors.up.isDown ||
      this.movementKeys.up.isDown ||
      this.virtualInput.isDirectionPressed('up')
    const down =
      this.cursors.down.isDown ||
      this.movementKeys.down.isDown ||
      this.virtualInput.isDirectionPressed('down')
    const horizontal = Number(right) - Number(left)
    const vertical = Number(down) - Number(up)
    const speed = 220

    this.playerBody.setVelocity(horizontal * speed, vertical * speed)

    if (horizontal !== 0 && vertical !== 0) {
      this.playerBody.velocity.normalize().scale(speed)
    }

    for (const object of this.discoveryObjects) {
      const nearby = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        object.x,
        object.y,
      ) <= object.interactionRadius

      object.setNearby(nearby)

      if (
        nearby &&
        this.gameState.recordObjectDiscovered(object.definition.objectId)
      ) {
        object.setDiscovered(true)
      }
    }
  }

  private drawArea(): void {
    const graphics = this.add.graphics()

    graphics.fillStyle(0x49665b)
    graphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    graphics.fillStyle(0xd9d6c9)
    graphics.fillRoundedRect(
      WORLD_MARGIN,
      WORLD_MARGIN,
      WORLD_WIDTH - WORLD_MARGIN * 2,
      WORLD_HEIGHT - WORLD_MARGIN * 2,
      16,
    )

    graphics.fillStyle(0xbecdbf)
    graphics.fillRoundedRect(640, 90, 160, 720, 28)
    graphics.fillRoundedRect(170, 370, 1100, 160, 28)

    graphics.fillStyle(0x765d4a)
    for (const y of [105, 760]) {
      for (const x of [100, 430, 870, 1200]) {
        graphics.fillRoundedRect(x, y, 140, 38, 4)
      }
    }

    graphics.lineStyle(5, 0x344a40)
    graphics.strokeRoundedRect(
      WORLD_MARGIN,
      WORLD_MARGIN,
      WORLD_WIDTH - WORLD_MARGIN * 2,
      WORLD_HEIGHT - WORLD_MARGIN * 2,
      16,
    )

    this.add
      .text(78, 70, 'DOCUMENTATION AREA', {
        color: '#1d2a24',
        fontFamily: 'Georgia, serif',
        fontSize: '28px',
        fontStyle: 'bold',
      })
      .setDepth(1)
  }

  private createPlayer(): void {
    this.player = this.add
      .circle(720, 450, 16, 0xd45b48)
      .setStrokeStyle(4, 0xfff8e8)
      .setDepth(3)

    this.physics.add.existing(this.player)
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body
    this.playerBody.setCircle(16)
    this.playerBody.setCollideWorldBounds(true)
  }

  private configureKeyboard(): void {
    const keyboard = this.input.keyboard

    if (!keyboard) {
      throw new Error('Keyboard input is unavailable in this browser.')
    }

    this.cursors = keyboard.createCursorKeys()
    this.movementKeys = keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as MovementKeys
    keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.W,
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.S,
      Phaser.Input.Keyboard.KeyCodes.D,
    ])
  }

  private configureCamera(): void {
    const camera = this.cameras.main

    camera.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    camera.centerOn(this.player.x, this.player.y)
    camera.startFollow(this.player, true, 0.09, 0.09)
  }
}
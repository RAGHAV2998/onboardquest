import Phaser from 'phaser'
import { Npc } from '../entities/Npc'
import { OraclePedestal } from '../entities/OraclePedestal'
import {
  emitActiveTerritoryChanged,
  emitDialogueChanged,
  emitNpcInteracted,
} from '../events/gameEvents'
import { DialogueStateManager } from '../systems/DialogueStateManager'
import { getGameState, type GameState } from '../systems/GameState'
import { InteractionSystem } from '../systems/InteractionSystem'
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
const WORLD_MARGIN = 56

export class MentorTowerScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Arc
  private playerBody!: Phaser.Physics.Arcade.Body
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private movementKeys!: MovementKeys
  private interactionSystem!: InteractionSystem
  private dialogueStateManager!: DialogueStateManager
  private oraclePedestal!: OraclePedestal
  private interactionKey!: Phaser.Input.Keyboard.Key
  private gameState!: GameState
  private virtualInput!: VirtualInputManager

  constructor() {
    super('mentor-tower')
  }

  create(): void {
    this.gameState = getGameState(this)
    this.virtualInput = getVirtualInput(this)
    emitActiveTerritoryChanged('mentor-tower')
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.virtualInput.reset()
      emitDialogueChanged(null)
      this.gameState.closeOracle()
    })
    this.drawTower()
    this.physics.world.setBounds(
      WORLD_MARGIN,
      WORLD_MARGIN,
      WORLD_WIDTH - WORLD_MARGIN * 2,
      WORLD_HEIGHT - WORLD_MARGIN * 2,
    )
    this.createPlayer()
    const mentorDefinition = this.gameState.contentRegistry.getNpc('mentor')

    if (!mentorDefinition) {
      throw new Error('Mentor content is unavailable.')
    }

    const mentor = new Npc(
      this,
      mentorDefinition,
      this.gameState.progressStore.hasVisitedNpc(mentorDefinition.id),
    )
    this.oraclePedestal = new OraclePedestal(this, 1040, 520, 125)
    this.configureKeyboard(mentor)
    this.configureCamera()
  }

  update(): void {
    if (this.gameState.isOracleOpen) {
      this.playerBody.setVelocity(0, 0)
      return
    }

    if (this.dialogueStateManager.isOpen) {
      this.playerBody.setVelocity(0, 0)
      this.dialogueStateManager.update(this.virtualInput.consumeAdvance())
      return
    }

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

    const interactionRequested = this.virtualInput.consumeInteraction()
    this.interactionSystem.update(interactionRequested)
    this.updateOracleInteraction(interactionRequested)
  }

  private drawTower(): void {
    const graphics = this.add.graphics()

    graphics.fillStyle(0x314740)
    graphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    graphics.fillStyle(0xcbd4c8)
    graphics.fillRoundedRect(
      WORLD_MARGIN,
      WORLD_MARGIN,
      WORLD_WIDTH - WORLD_MARGIN * 2,
      WORLD_HEIGHT - WORLD_MARGIN * 2,
      22,
    )

    graphics.fillStyle(0xa8b9ad)
    graphics.fillCircle(720, 440, 280)
    graphics.lineStyle(12, 0xf5f0dc, 0.8)
    graphics.strokeCircle(720, 440, 280)

    graphics.fillStyle(0x765d4a)
    for (const x of [250, 460, 980, 1190]) {
      graphics.fillRoundedRect(x, 190, 120, 250, 8)
      graphics.fillRoundedRect(x, 540, 120, 180, 8)
    }

    graphics.fillStyle(0xf3c95e)
    graphics.fillCircle(720, 300, 70)
    graphics.lineStyle(5, 0xfff8e8)
    graphics.strokeCircle(720, 300, 70)

    graphics.fillStyle(0x8aa8a3)
    graphics.fillRoundedRect(900, 360, 280, 310, 18)
    graphics.lineStyle(6, 0xf5f0dc, 0.9)
    graphics.strokeRoundedRect(900, 360, 280, 310, 18)

    graphics.lineStyle(5, 0x1d2a24)
    graphics.strokeRoundedRect(
      WORLD_MARGIN,
      WORLD_MARGIN,
      WORLD_WIDTH - WORLD_MARGIN * 2,
      WORLD_HEIGHT - WORLD_MARGIN * 2,
      22,
    )

    this.add
      .text(86, 78, 'MENTOR TOWER', {
        color: '#1d2a24',
        fontFamily: 'Georgia, serif',
        fontSize: '30px',
        fontStyle: 'bold',
      })
      .setDepth(1)

    this.add
      .text(1040, 400, 'ORACLE CHAMBER', {
        color: '#1d2a24',
        fontFamily: 'Georgia, serif',
        fontSize: '19px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(1)

    this.add
      .text(720, 160, 'GROWTH CHAMBER', {
        color: '#385d78',
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(1)
  }

  private createPlayer(): void {
    this.player = this.add
      .circle(720, 520, 16, 0xd45b48)
      .setStrokeStyle(4, 0xfff8e8)
      .setDepth(3)

    this.physics.add.existing(this.player)
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body
    this.playerBody.setCircle(16)
    this.playerBody.setCollideWorldBounds(true)
  }

  private configureKeyboard(mentor: Npc): void {
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
    this.interactionKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    const advanceKeys = [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
    ]
    keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.W,
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.S,
      Phaser.Input.Keyboard.KeyCodes.D,
      Phaser.Input.Keyboard.KeyCodes.E,
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.ENTER,
    ])

    this.dialogueStateManager = new DialogueStateManager(
      this.gameState.contentRegistry.dialogues,
      this.gameState.contentRegistry.startingDialogueIds,
      advanceKeys,
      {
        onDialogueChanged: emitDialogueChanged,
        onDialogueCompleted: (dialogueId) => {
          this.gameState.recordDialogueCompleted(dialogueId)
        },
        onDialogueClosed: () => {
          this.interactionSystem.setEnabled(true)
        },
      },
    )
    this.interactionSystem = new InteractionSystem(
      this.player,
      [mentor],
      this.interactionKey,
      () => this.interactWithMentor(mentor),
    )
  }

  private interactWithMentor(mentor: Npc): void {
    const firstDiscovery = this.gameState.progressStore.markNpcVisited(
      mentor.definition.id,
    )
    const interaction = {
      npcId: mentor.definition.id,
      npcName: mentor.definition.name,
      discovered: true,
      firstDiscovery,
    } as const

    mentor.setDiscovered(true)
    console.log('Interacted with NPC:', interaction)
    emitNpcInteracted(interaction)

    if (this.dialogueStateManager.openForNpc(mentor.definition.id)) {
      this.playerBody.setVelocity(0, 0)
      this.interactionSystem.setEnabled(false)
    }
  }

  private updateOracleInteraction(interactionRequested = false): void {
    const nearby = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.oraclePedestal.x,
      this.oraclePedestal.y,
    ) <= this.oraclePedestal.interactionRadius

    this.oraclePedestal.setInteractionAvailable(nearby)

    if (
      nearby &&
      (interactionRequested ||
        Phaser.Input.Keyboard.JustDown(this.interactionKey))
    ) {
      this.playerBody.setVelocity(0, 0)
      this.gameState.openOracle('mentor-tower')
    }
  }

  private configureCamera(): void {
    const camera = this.cameras.main

    camera.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    camera.centerOn(this.player.x, this.player.y)
    camera.startFollow(this.player, true, 0.09, 0.09)
  }
}
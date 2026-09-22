import Phaser from 'phaser'
import {
  emitActiveTerritoryChanged,
  emitDialogueChanged,
  emitNpcInteracted,
} from '../events/gameEvents'
import { Npc } from '../entities/Npc'
import {
  teamVillageMap,
  type HouseDefinition,
  type MapRectangle,
  type TreeDefinition,
} from '../maps/teamVillageMap'
import { InteractionSystem } from '../systems/InteractionSystem'
import { DialogueStateManager } from '../systems/DialogueStateManager'
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

export class TeamVillageScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Arc
  private playerBody!: Phaser.Physics.Arcade.Body
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private movementKeys!: MovementKeys
  private interactionSystem!: InteractionSystem
  private dialogueStateManager!: DialogueStateManager
  private gameState!: GameState
  private virtualInput!: VirtualInputManager

  constructor() {
    super('team-village')
  }

  create(): void {
    this.gameState = getGameState(this)
    this.virtualInput = getVirtualInput(this)
    emitActiveTerritoryChanged('team')
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.virtualInput.reset()
      emitDialogueChanged(null)
    })
    this.drawVillage()
    this.configureWorldBounds()
    const obstacles = this.createObstacles()
    this.createPlayer()
    this.physics.add.collider(this.player, obstacles)
    const npcs = this.createNpcs()
    this.configureCamera()

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
    const interactionKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
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
      npcs,
      interactionKey,
      (npc) => this.interactWithNpc(npc),
    )
  }

  update(): void {
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

    this.interactionSystem.update(this.virtualInput.consumeInteraction())
  }

  private drawVillage(): void {
    const graphics = this.add.graphics()
    const { playableBounds, spawnPoint, villageCenter, world } = teamVillageMap

    graphics.fillStyle(0x6f8f63)
    graphics.fillRect(0, 0, world.width, world.height)

    graphics.fillStyle(0x9fbd8e)
    graphics.fillRect(
      playableBounds.x,
      playableBounds.y,
      playableBounds.width,
      playableBounds.height,
    )

    graphics.fillStyle(0xe8d8ae)
    for (const path of teamVillageMap.paths) {
      graphics.fillRoundedRect(path.x, path.y, path.width, path.height, 18)
    }

    graphics.fillStyle(0xe4ca91)
    graphics.fillCircle(villageCenter.x, villageCenter.y, villageCenter.radius)
    graphics.lineStyle(5, 0xf4e5bd)
    graphics.strokeCircle(villageCenter.x, villageCenter.y, villageCenter.radius)

    for (const house of teamVillageMap.houses) {
      this.drawHouse(graphics, house)
    }

    for (const tree of teamVillageMap.trees) {
      this.drawTree(graphics, tree)
    }

    graphics.fillStyle(0x64a5ad)
    graphics.fillCircle(
      villageCenter.x,
      villageCenter.y,
      villageCenter.featureRadius,
    )
    graphics.lineStyle(6, 0xf5f0dc)
    graphics.strokeCircle(
      villageCenter.x,
      villageCenter.y,
      villageCenter.featureRadius,
    )
    graphics.fillStyle(0xd9f0eb)
    graphics.fillCircle(villageCenter.x, villageCenter.y, 11)

    graphics.lineStyle(5, 0x375b43)
    graphics.strokeRect(
      playableBounds.x,
      playableBounds.y,
      playableBounds.width,
      playableBounds.height,
    )

    graphics.lineStyle(4, 0xd45b48)
    graphics.strokeCircle(spawnPoint.x, spawnPoint.y, spawnPoint.radius)
    graphics.lineBetween(
      spawnPoint.x - spawnPoint.radius - 8,
      spawnPoint.y,
      spawnPoint.x - 18,
      spawnPoint.y,
    )
    graphics.lineBetween(
      spawnPoint.x + 18,
      spawnPoint.y,
      spawnPoint.x + spawnPoint.radius + 8,
      spawnPoint.y,
    )

    this.add
      .text(88, 88, 'TEAM VILLAGE', {
        color: '#f8f2df',
        fontFamily: 'Georgia, serif',
        fontSize: '28px',
        fontStyle: 'bold',
      })
      .setDepth(1)

    this.add
      .text(villageCenter.x, villageCenter.y + villageCenter.radius + 18, 'VILLAGE CENTER', {
        color: '#314739',
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)
      .setDepth(1)

    this.add
      .text(spawnPoint.x, spawnPoint.y + spawnPoint.radius + 12, 'SPAWN', {
        color: '#8c3c31',
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)
      .setDepth(1)
  }

  private drawHouse(
    graphics: Phaser.GameObjects.Graphics,
    house: HouseDefinition,
  ): void {
    graphics.fillStyle(0x1d2a24, 0.18)
    graphics.fillRect(house.x + 10, house.y + 10, house.width, house.height)

    graphics.fillStyle(house.wallColor)
    graphics.fillRect(house.x, house.y, house.width, house.height)
    graphics.lineStyle(4, 0x5d4539)
    graphics.strokeRect(house.x, house.y, house.width, house.height)

    graphics.fillStyle(house.roofColor)
    graphics.fillTriangle(
      house.x - 12,
      house.y + 38,
      house.x + house.width / 2,
      house.y - 30,
      house.x + house.width + 12,
      house.y + 38,
    )

    const doorY = house.doorSide === 'south' ? house.y + house.height - 42 : house.y
    graphics.fillStyle(0x6d4937)
    graphics.fillRect(house.x + house.width / 2 - 18, doorY, 36, 42)

    graphics.fillStyle(0x88bac1)
    graphics.fillRect(house.x + 34, house.y + 70, 34, 28)
    graphics.fillRect(house.x + house.width - 68, house.y + 70, 34, 28)
  }

  private drawTree(
    graphics: Phaser.GameObjects.Graphics,
    tree: TreeDefinition,
  ): void {
    graphics.fillStyle(0x6d4937)
    graphics.fillRect(tree.x - 8, tree.y - 10, 16, 30)
    graphics.fillStyle(tree.crownColor)
    graphics.fillCircle(tree.x, tree.y - 24, tree.crownRadius)
    graphics.lineStyle(3, 0x315b43)
    graphics.strokeCircle(tree.x, tree.y - 24, tree.crownRadius)
  }

  private configureWorldBounds(): void {
    const bounds = teamVillageMap.playableBounds

    this.physics.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height)
  }

  private createObstacles(): Phaser.Physics.Arcade.StaticGroup {
    const obstacles = this.physics.add.staticGroup()

    for (const house of teamVillageMap.houses) {
      this.addObstacle(obstacles, house)
    }

    for (const tree of teamVillageMap.trees) {
      this.addObstacle(obstacles, {
        x: tree.x - 12,
        y: tree.y - 10,
        width: 24,
        height: 30,
      })
    }

    const { featureRadius, x, y } = teamVillageMap.villageCenter
    this.addObstacle(obstacles, {
      x: x - featureRadius,
      y: y - featureRadius,
      width: featureRadius * 2,
      height: featureRadius * 2,
    })

    return obstacles
  }

  private addObstacle(
    obstacles: Phaser.Physics.Arcade.StaticGroup,
    bounds: MapRectangle,
  ): void {
    const obstacle = this.add.zone(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
      bounds.width,
      bounds.height,
    )

    obstacles.add(obstacle)
  }

  private createPlayer(): void {
    const { x, y } = teamVillageMap.spawnPoint

    this.player = this.add
      .circle(x, y, 16, 0xd45b48)
      .setStrokeStyle(4, 0xfff8e8)
      .setDepth(2)

    this.physics.add.existing(this.player)
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body
    this.playerBody.setCircle(16)
    this.playerBody.setCollideWorldBounds(true)
  }

  private createNpcs(): Npc[] {
    return this.gameState.contentRegistry.npcs
      .filter(({ mapId }) => mapId === 'team-village')
      .map(
        (definition) =>
          new Npc(
            this,
            definition,
            this.gameState.progressStore.hasVisitedNpc(definition.id),
          ),
      )
  }

  private interactWithNpc(npc: Npc): void {
    const firstDiscovery = this.gameState.progressStore.markNpcVisited(
      npc.definition.id,
    )
    const interaction = {
      npcId: npc.definition.id,
      npcName: npc.definition.name,
      discovered: true,
      firstDiscovery,
    } as const

    npc.setDiscovered(true)
    console.log('Interacted with NPC:', interaction)
    emitNpcInteracted(interaction)

    if (this.dialogueStateManager.openForNpc(npc.definition.id)) {
      this.playerBody.setVelocity(0, 0)
      this.interactionSystem.setEnabled(false)
    }
  }

  private configureCamera(): void {
    const camera = this.cameras.main
    const { height, width } = teamVillageMap.world
    const { x, y } = teamVillageMap.spawnPoint

    camera.setBounds(0, 0, width, height)
    camera.centerOn(x, y)
    camera.startFollow(this.player, true, 0.09, 0.09)
  }
}
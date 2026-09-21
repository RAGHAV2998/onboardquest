import Phaser from 'phaser'
import {
  onCareerMilestoneCompletionRequested,
  onCareerPathSelectionRequested,
  onMissionCompletionRequested,
  onProgressExportRequested,
  onProgressResetRequested,
  onTerritoryEntryRequested,
  onOracleCloseRequested,
  onOracleQuestionRequested,
} from './events/gameEvents'
import { DocumentationAreaScene } from './scenes/DocumentationAreaScene'
import { MentorTowerScene } from './scenes/MentorTowerScene'
import { TeamVillageScene } from './scenes/TeamVillageScene'
import {
  GAME_STATE_REGISTRY_KEY,
  GameState,
} from './systems/GameState'

export function createGame(parent: HTMLElement): Phaser.Game {
  let gameState: GameState | null = null
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 540,
    backgroundColor: '#b8ccb1',
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    callbacks: {
      preBoot: (phaserGame) => {
        gameState = new GameState(window.localStorage)
        phaserGame.registry.set(GAME_STATE_REGISTRY_KEY, gameState)
      },
    },
    scene: [TeamVillageScene, DocumentationAreaScene, MentorTowerScene],
  })

  const unsubscribe = onTerritoryEntryRequested((territoryId) => {
    const definition = gameState?.territoryManager.getDefinition(territoryId)

    if (
      !definition?.sceneKey ||
      !gameState?.territoryManager.isUnlocked(territoryId)
    ) {
      return
    }

    for (const activeScene of game.scene.getScenes(true)) {
      if (activeScene.scene.key !== definition.sceneKey) {
        game.scene.stop(activeScene.scene.key)
      }
    }

    game.scene.start(definition.sceneKey)
  })
  const unsubscribeMissionCompletion = onMissionCompletionRequested(
    (missionId) => {
      gameState?.requestMissionCompletion(missionId)
    },
  )
  const unsubscribeCareerPathSelection = onCareerPathSelectionRequested(
    (pathId) => {
      gameState?.requestCareerPathSelection(pathId)
    },
  )
  const unsubscribeCareerMilestoneCompletion =
    onCareerMilestoneCompletionRequested((milestoneId) => {
      gameState?.requestCareerMilestoneCompletion(milestoneId)
    })
  const unsubscribeOracleQuestion = onOracleQuestionRequested((question) => {
    void gameState?.askOracle(question)
  })
  const unsubscribeOracleClose = onOracleCloseRequested(() => {
    gameState?.closeOracle()
  })
  const unsubscribeProgressExport = onProgressExportRequested(() => {
    const summary = gameState?.createProgressSummary()

    if (!summary) {
      return
    }

    const blob = new Blob([JSON.stringify(summary, null, 2)], {
      type: 'application/json',
    })
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = summary.exportedAt.slice(0, 10)

    link.href = downloadUrl
    link.download = `onboardquest-progress-${date}.json`
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0)
  })
  const unsubscribeProgressReset = onProgressResetRequested(() => {
    gameState?.resetProgress()
    window.location.reload()
  })

  game.events.once(Phaser.Core.Events.DESTROY, () => {
    unsubscribe()
    unsubscribeMissionCompletion()
    unsubscribeCareerPathSelection()
    unsubscribeCareerMilestoneCompletion()
    unsubscribeOracleQuestion()
    unsubscribeOracleClose()
    unsubscribeProgressExport()
    unsubscribeProgressReset()
  })
  return game
}
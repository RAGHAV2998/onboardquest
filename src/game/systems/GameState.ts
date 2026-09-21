import type Phaser from 'phaser'
import {
  contentRegistry as defaultContentRegistry,
  type ContentRegistry,
} from '../../content/ContentRegistry'
import type { DialogueId } from '../../types/dialogue'
import type { CareerMilestoneId, CareerPathId } from '../../types/career'
import type {
  MilestoneDefinition,
  MissionId,
  MissionState,
} from '../../types/mission'
import type { QuestDefinition, QuestState } from '../../types/quest'
import type { DiscoveryObjectId } from '../../types/territory'
import type { TerritoryId } from '../../types/territory'
import type { ProgressSummaryExport } from '../../types/insights'
import {
  emitAchievementNotification,
  emitBadgesChanged,
  emitCareerStateChanged,
  emitJourneyChanged,
  emitJourneyFoundationCompleted,
  emitInsightsChanged,
  emitMissionBoardChanged,
  emitOracleStateChanged,
  emitPlayerProgressChanged,
  emitQuestCompleted,
  emitQuestStateChanged,
  emitTerritoriesChanged,
  emitTerritoryProgressChanged,
} from '../events/gameEvents'
import { BadgeManager } from './BadgeManager'
import { CareerPathManager } from './CareerPathManager'
import { ExperienceManager } from './ExperienceManager'
import { InsightsManager } from './InsightsManager'
import { JourneyManager } from './JourneyManager'
import { MissionManager } from './MissionManager'
import { MockOracleProvider } from '../oracle/MockOracleProvider'
import type { OracleProvider } from '../oracle/OracleProvider'
import { OracleContextBuilder } from './OracleContextBuilder'
import { OracleManager } from './OracleManager'
import { OraclePromptBuilder } from './OraclePromptBuilder'
import { ProgressStore } from './ProgressStore'
import { QuestManager } from './QuestManager'
import { TerritoryManager } from './TerritoryManager'

export const GAME_STATE_REGISTRY_KEY = 'onboardquest-game-state'

export class GameState {
  readonly progressStore: ProgressStore
  readonly territoryManager: TerritoryManager

  private readonly experienceManager: ExperienceManager
  private readonly badgeManager: BadgeManager
  private readonly careerPathManager: CareerPathManager
  private readonly journeyManager: JourneyManager
  private readonly questManager: QuestManager
  private readonly missionManager: MissionManager
  private readonly oracleManager: OracleManager
  private readonly insightsManager: InsightsManager

  constructor(
    storage: Storage,
    oracleProvider: OracleProvider = new MockOracleProvider(),
    readonly contentRegistry: ContentRegistry = defaultContentRegistry,
  ) {
    this.progressStore = new ProgressStore(storage)
    this.territoryManager = new TerritoryManager(
      contentRegistry.territories,
      contentRegistry.documentationObjects,
      this.progressStore.getPlayerLevel(),
      this.progressStore,
      {
        onTerritoriesChanged: emitTerritoriesChanged,
        onTerritoryProgressChanged: emitTerritoryProgressChanged,
      },
    )
    this.experienceManager = new ExperienceManager(
      contentRegistry.levelDefinitions,
      this.progressStore,
      {
        onProgressChanged: (progress) => {
          emitPlayerProgressChanged(progress)
          this.territoryManager.updatePlayerLevel(progress.level)
        },
      },
    )
    this.badgeManager = new BadgeManager(
      contentRegistry.badges,
      this.progressStore,
      { onBadgesChanged: emitBadgesChanged },
    )
    this.careerPathManager = new CareerPathManager(
      contentRegistry.careerPaths,
      this.progressStore,
      { onCareerStateChanged: emitCareerStateChanged },
    )
    this.journeyManager = new JourneyManager(
      contentRegistry.journeyStages,
      this.progressStore,
      { onJourneyChanged: emitJourneyChanged },
    )
    this.reconcileJourneyStageRewards()
    this.questManager = new QuestManager(
      contentRegistry.quests,
      this.progressStore,
      {
        onQuestStateChanged: emitQuestStateChanged,
        onQuestCompleted: (quest) => this.completeQuest(quest),
      },
    )
    this.missionManager = new MissionManager(
      contentRegistry.missions,
      contentRegistry.firstWeekMilestone,
      this.progressStore,
      {
        onMissionBoardChanged: emitMissionBoardChanged,
        onMissionCompleted: (mission) => this.completeMission(mission),
        onMilestoneCompleted: (milestone) =>
          this.completeMilestone(milestone),
      },
    )
    this.reconcileCompletedQuests()
    this.reconcileCompletedMissions()
    this.oracleManager = new OracleManager(
      oracleProvider,
      new OracleContextBuilder(
        this.progressStore,
        this.journeyManager,
        this.careerPathManager,
        contentRegistry,
      ),
      new OraclePromptBuilder(),
      { onStateChanged: emitOracleStateChanged },
    )
    this.insightsManager = new InsightsManager(
      contentRegistry,
      this.progressStore,
      this.journeyManager,
      this.careerPathManager,
      this.territoryManager,
    )
    this.publishInsights()
  }

  recordDialogueCompleted(dialogueId: DialogueId): void {
    this.questManager.recordDialogueCompleted(dialogueId)
    this.careerPathManager.refreshAvailability()
    this.publishInsights()
  }

  recordObjectDiscovered(objectId: DiscoveryObjectId): boolean {
    if (!this.territoryManager.recordObjectDiscovered(objectId)) {
      return false
    }

    this.questManager.recordObjectDiscovered(objectId)
    this.publishInsights()
    return true
  }

  requestMissionCompletion(missionId: MissionId): boolean {
    const completed = this.missionManager.completeManually(missionId)

    if (completed) {
      this.publishInsights()
    }

    return completed
  }

  requestCareerPathSelection(pathId: CareerPathId): boolean {
    const selected = this.careerPathManager.selectPath(pathId)

    if (selected) {
      this.publishInsights()
    }

    return selected
  }

  requestCareerMilestoneCompletion(
    milestoneId: CareerMilestoneId,
  ): boolean {
    const completed = this.careerPathManager.completeMilestone(milestoneId)

    if (completed) {
      this.publishInsights()
    }

    return completed
  }

  createProgressSummary(): ProgressSummaryExport {
    return this.insightsManager.createProgressSummary()
  }

  resetProgress(): void {
    this.progressStore.reset()
  }

  get isOracleOpen(): boolean {
    return this.oracleManager.opened
  }

  openOracle(territoryId: TerritoryId): void {
    this.oracleManager.open(territoryId)
  }

  closeOracle(): void {
    this.oracleManager.close()
  }

  async askOracle(question: string): Promise<boolean> {
    return this.oracleManager.ask(question)
  }

  private completeQuest(quest: QuestState): void {
    emitQuestCompleted(quest)
    this.territoryManager.recordQuestCompleted(quest.questId)
    this.applyQuestProgression(quest, true)
    this.refreshJourney(true)
  }

  private reconcileCompletedQuests(): void {
    for (const quest of this.contentRegistry.quests) {
      if (this.progressStore.hasCompletedQuest(quest.questId)) {
        this.territoryManager.recordQuestCompleted(quest.questId)
        this.applyQuestProgression(quest, false)
      }
    }
  }

  private completeMission(mission: MissionState): void {
    this.applyMissionProgression(mission, true)
  }

  private completeMilestone(milestone: MilestoneDefinition): void {
    this.applyMilestoneProgression(milestone, true)
    this.territoryManager.updatePlayerLevel(
      this.progressStore.getPlayerLevel(),
    )
    this.careerPathManager.refreshAvailability()
    this.refreshJourney(true)
  }

  private reconcileCompletedMissions(): void {
    for (const mission of this.contentRegistry.missions) {
      if (this.progressStore.hasCompletedMission(mission.missionId)) {
        this.applyMissionProgression(mission, false)
      }
    }

    if (
      this.progressStore.hasCompletedMilestone(
        this.contentRegistry.firstWeekMilestone.milestoneId,
      )
    ) {
      this.applyMilestoneProgression(
        this.contentRegistry.firstWeekMilestone,
        false,
      )
    }
  }

  private reconcileJourneyStageRewards(): void {
    for (const node of this.journeyManager.getState().nodes) {
      if (node.status === 'completed') {
        this.badgeManager.recordJourneyStageCompleted(node.stageId)
      }
    }
  }

  private refreshJourney(showNotifications: boolean): void {
    const evaluation = this.journeyManager.refresh()

    for (const stage of evaluation.newlyCompletedStages) {
      const unlockedBadges = this.badgeManager.recordJourneyStageCompleted(
        stage.stageId,
      )

      if (showNotifications) {
        for (const badge of unlockedBadges) {
          emitAchievementNotification({
            kind: 'badgeUnlocked',
            title: 'Badge Unlocked!',
            message: badge.name,
          })
        }
      }
    }

    if (showNotifications && evaluation.foundationJustCompleted) {
      emitJourneyFoundationCompleted(evaluation.state)
    }
  }

  private applyQuestProgression(
    quest: Pick<QuestDefinition, 'questId' | 'rewardXp'>,
    showNotifications: boolean,
  ): void {
    const rewardClaimed = this.progressStore.claimQuestReward(quest.questId)

    if (rewardClaimed && quest.rewardXp > 0) {
      this.experienceManager.awardXp(quest.rewardXp)
    }

    const unlockedBadges = this.badgeManager.recordQuestCompleted(
      quest.questId,
    )

    if (showNotifications && rewardClaimed) {
      emitAchievementNotification({
        kind: 'questComplete',
        title: 'Quest Complete!',
        message: `+${quest.rewardXp} XP`,
      })
    }

    if (showNotifications) {
      for (const badge of unlockedBadges) {
        emitAchievementNotification({
          kind: 'badgeUnlocked',
          title: 'Badge Unlocked!',
          message: badge.name,
        })
      }
    }
  }

  private applyMissionProgression(
    mission: Pick<MissionState, 'missionId' | 'title' | 'rewardXp'>,
    showNotification: boolean,
  ): void {
    if (!this.progressStore.claimMissionReward(mission.missionId)) {
      return
    }

    this.experienceManager.awardXp(mission.rewardXp)

    if (showNotification) {
      emitAchievementNotification({
        kind: 'missionComplete',
        title: 'Mission Complete!',
        message: `+${mission.rewardXp} XP`,
      })
    }
  }

  private applyMilestoneProgression(
    milestone: MilestoneDefinition,
    showNotifications: boolean,
  ): void {
    const rewardClaimed = this.progressStore.claimMilestoneReward(
      milestone.milestoneId,
    )

    if (rewardClaimed) {
      this.experienceManager.awardXp(milestone.rewardXp)
    }

    const unlockedBadges = this.badgeManager.recordMilestoneCompleted(
      milestone.milestoneId,
    )

    if (showNotifications && rewardClaimed) {
      emitAchievementNotification({
        kind: 'milestoneComplete',
        title: `${milestone.title}!`,
        message: `+${milestone.rewardXp} XP`,
      })
    }

    if (showNotifications) {
      for (const badge of unlockedBadges) {
        emitAchievementNotification({
          kind: 'badgeUnlocked',
          title: 'Badge Unlocked!',
          message: badge.name,
        })
      }
    }
  }

  private publishInsights(): void {
    emitInsightsChanged(this.insightsManager.getSnapshot())
  }
}

export function getGameState(scene: Phaser.Scene): GameState {
  const gameState: unknown = scene.registry.get(GAME_STATE_REGISTRY_KEY)

  if (!(gameState instanceof GameState)) {
    throw new Error('Shared game state is unavailable.')
  }

  return gameState
}
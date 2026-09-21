import type { ContentRegistry } from '../../content/ContentRegistry'
import type { OracleContext } from '../../types/oracle'
import type { TerritoryId } from '../../types/territory'
import { CareerPathManager } from './CareerPathManager'
import { JourneyManager } from './JourneyManager'
import { ProgressStore } from './ProgressStore'

export class OracleContextBuilder {
  constructor(
    private readonly progressStore: ProgressStore,
    private readonly journeyManager: JourneyManager,
    private readonly careerPathManager: CareerPathManager,
    private readonly contentRegistry: ContentRegistry,
  ) {}

  build(currentTerritoryId: TerritoryId): OracleContext {
    const journey = this.journeyManager.getState()
    const career = this.careerPathManager.getState()
    const currentStage = journey.nodes.find(
      ({ stageId }) => stageId === journey.activeStageId,
    )
    const currentTerritory = this.contentRegistry.territories.find(
      ({ territoryId }) => territoryId === currentTerritoryId,
    )
    const completedQuestTitles = this.contentRegistry.quests
      .filter(({ questId }) => this.progressStore.hasCompletedQuest(questId))
      .map(({ title }) => title)
    const completedTerritoryTitles = this.contentRegistry.territories
      .filter(({ territoryId }) =>
        this.progressStore.hasCompletedTerritory(territoryId),
      )
      .map(({ title }) => title)
    const completedMissionTitles = this.contentRegistry.missions
      .filter(({ missionId }) =>
        this.progressStore.hasCompletedMission(missionId),
      )
      .map(({ title }) => title)
    const remainingMissionTitles = this.contentRegistry.missions
      .filter(
        ({ missionId }) =>
          !this.progressStore.hasCompletedMission(missionId),
      )
      .map(({ title }) => title)
    const currentCareerPath = career.currentPath
      ? {
          title: career.currentPath.title,
          description: career.currentPath.description,
          milestoneTitles: career.currentPath.track.milestones.map(
            ({ title }) => title,
          ),
        }
      : null
    const currentRecommendation =
      journey.activeStageId === 'become-productive'
        ? career.recommendation
        : journey.recommendation?.text ?? 'Continue onboarding.'

    return {
      level: this.progressStore.getPlayerLevel(),
      currentStage: currentStage?.title ?? 'Onboarding journey complete',
      currentTerritory: currentTerritory?.title ?? 'Unknown territory',
      completedQuestTitles,
      completedTerritoryTitles,
      completedMissionTitles,
      remainingMissionTitles,
      currentCareerPath,
      currentMilestone: career.currentMilestone?.title ?? null,
      currentRecommendation,
      completedOnboardingGoals: journey.completedCount,
      totalOnboardingGoals: journey.totalCount,
    }
  }
}
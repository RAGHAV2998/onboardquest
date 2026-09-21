import type { ContentRegistry } from '../../content/ContentRegistry'
import type {
  AchievementInsight,
  CompletionMetric,
  CompletionMetrics,
  DurationMetric,
  InsightsSnapshot,
  ProgressMetrics,
  ProgressSummaryExport,
  ProgressTimelineEntry,
  RecommendationMetrics,
} from '../../types/insights'
import type { JourneyStageId } from '../../types/journey'
import { CareerPathManager } from './CareerPathManager'
import { JourneyManager } from './JourneyManager'
import { ProgressStore } from './ProgressStore'
import { TerritoryManager } from './TerritoryManager'

const ONBOARDING_TERRITORY_EXCLUSIONS = new Set(['mentor-tower'])

export class InsightsManager {
  constructor(
    private readonly contentRegistry: ContentRegistry,
    private readonly progressStore: ProgressStore,
    private readonly journeyManager: JourneyManager,
    private readonly careerPathManager: CareerPathManager,
    private readonly territoryManager: TerritoryManager,
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}

  getSnapshot(): InsightsSnapshot {
    const completion = this.createCompletionMetrics()
    const progress = this.createProgressMetrics()
    const recommendation = this.createRecommendationMetrics()

    return {
      generatedAt: this.now(),
      completion,
      progress,
      recommendation,
      managerSummary: {
        employees: 1,
        stageCompletion: completion.stages.percentage,
        missionCompletion: completion.missions.percentage,
        questCompletion: completion.quests.percentage,
        territoryCompletion: completion.territories.percentage,
        topRecommendation: recommendation.topRecommendation,
      },
      durations: this.createDurationMetrics(),
      timeline: this.createTimeline(),
      achievements: this.createAchievements(),
    }
  }

  createProgressSummary(): ProgressSummaryExport {
    const snapshot = this.getSnapshot()
    const career = this.careerPathManager.getState()
    const currentPath = career.currentPath
    const territoryStates = this.territoryManager.getTerritoryStates()

    return {
      version: 1,
      exportedAt: snapshot.generatedAt,
      playerProfile: {
        profileType: 'local-demo-player',
        onboardingStartedAt: this.progressStore.getOnboardingStartedAt(),
        level: snapshot.progress.level,
        totalXp: snapshot.progress.totalXp,
        badges: snapshot.achievements
          .filter(({ unlocked }) => unlocked)
          .map(({ badgeId, name, unlockedAt }) => ({
            badgeId,
            name,
            unlockedAt,
          })),
      },
      levels: this.contentRegistry.levelDefinitions.map((definition) => ({
        ...definition,
        current: definition.level === snapshot.progress.level,
      })),
      territories: territoryStates.map((territory) => ({
        territoryId: territory.territoryId,
        title: territory.title,
        unlocked: territory.unlocked,
        completed: territory.completed,
        completedAt: this.progressStore.getTerritoryCompletedAt(
          territory.territoryId,
        ),
      })),
      missions: this.contentRegistry.missions.map((mission) => ({
        missionId: mission.missionId,
        title: mission.title,
        status: this.progressStore.hasCompletedMission(mission.missionId)
          ? 'completed'
          : mission.initialStatus,
        completedAt: this.progressStore.getMissionCompletedAt(
          mission.missionId,
        ),
      })),
      careerProgress: {
        selectedPathId: career.selectedPathId,
        title: currentPath?.title ?? null,
        selectedAt: this.progressStore.getCareerPathSelectedAt(),
        currentMilestone: career.currentMilestone?.title ?? null,
        milestones:
          currentPath?.track.milestones.map((milestone) => ({
            milestoneId: milestone.milestoneId,
            title: milestone.title,
            completed: milestone.completed,
            completedAt:
              this.progressStore.getCareerMilestoneCompletedAt(
                milestone.milestoneId,
              ),
          })) ?? [],
      },
    }
  }

  private createCompletionMetrics(): CompletionMetrics {
    const journey = this.journeyManager.getState()
    const onboardingTerritories = this.territoryManager
      .getTerritoryStates()
      .filter(
        ({ territoryId }) =>
          !ONBOARDING_TERRITORY_EXCLUSIONS.has(territoryId),
      )
    const completedQuests = this.contentRegistry.quests.filter(({ questId }) =>
      this.progressStore.hasCompletedQuest(questId),
    ).length
    const completedMissions = this.contentRegistry.missions.filter(
      ({ missionId }) => this.progressStore.hasCompletedMission(missionId),
    ).length

    return {
      stages: this.createCompletionMetric(
        journey.completedCount,
        journey.totalCount,
      ),
      territories: this.createCompletionMetric(
        onboardingTerritories.filter(({ completed }) => completed).length,
        onboardingTerritories.length,
      ),
      quests: this.createCompletionMetric(
        completedQuests,
        this.contentRegistry.quests.length,
      ),
      missions: this.createCompletionMetric(
        completedMissions,
        this.contentRegistry.missions.length,
      ),
    }
  }

  private createProgressMetrics(): ProgressMetrics {
    const career = this.careerPathManager.getState()

    return {
      careerPath: career.currentPath?.title ?? null,
      currentMilestone: career.currentMilestone?.title ?? null,
      level: this.progressStore.getPlayerLevel(),
      totalXp: this.progressStore.getExperiencePoints(),
      badgeCount: this.contentRegistry.badges.filter(({ badgeId }) =>
        this.progressStore.hasUnlockedBadge(badgeId),
      ).length,
    }
  }

  private createRecommendationMetrics(): RecommendationMetrics {
    const journey = this.journeyManager.getState()
    const career = this.careerPathManager.getState()
    const activeStage = journey.nodes.find(
      ({ stageId }) => stageId === journey.activeStageId,
    )

    if (journey.activeStageId === 'become-productive') {
      return {
        topRecommendation: career.recommendation,
        activeStage: activeStage?.title ?? null,
        source: 'career',
      }
    }

    if (journey.recommendation) {
      return {
        topRecommendation: journey.recommendation.text,
        activeStage: activeStage?.title ?? null,
        source: 'journey',
      }
    }

    return {
      topRecommendation: 'Onboarding foundation complete.',
      activeStage: null,
      source: 'complete',
    }
  }

  private createDurationMetrics(): readonly DurationMetric[] {
    const questTimes = this.contentRegistry.quests
      .map(({ questId }) => this.progressStore.getQuestCompletedAt(questId))
      .filter((timestamp): timestamp is string => timestamp !== null)
    const territoryTimes = this.contentRegistry.territories
      .filter(
        ({ territoryId }) =>
          !ONBOARDING_TERRITORY_EXCLUSIONS.has(territoryId),
      )
      .map(({ territoryId }) =>
        this.progressStore.getTerritoryCompletedAt(territoryId),
      )
      .filter((timestamp): timestamp is string => timestamp !== null)
    const anyQuestCompleted = this.contentRegistry.quests.some(({ questId }) =>
      this.progressStore.hasCompletedQuest(questId),
    )
    const anyTerritoryCompleted = this.contentRegistry.territories
      .filter(
        ({ territoryId }) =>
          !ONBOARDING_TERRITORY_EXCLUSIONS.has(territoryId),
      )
      .some(({ territoryId }) =>
        this.progressStore.hasCompletedTerritory(territoryId),
      )

    return [
      this.createDurationMetric(
        'first-quest',
        'Time to First Quest',
        this.findEarliest(questTimes),
        anyQuestCompleted,
      ),
      this.createDurationMetric(
        'team-completion',
        'Time to Team Completion',
        this.progressStore.getJourneyStageCompletedAt('meet-your-team'),
        this.progressStore.hasCompletedJourneyStage('meet-your-team'),
      ),
      this.createDurationMetric(
        'territory-completion',
        'Time to Territory Completion',
        this.findEarliest(territoryTimes),
        anyTerritoryCompleted,
      ),
      this.createDurationMetric(
        'first-week-completion',
        'Time to First Week Completion',
        this.progressStore.getMilestoneCompletedAt('first-week-complete'),
        this.progressStore.hasCompletedMilestone('first-week-complete'),
      ),
    ]
  }

  private createTimeline(): readonly ProgressTimelineEntry[] {
    const journey = this.journeyManager.getState()
    const stageEntry = (
      stageId: JourneyStageId,
      label: string,
    ): ProgressTimelineEntry => {
      const completedAt =
        this.progressStore.getJourneyStageCompletedAt(stageId)

      return {
        id: stageId,
        label,
        status: completedAt
          ? 'completed'
          : journey.activeStageId === stageId
            ? 'current'
            : 'pending',
        completedAt,
      }
    }
    const careerSelectedAt = this.progressStore.getCareerPathSelectedAt()

    return [
      stageEntry('meet-your-team', 'Meet Team'),
      stageEntry('learn-the-territory', 'Documentation Explorer'),
      stageEntry('first-week-missions', 'First Week Complete'),
      {
        id: 'career-path-selected',
        label: 'Career Path Selected',
        status: careerSelectedAt
          ? 'completed'
          : journey.activeStageId === 'become-productive'
            ? 'current'
            : 'pending',
        completedAt: careerSelectedAt,
      },
      stageEntry('become-productive', 'Become Productive'),
    ]
  }

  private createAchievements(): readonly AchievementInsight[] {
    return this.contentRegistry.badges.map((badge) => {
      const unlockedAt = this.progressStore.getBadgeUnlockedAt(badge.badgeId)

      return {
        badgeId: badge.badgeId,
        name: badge.name,
        description: badge.description,
        unlocked: this.progressStore.hasUnlockedBadge(badge.badgeId),
        unlockedAt,
      }
    })
  }

  private createCompletionMetric(
    completed: number,
    total: number,
  ): CompletionMetric {
    return {
      completed,
      total,
      percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
    }
  }

  private createDurationMetric(
    id: DurationMetric['id'],
    label: string,
    completedAt: string | null,
    completed: boolean,
  ): DurationMetric {
    if (!completedAt) {
      return {
        id,
        label,
        completedAt: null,
        durationMs: null,
        displayValue: completed ? 'Timestamp unavailable' : 'In progress',
      }
    }

    const durationMs = Math.max(
      0,
      Date.parse(completedAt) -
        Date.parse(this.progressStore.getOnboardingStartedAt()),
    )

    return {
      id,
      label,
      completedAt,
      durationMs,
      displayValue: this.formatDuration(durationMs),
    }
  }

  private findEarliest(timestamps: readonly string[]): string | null {
    return (
      [...timestamps].sort(
        (left, right) => Date.parse(left) - Date.parse(right),
      )[0] ?? null
    )
  }

  private formatDuration(durationMs: number): string {
    const minutes = Math.floor(durationMs / 60_000)

    if (minutes < 1) {
      return 'Less than a minute'
    }

    if (minutes < 60) {
      return `${minutes} min`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours < 24) {
      return remainingMinutes === 0
        ? `${hours} hr`
        : `${hours} hr ${remainingMinutes} min`
    }

    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return remainingHours === 0
      ? `${days} days`
      : `${days} days ${remainingHours} hr`
  }
}
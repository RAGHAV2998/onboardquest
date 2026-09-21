import type { BadgeId } from './badge'
import type { CareerMilestoneId, CareerPathId } from './career'
import type { MissionId } from './mission'
import type { TerritoryId } from './territory'

export type CompletionMetric = {
  readonly completed: number
  readonly total: number
  readonly percentage: number
}

export type CompletionMetrics = {
  readonly stages: CompletionMetric
  readonly territories: CompletionMetric
  readonly quests: CompletionMetric
  readonly missions: CompletionMetric
}

export type ProgressMetrics = {
  readonly careerPath: string | null
  readonly currentMilestone: string | null
  readonly level: number
  readonly totalXp: number
  readonly badgeCount: number
}

export type RecommendationMetrics = {
  readonly topRecommendation: string
  readonly activeStage: string | null
  readonly source: 'journey' | 'career' | 'complete'
}

export type TeamCompletionSummary = {
  readonly employees: 1
  readonly stageCompletion: number
  readonly missionCompletion: number
  readonly questCompletion: number
  readonly territoryCompletion: number
  readonly topRecommendation: string
}

export type DurationMetric = {
  readonly id:
    | 'first-quest'
    | 'team-completion'
    | 'territory-completion'
    | 'first-week-completion'
  readonly label: string
  readonly completedAt: string | null
  readonly durationMs: number | null
  readonly displayValue: string
}

export type TimelineStatus = 'completed' | 'current' | 'pending'

export type ProgressTimelineEntry = {
  readonly id: string
  readonly label: string
  readonly status: TimelineStatus
  readonly completedAt: string | null
}

export type AchievementInsight = {
  readonly badgeId: BadgeId
  readonly name: string
  readonly description: string
  readonly unlocked: boolean
  readonly unlockedAt: string | null
}

export type InsightsSnapshot = {
  readonly generatedAt: string
  readonly completion: CompletionMetrics
  readonly progress: ProgressMetrics
  readonly recommendation: RecommendationMetrics
  readonly managerSummary: TeamCompletionSummary
  readonly durations: readonly DurationMetric[]
  readonly timeline: readonly ProgressTimelineEntry[]
  readonly achievements: readonly AchievementInsight[]
}

export type ProgressSummaryExport = {
  readonly version: 1
  readonly exportedAt: string
  readonly playerProfile: {
    readonly profileType: 'local-demo-player'
    readonly onboardingStartedAt: string
    readonly level: number
    readonly totalXp: number
    readonly badges: readonly {
      readonly badgeId: BadgeId
      readonly name: string
      readonly unlockedAt: string | null
    }[]
  }
  readonly levels: readonly {
    readonly level: number
    readonly minimumXp: number
    readonly current: boolean
  }[]
  readonly territories: readonly {
    readonly territoryId: TerritoryId
    readonly title: string
    readonly unlocked: boolean
    readonly completed: boolean
    readonly completedAt: string | null
  }[]
  readonly missions: readonly {
    readonly missionId: MissionId
    readonly title: string
    readonly status: 'available' | 'completed'
    readonly completedAt: string | null
  }[]
  readonly careerProgress: {
    readonly selectedPathId: CareerPathId | null
    readonly title: string | null
    readonly selectedAt: string | null
    readonly currentMilestone: string | null
    readonly milestones: readonly {
      readonly milestoneId: CareerMilestoneId
      readonly title: string
      readonly completed: boolean
      readonly completedAt: string | null
    }[]
  }
}
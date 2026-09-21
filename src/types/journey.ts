import type { MilestoneId } from './mission'
import type { QuestId } from './quest'
import type { TerritoryId } from './territory'

export const journeyStageIds = [
  'meet-your-team',
  'learn-the-territory',
  'first-week-missions',
  'become-productive',
  'team-contributor',
] as const

export type JourneyStageId = (typeof journeyStageIds)[number]
export type JourneyNodeStatus =
  | 'locked'
  | 'available'
  | 'inProgress'
  | 'completed'
export type JourneyStatus = 'inProgress' | 'foundationComplete'

export type JourneyRule =
  | { readonly type: 'always' }
  | { readonly type: 'never' }
  | { readonly type: 'completeQuest'; readonly questId: QuestId }
  | {
      readonly type: 'completeTerritory'
      readonly territoryId: TerritoryId
    }
  | {
      readonly type: 'completeMilestone'
      readonly milestoneId: MilestoneId
    }

export type JourneyStage = {
  readonly stageId: JourneyStageId
  readonly order: number
  readonly title: string
  readonly description: string
  readonly unlockRule: JourneyRule
  readonly completionRule: JourneyRule
  readonly recommendation: string
}

export type JourneyNode = JourneyStage & {
  readonly status: JourneyNodeStatus
}

export type JourneyRecommendation = {
  readonly stageId: JourneyStageId
  readonly text: string
}

export type JourneyState = {
  readonly nodes: readonly JourneyNode[]
  readonly completedCount: number
  readonly totalCount: number
  readonly activeStageId: JourneyStageId | null
  readonly status: JourneyStatus
  readonly recommendation: JourneyRecommendation | null
}

export function isJourneyStageId(value: unknown): value is JourneyStageId {
  return (
    typeof value === 'string' &&
    (journeyStageIds as readonly string[]).includes(value)
  )
}

export function isJourneyStatus(value: unknown): value is JourneyStatus {
  return value === 'inProgress' || value === 'foundationComplete'
}
import type { QuestId } from './quest'
import type { MilestoneId } from './mission'
import type { JourneyStageId } from './journey'

export type BadgeId = string

export type QuestBadgeUnlockRule = {
  readonly type: 'completeQuest'
  readonly questId: QuestId
}

export type MilestoneBadgeUnlockRule = {
  readonly type: 'completeMilestone'
  readonly milestoneId: MilestoneId
}

export type JourneyStageBadgeUnlockRule = {
  readonly type: 'completeJourneyStage'
  readonly stageId: JourneyStageId
}

export type BadgeUnlockRule =
  | QuestBadgeUnlockRule
  | MilestoneBadgeUnlockRule
  | JourneyStageBadgeUnlockRule

export type BadgeDefinition = {
  readonly badgeId: BadgeId
  readonly name: string
  readonly description: string
  readonly unlockRule: BadgeUnlockRule
}

export function isBadgeId(value: unknown): value is BadgeId {
  return typeof value === 'string' && value.trim().length > 0
}
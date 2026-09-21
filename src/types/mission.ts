export const missionIds = [
  'access-kusto',
  'run-first-query',
  'read-architecture-overview',
  'meet-your-mentor',
  'fix-first-bug',
] as const

export const milestoneIds = ['first-week-complete'] as const

export type MissionId = (typeof missionIds)[number]
export type MilestoneId = (typeof milestoneIds)[number]
export type MissionCategory = 'access' | 'learning' | 'networking' | 'coding'
export type MissionStatus = 'available' | 'completed'

export type ManualCompletionRequirement = {
  readonly type: 'manualConfirmation'
}

export type MissionDefinition = {
  readonly missionId: MissionId
  readonly title: string
  readonly description: string
  readonly category: MissionCategory
  readonly initialStatus: 'available'
  readonly rewardXp: number
  readonly completionRequirement: ManualCompletionRequirement
}

export type MissionState = MissionDefinition & {
  readonly status: MissionStatus
}

export type MissionBoardState = {
  readonly title: string
  readonly missions: readonly MissionState[]
  readonly completedCount: number
  readonly totalCount: number
  readonly completed: boolean
}

export type MilestoneDefinition = {
  readonly milestoneId: MilestoneId
  readonly title: string
  readonly rewardXp: number
}

export function isMissionId(value: unknown): value is MissionId {
  return (
    typeof value === 'string' &&
    (missionIds as readonly string[]).includes(value)
  )
}

export function isMilestoneId(value: unknown): value is MilestoneId {
  return (
    typeof value === 'string' &&
    (milestoneIds as readonly string[]).includes(value)
  )
}
import type { DialogueId } from './dialogue'

export const careerPathIds = [
  'engineer',
  'data-ai',
  'reliability',
  'leadership',
] as const

export const careerMilestoneIds = [
  'engineer-learn-architecture',
  'engineer-first-contribution',
  'engineer-own-feature',
  'data-ai-explore-telemetry',
  'data-ai-create-dashboard',
  'data-ai-deliver-insight',
  'reliability-understand-incidents',
  'reliability-study-root-causes',
  'reliability-improve-operational-health',
  'leadership-mentor-others',
  'leadership-drive-project',
  'leadership-lead-initiative',
] as const

export type CareerPathId = (typeof careerPathIds)[number]
export type CareerMilestoneId = (typeof careerMilestoneIds)[number]
export type CareerPathStatus = 'locked' | 'unlocked' | 'active'

export type CareerMilestone = {
  readonly milestoneId: CareerMilestoneId
  readonly order: number
  readonly title: string
  readonly description: string
}

export type CareerTrack = {
  readonly trackId: string
  readonly milestones: readonly CareerMilestone[]
}

export type CareerPathUnlockRule = {
  readonly type: 'completeDialogue'
  readonly dialogueId: DialogueId
}

export type CareerPath = {
  readonly pathId: CareerPathId
  readonly title: string
  readonly description: string
  readonly unlockRule: CareerPathUnlockRule
  readonly track: CareerTrack
}

export type CareerMilestoneState = CareerMilestone & {
  readonly completed: boolean
  readonly current: boolean
}

export type CareerPathState = Omit<CareerPath, 'track'> & {
  readonly status: CareerPathStatus
  readonly track: Omit<CareerTrack, 'milestones'> & {
    readonly milestones: readonly CareerMilestoneState[]
  }
  readonly completedCount: number
  readonly totalCount: number
  readonly completed: boolean
}

export type CareerState = {
  readonly paths: readonly CareerPathState[]
  readonly selectedPathId: CareerPathId | null
  readonly currentPath: CareerPathState | null
  readonly currentMilestone: CareerMilestoneState | null
  readonly recommendation: string
}

export function isCareerPathId(value: unknown): value is CareerPathId {
  return (
    typeof value === 'string' &&
    (careerPathIds as readonly string[]).includes(value)
  )
}

export function isCareerMilestoneId(
  value: unknown,
): value is CareerMilestoneId {
  return (
    typeof value === 'string' &&
    (careerMilestoneIds as readonly string[]).includes(value)
  )
}
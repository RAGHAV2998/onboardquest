import type { QuestId } from './quest'
import type { MilestoneId } from './mission'

export const territoryIds = [
  'team',
  'services',
  'tools',
  'repositories',
  'documentation',
  'mentor-tower',
] as const

export const discoveryObjectIds = [
  'architecture-guide',
  'setup-guide',
  'team-wiki',
] as const

export type TerritoryId = (typeof territoryIds)[number]
export type DiscoveryObjectId = (typeof discoveryObjectIds)[number]
export type GameSceneKey =
  | 'team-village'
  | 'documentation-area'
  | 'mentor-tower'

export type TerritoryUnlockCondition =
  | { readonly type: 'none' }
  | {
      readonly type: 'completeMilestone'
      readonly milestoneId: MilestoneId
    }

export type TerritoryDefinition = {
  readonly territoryId: TerritoryId
  readonly title: string
  readonly description: string
  readonly icon: string
  readonly requiredLevel: number
  readonly unlockCondition: TerritoryUnlockCondition
  readonly unlockHint: string | null
  readonly quests: readonly QuestId[]
  readonly sceneKey: GameSceneKey | null
}

export type TerritoryState = TerritoryDefinition & {
  readonly unlocked: boolean
  readonly completed: boolean
}

export type DiscoveryObjectDefinition = {
  readonly objectId: DiscoveryObjectId
  readonly territoryId: TerritoryId
  readonly title: string
  readonly position: {
    readonly x: number
    readonly y: number
  }
  readonly color: number
  readonly interactionRadius: number
}

export type DiscoveryObjectState = DiscoveryObjectDefinition & {
  readonly discovered: boolean
}

export type TerritoryProgressState = {
  readonly territoryId: TerritoryId
  readonly title: string
  readonly objects: readonly DiscoveryObjectState[]
  readonly discoveredCount: number
  readonly totalCount: number
  readonly completed: boolean
}

export function isTerritoryId(value: unknown): value is TerritoryId {
  return (
    typeof value === 'string' &&
    (territoryIds as readonly string[]).includes(value)
  )
}

export function isDiscoveryObjectId(
  value: unknown,
): value is DiscoveryObjectId {
  return (
    typeof value === 'string' &&
    (discoveryObjectIds as readonly string[]).includes(value)
  )
}
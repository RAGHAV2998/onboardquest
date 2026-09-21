import type { DialogueId } from './dialogue'
import type { DiscoveryObjectId } from './territory'

export type QuestId = string
export type QuestObjectiveId = string

export type CompleteDialogueRule = {
  readonly type: 'completeDialogue'
  readonly dialogueId: DialogueId
}

export type DiscoverObjectRule = {
  readonly type: 'discoverObject'
  readonly objectId: DiscoveryObjectId
}

export type QuestCompletionRule =
  | CompleteDialogueRule
  | DiscoverObjectRule

export type QuestObjective = {
  readonly objectiveId: QuestObjectiveId
  readonly label: string
  readonly completionRule: QuestCompletionRule
}

export type QuestDefinition = {
  readonly questId: QuestId
  readonly title: string
  readonly description: string
  readonly rewardXp: number
  readonly objectives: readonly QuestObjective[]
}

export type QuestObjectiveState = QuestObjective & {
  readonly completed: boolean
}

export type QuestState = {
  readonly questId: QuestId
  readonly title: string
  readonly description: string
  readonly rewardXp: number
  readonly objectives: readonly QuestObjectiveState[]
  readonly completedCount: number
  readonly totalCount: number
  readonly completed: boolean
}

export function isQuestId(value: unknown): value is QuestId {
  return typeof value === 'string' && value.trim().length > 0
}
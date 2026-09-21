import type { DialogueId } from '../../types/dialogue'
import type { DiscoveryObjectId } from '../../types/territory'
import type {
  QuestDefinition,
  QuestId,
  QuestObjective,
  QuestState,
} from '../../types/quest'
import { ProgressStore } from './ProgressStore'

type QuestManagerCallbacks = {
  readonly onQuestStateChanged: (quest: QuestState) => void
  readonly onQuestCompleted: (quest: QuestState) => void
}

export class QuestManager {
  constructor(
    private readonly quests: readonly QuestDefinition[],
    private readonly progressStore: ProgressStore,
    private readonly callbacks: QuestManagerCallbacks,
  ) {
    this.validateDefinitions()
    this.publishInitialState()
  }

  recordDialogueCompleted(dialogueId: DialogueId): void {
    if (!this.progressStore.markDialogueCompleted(dialogueId)) {
      return
    }

    this.publishAffectedQuests(
      (objective) =>
        objective.completionRule.type === 'completeDialogue' &&
        objective.completionRule.dialogueId === dialogueId,
    )
  }

  recordObjectDiscovered(objectId: DiscoveryObjectId): void {
    if (!this.progressStore.hasDiscoveredObject(objectId)) {
      return
    }

    this.publishAffectedQuests(
      (objective) =>
        objective.completionRule.type === 'discoverObject' &&
        objective.completionRule.objectId === objectId,
    )
  }

  private publishAffectedQuests(
    matchesObjective: (objective: QuestObjective) => boolean,
  ): void {
    for (const quest of this.quests) {
      const affected = quest.objectives.some(matchesObjective)

      if (!affected) {
        continue
      }

      const state = this.createQuestState(quest)
      this.callbacks.onQuestStateChanged(state)

      if (
        state.completed &&
        this.progressStore.markQuestCompleted(state.questId)
      ) {
        this.callbacks.onQuestCompleted(state)
      }
    }
  }

  private publishInitialState(): void {
    for (const quest of this.quests) {
      const state = this.createQuestState(quest)

      if (state.completed) {
        this.progressStore.markQuestCompleted(state.questId)
      }

      this.callbacks.onQuestStateChanged(state)
    }
  }

  private createQuestState(quest: QuestDefinition): QuestState {
    const objectives = quest.objectives.map((objective) => ({
      ...objective,
      completed: this.isObjectiveCompleted(objective),
    }))
    const completedCount = objectives.filter(
      ({ completed }) => completed,
    ).length

    return {
      ...quest,
      objectives,
      completedCount,
      totalCount: objectives.length,
      completed:
        objectives.length > 0 && completedCount === objectives.length,
    }
  }

  private isObjectiveCompleted(objective: QuestObjective): boolean {
    switch (objective.completionRule.type) {
      case 'completeDialogue':
        return this.progressStore.hasCompletedDialogue(
          objective.completionRule.dialogueId,
        )
      case 'discoverObject':
        return this.progressStore.hasDiscoveredObject(
          objective.completionRule.objectId,
        )
    }
  }

  private validateDefinitions(): void {
    const questIds = new Set<QuestId>()

    for (const quest of this.quests) {
      if (questIds.has(quest.questId)) {
        throw new Error(`Duplicate quest ID: ${quest.questId}`)
      }

      questIds.add(quest.questId)

      if (!Number.isInteger(quest.rewardXp) || quest.rewardXp < 0) {
        throw new Error(`Invalid XP reward for quest: ${quest.questId}`)
      }

      const objectiveIds = new Set<string>()

      for (const objective of quest.objectives) {
        if (objectiveIds.has(objective.objectiveId)) {
          throw new Error(
            `Duplicate objective ID in ${quest.questId}: ${objective.objectiveId}`,
          )
        }

        objectiveIds.add(objective.objectiveId)
      }
    }
  }
}
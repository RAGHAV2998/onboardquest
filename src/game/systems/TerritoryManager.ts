import type { QuestId } from '../../types/quest'
import type {
  DiscoveryObjectDefinition,
  DiscoveryObjectId,
  TerritoryDefinition,
  TerritoryId,
  TerritoryProgressState,
  TerritoryState,
} from '../../types/territory'
import { ProgressStore } from './ProgressStore'

type TerritoryManagerCallbacks = {
  readonly onTerritoriesChanged: (territories: readonly TerritoryState[]) => void
  readonly onTerritoryProgressChanged: (
    progress: TerritoryProgressState,
  ) => void
}

export class TerritoryManager {
  constructor(
    private readonly territories: readonly TerritoryDefinition[],
    private readonly objects: readonly DiscoveryObjectDefinition[],
    playerLevel: number,
    private readonly progressStore: ProgressStore,
    private readonly callbacks: TerritoryManagerCallbacks,
  ) {
    this.validateDefinitions()
    this.unlockForLevel(playerLevel)
    this.syncCompletedTerritories()
    this.publishAllState()
  }

  updatePlayerLevel(playerLevel: number): void {
    if (this.unlockForLevel(playerLevel)) {
      this.callbacks.onTerritoriesChanged(this.getTerritoryStates())
    }
  }

  recordObjectDiscovered(objectId: DiscoveryObjectId): boolean {
    const object = this.objects.find(
      (candidate) => candidate.objectId === objectId,
    )

    if (
      !object ||
      !this.progressStore.hasUnlockedTerritory(object.territoryId) ||
      !this.progressStore.discoverObject(objectId)
    ) {
      return false
    }

    this.callbacks.onTerritoryProgressChanged(
      this.createProgressState(object.territoryId),
    )
    return true
  }

  recordQuestCompleted(questId: QuestId): void {
    let stateChanged = false

    for (const territory of this.territories) {
      if (
        territory.quests.includes(questId) &&
        this.isTerritoryComplete(territory) &&
        this.progressStore.completeTerritory(territory.territoryId)
      ) {
        stateChanged = true
      }
    }

    if (stateChanged) {
      this.callbacks.onTerritoriesChanged(this.getTerritoryStates())
    }
  }

  isUnlocked(territoryId: TerritoryId): boolean {
    return this.progressStore.hasUnlockedTerritory(territoryId)
  }

  getDefinition(territoryId: TerritoryId): TerritoryDefinition | null {
    return (
      this.territories.find(
        (territory) => territory.territoryId === territoryId,
      ) ?? null
    )
  }

  getTerritoryStates(): readonly TerritoryState[] {
    return this.territories.map((territory) => ({
      ...territory,
      unlocked: this.progressStore.hasUnlockedTerritory(
        territory.territoryId,
      ),
      completed: this.progressStore.hasCompletedTerritory(
        territory.territoryId,
      ),
    }))
  }

  getProgressState(territoryId: TerritoryId): TerritoryProgressState {
    return this.createProgressState(territoryId)
  }

  private unlockForLevel(playerLevel: number): boolean {
    let changed = false

    for (const territory of this.territories) {
      if (
        territory.requiredLevel <= playerLevel &&
        this.matchesUnlockCondition(territory) &&
        this.progressStore.unlockTerritory(territory.territoryId)
      ) {
        changed = true
      }
    }

    return changed
  }

  private matchesUnlockCondition(
    territory: TerritoryDefinition,
  ): boolean {
    switch (territory.unlockCondition.type) {
      case 'none':
        return true
      case 'completeMilestone':
        return this.progressStore.hasCompletedMilestone(
          territory.unlockCondition.milestoneId,
        )
    }
  }

  private syncCompletedTerritories(): void {
    for (const territory of this.territories) {
      if (this.isTerritoryComplete(territory)) {
        this.progressStore.completeTerritory(territory.territoryId)
      }
    }
  }

  private isTerritoryComplete(territory: TerritoryDefinition): boolean {
    return (
      territory.quests.length > 0 &&
      territory.quests.every((questId) =>
        this.progressStore.hasCompletedQuest(questId),
      )
    )
  }

  private createProgressState(
    territoryId: TerritoryId,
  ): TerritoryProgressState {
    const territory = this.getDefinition(territoryId)

    if (!territory) {
      throw new Error(`Unknown territory: ${territoryId}`)
    }

    const objects = this.objects
      .filter((object) => object.territoryId === territoryId)
      .map((object) => ({
        ...object,
        discovered: this.progressStore.hasDiscoveredObject(object.objectId),
      }))
    const discoveredCount = objects.filter(
      ({ discovered }) => discovered,
    ).length

    return {
      territoryId,
      title: territory.title,
      objects,
      discoveredCount,
      totalCount: objects.length,
      completed:
        objects.length > 0 && discoveredCount === objects.length,
    }
  }

  private publishAllState(): void {
    this.callbacks.onTerritoriesChanged(this.getTerritoryStates())

    for (const territory of this.territories) {
      if (
        this.objects.some(
          (object) => object.territoryId === territory.territoryId,
        )
      ) {
        this.callbacks.onTerritoryProgressChanged(
          this.createProgressState(territory.territoryId),
        )
      }
    }
  }

  private validateDefinitions(): void {
    const territoryIds = new Set<TerritoryId>()
    const objectIds = new Set<DiscoveryObjectId>()

    for (const territory of this.territories) {
      if (
        territoryIds.has(territory.territoryId) ||
        !Number.isInteger(territory.requiredLevel) ||
        territory.requiredLevel < 1
      ) {
        throw new Error(`Invalid territory: ${territory.territoryId}`)
      }

      territoryIds.add(territory.territoryId)
    }

    for (const object of this.objects) {
      if (
        objectIds.has(object.objectId) ||
        !territoryIds.has(object.territoryId)
      ) {
        throw new Error(`Invalid discovery object: ${object.objectId}`)
      }

      objectIds.add(object.objectId)
    }
  }
}
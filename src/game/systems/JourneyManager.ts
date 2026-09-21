import type {
  JourneyNode,
  JourneyRule,
  JourneyStage,
  JourneyState,
} from '../../types/journey'
import { ProgressStore } from './ProgressStore'

export type JourneyEvaluation = {
  readonly state: JourneyState
  readonly newlyCompletedStages: readonly JourneyStage[]
  readonly foundationJustCompleted: boolean
}

type JourneyManagerCallbacks = {
  readonly onJourneyChanged: (state: JourneyState) => void
}

const FOUNDATION_STAGE_COUNT = 3

export class JourneyManager {
  private readonly stages: readonly JourneyStage[]
  private currentState!: JourneyState

  constructor(
    stages: readonly JourneyStage[],
    private readonly progressStore: ProgressStore,
    private readonly callbacks: JourneyManagerCallbacks,
  ) {
    this.stages = [...stages].sort((first, second) => first.order - second.order)
    this.validateDefinitions()
    this.currentState = this.evaluate(false).state
  }

  refresh(): JourneyEvaluation {
    return this.evaluate(true)
  }

  getState(): JourneyState {
    return this.currentState
  }

  private evaluate(trackTransition: boolean): JourneyEvaluation {
    const previousStatus = this.currentState?.status ?? 'inProgress'
    const newlyCompletedStages: JourneyStage[] = []

    for (const stage of this.stages) {
      if (this.matchesRule(stage.unlockRule)) {
        this.progressStore.unlockJourneyStage(stage.stageId)
      }

      if (
        this.matchesRule(stage.completionRule) &&
        this.progressStore.completeJourneyStage(stage.stageId)
      ) {
        newlyCompletedStages.push(stage)
      }
    }

    const completedCount = this.stages.filter((stage) =>
      this.progressStore.hasCompletedJourneyStage(stage.stageId),
    ).length
    const activeStage = this.stages.find(
      (stage) =>
        this.progressStore.hasUnlockedJourneyStage(stage.stageId) &&
        !this.progressStore.hasCompletedJourneyStage(stage.stageId),
    )
    const nodes: JourneyNode[] = this.stages.map((stage) => ({
      ...stage,
      status: this.getNodeStatus(stage, activeStage?.stageId ?? null),
    }))
    const status =
      completedCount >= FOUNDATION_STAGE_COUNT
        ? 'foundationComplete'
        : 'inProgress'
    const recommendation = activeStage
      ? {
          stageId: activeStage.stageId,
          text: activeStage.recommendation,
        }
      : null
    const state: JourneyState = {
      nodes,
      completedCount,
      totalCount: nodes.length,
      activeStageId: activeStage?.stageId ?? null,
      status,
      recommendation,
    }

    this.progressStore.setJourneySnapshot(
      state.activeStageId,
      state.status,
      state.recommendation?.stageId ?? null,
    )
    this.currentState = state
    this.callbacks.onJourneyChanged(state)

    return {
      state,
      newlyCompletedStages,
      foundationJustCompleted:
        trackTransition &&
        previousStatus !== 'foundationComplete' &&
        status === 'foundationComplete',
    }
  }

  private getNodeStatus(
    stage: JourneyStage,
    activeStageId: JourneyStage['stageId'] | null,
  ): JourneyNode['status'] {
    if (this.progressStore.hasCompletedJourneyStage(stage.stageId)) {
      return 'completed'
    }

    if (!this.progressStore.hasUnlockedJourneyStage(stage.stageId)) {
      return 'locked'
    }

    return stage.stageId === activeStageId ? 'inProgress' : 'available'
  }

  private matchesRule(rule: JourneyRule): boolean {
    switch (rule.type) {
      case 'always':
        return true
      case 'never':
        return false
      case 'completeQuest':
        return this.progressStore.hasCompletedQuest(rule.questId)
      case 'completeTerritory':
        return this.progressStore.hasCompletedTerritory(rule.territoryId)
      case 'completeMilestone':
        return this.progressStore.hasCompletedMilestone(rule.milestoneId)
    }
  }

  private validateDefinitions(): void {
    const stageIds = new Set<string>()
    const orders = new Set<number>()

    for (const stage of this.stages) {
      if (
        stageIds.has(stage.stageId) ||
        orders.has(stage.order) ||
        !Number.isInteger(stage.order) ||
        stage.order < 1
      ) {
        throw new Error(`Invalid journey stage: ${stage.stageId}`)
      }

      stageIds.add(stage.stageId)
      orders.add(stage.order)
    }
  }
}
import type {
  MilestoneDefinition,
  MissionBoardState,
  MissionDefinition,
  MissionId,
  MissionState,
} from '../../types/mission'
import { ProgressStore } from './ProgressStore'

type MissionManagerCallbacks = {
  readonly onMissionBoardChanged: (board: MissionBoardState) => void
  readonly onMissionCompleted: (mission: MissionState) => void
  readonly onMilestoneCompleted: (milestone: MilestoneDefinition) => void
}

export class MissionManager {
  constructor(
    private readonly missions: readonly MissionDefinition[],
    private readonly milestone: MilestoneDefinition,
    private readonly progressStore: ProgressStore,
    private readonly callbacks: MissionManagerCallbacks,
  ) {
    this.validateDefinitions()
    const board = this.createBoardState()
    this.callbacks.onMissionBoardChanged(board)

    if (
      board.completed &&
      this.progressStore.completeMilestone(this.milestone.milestoneId)
    ) {
      this.callbacks.onMilestoneCompleted(this.milestone)
    }
  }

  completeManually(missionId: MissionId): boolean {
    const definition = this.missions.find(
      (mission) => mission.missionId === missionId,
    )

    if (
      !definition ||
      definition.completionRequirement.type !== 'manualConfirmation' ||
      !this.progressStore.completeMission(missionId)
    ) {
      return false
    }

    const mission = this.createMissionState(definition)
    const board = this.createBoardState()
    this.callbacks.onMissionCompleted(mission)
    this.callbacks.onMissionBoardChanged(board)

    if (
      board.completed &&
      this.progressStore.completeMilestone(this.milestone.milestoneId)
    ) {
      this.callbacks.onMilestoneCompleted(this.milestone)
    }

    return true
  }

  private createBoardState(): MissionBoardState {
    const missions = this.missions.map((mission) =>
      this.createMissionState(mission),
    )
    const completedCount = missions.filter(
      ({ status }) => status === 'completed',
    ).length

    return {
      title: 'First Week Missions',
      missions,
      completedCount,
      totalCount: missions.length,
      completed:
        missions.length > 0 && completedCount === missions.length,
    }
  }

  private createMissionState(mission: MissionDefinition): MissionState {
    return {
      ...mission,
      status: this.progressStore.hasCompletedMission(mission.missionId)
        ? 'completed'
        : mission.initialStatus,
    }
  }

  private validateDefinitions(): void {
    const missionIds = new Set<MissionId>()

    for (const mission of this.missions) {
      if (
        missionIds.has(mission.missionId) ||
        !Number.isInteger(mission.rewardXp) ||
        mission.rewardXp <= 0
      ) {
        throw new Error(`Invalid mission: ${mission.missionId}`)
      }

      missionIds.add(mission.missionId)
    }

    if (
      !Number.isInteger(this.milestone.rewardXp) ||
      this.milestone.rewardXp <= 0
    ) {
      throw new Error(`Invalid milestone: ${this.milestone.milestoneId}`)
    }
  }
}
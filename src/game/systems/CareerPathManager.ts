import type {
  CareerMilestone,
  CareerMilestoneId,
  CareerPath,
  CareerPathId,
  CareerPathState,
  CareerState,
} from '../../types/career'
import { ProgressStore } from './ProgressStore'

type CareerPathManagerCallbacks = {
  readonly onCareerStateChanged: (state: CareerState) => void
}

export class CareerPathManager {
  private currentState!: CareerState

  constructor(
    private readonly paths: readonly CareerPath[],
    private readonly progressStore: ProgressStore,
    private readonly callbacks: CareerPathManagerCallbacks,
  ) {
    this.validateDefinitions()
    this.publishState()
  }

  refreshAvailability(): void {
    this.publishState()
  }

  selectPath(pathId: CareerPathId): boolean {
    const path = this.paths.find((candidate) => candidate.pathId === pathId)

    if (!path || !this.isPathUnlocked(path)) {
      return false
    }

    this.progressStore.selectCareerPath(pathId)
    this.publishState()
    return true
  }

  completeMilestone(milestoneId: CareerMilestoneId): boolean {
    const selectedPath = this.getSelectedPath()

    if (!selectedPath || !this.isPathUnlocked(selectedPath)) {
      return false
    }

    const currentMilestone = this.getCurrentMilestone(selectedPath)

    if (
      !currentMilestone ||
      currentMilestone.milestoneId !== milestoneId ||
      !this.progressStore.completeCareerMilestone(milestoneId)
    ) {
      return false
    }

    this.publishState()
    return true
  }

  getState(): CareerState {
    return this.currentState
  }

  private publishState(): void {
    const selectedPathId = this.progressStore.getSelectedCareerPathId()
    const paths = this.paths.map((path) =>
      this.createPathState(path, selectedPathId),
    )
    const currentPath =
      paths.find(({ status }) => status === 'active') ?? null
    const currentMilestone =
      currentPath?.track.milestones.find(({ current }) => current) ?? null
    const recommendation = !currentPath
      ? 'Visit Mentor Tower and choose a path.'
      : currentMilestone
        ? `Complete ${currentMilestone.title}.`
        : `${currentPath.title} path milestones complete.`

    this.currentState = {
      paths,
      selectedPathId: currentPath?.pathId ?? null,
      currentPath,
      currentMilestone,
      recommendation,
    }
    this.callbacks.onCareerStateChanged(this.currentState)
  }

  private createPathState(
    path: CareerPath,
    selectedPathId: CareerPathId | null,
  ): CareerPathState {
    const unlocked = this.isPathUnlocked(path)
    const orderedMilestones = [...path.track.milestones].sort(
      (first, second) => first.order - second.order,
    )
    const firstIncompleteId = orderedMilestones.find(
      ({ milestoneId }) =>
        !this.progressStore.hasCompletedCareerMilestone(milestoneId),
    )?.milestoneId
    const milestones = orderedMilestones.map((milestone) => ({
      ...milestone,
      completed: this.progressStore.hasCompletedCareerMilestone(
        milestone.milestoneId,
      ),
      current:
        unlocked &&
        selectedPathId === path.pathId &&
        milestone.milestoneId === firstIncompleteId,
    }))
    const completedCount = milestones.filter(
      ({ completed }) => completed,
    ).length

    return {
      ...path,
      status:
        unlocked && selectedPathId === path.pathId
          ? 'active'
          : unlocked
            ? 'unlocked'
            : 'locked',
      track: {
        ...path.track,
        milestones,
      },
      completedCount,
      totalCount: milestones.length,
      completed:
        milestones.length > 0 && completedCount === milestones.length,
    }
  }

  private getSelectedPath(): CareerPath | null {
    const selectedPathId = this.progressStore.getSelectedCareerPathId()

    return (
      this.paths.find((path) => path.pathId === selectedPathId) ?? null
    )
  }

  private getCurrentMilestone(path: CareerPath): CareerMilestone | null {
    return (
      [...path.track.milestones]
        .sort((first, second) => first.order - second.order)
        .find(
          ({ milestoneId }) =>
            !this.progressStore.hasCompletedCareerMilestone(milestoneId),
        ) ?? null
    )
  }

  private isPathUnlocked(path: CareerPath): boolean {
    switch (path.unlockRule.type) {
      case 'completeDialogue':
        return this.progressStore.hasCompletedDialogue(
          path.unlockRule.dialogueId,
        )
    }
  }

  private validateDefinitions(): void {
    const pathIds = new Set<CareerPathId>()
    const milestoneIds = new Set<CareerMilestoneId>()

    for (const path of this.paths) {
      if (pathIds.has(path.pathId)) {
        throw new Error(`Duplicate career path: ${path.pathId}`)
      }

      pathIds.add(path.pathId)
      const orders = new Set<number>()

      for (const milestone of path.track.milestones) {
        if (
          milestoneIds.has(milestone.milestoneId) ||
          orders.has(milestone.order) ||
          !Number.isInteger(milestone.order) ||
          milestone.order < 1
        ) {
          throw new Error(`Invalid career milestone: ${milestone.milestoneId}`)
        }

        milestoneIds.add(milestone.milestoneId)
        orders.add(milestone.order)
      }
    }
  }
}
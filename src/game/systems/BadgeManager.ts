import type { BadgeDefinition } from '../../types/badge'
import type { JourneyStageId } from '../../types/journey'
import type { MilestoneId } from '../../types/mission'
import type { QuestId } from '../../types/quest'
import { ProgressStore } from './ProgressStore'

type BadgeManagerCallbacks = {
  readonly onBadgesChanged: (badges: readonly BadgeDefinition[]) => void
}

export class BadgeManager {
  constructor(
    private readonly badges: readonly BadgeDefinition[],
    private readonly progressStore: ProgressStore,
    private readonly callbacks: BadgeManagerCallbacks,
  ) {
    this.validateDefinitions()
    this.callbacks.onBadgesChanged(this.getUnlockedBadges())
  }

  recordQuestCompleted(questId: QuestId): readonly BadgeDefinition[] {
    return this.unlockMatchingBadges(
      (badge) =>
        badge.unlockRule.type === 'completeQuest' &&
        badge.unlockRule.questId === questId,
    )
  }

  recordMilestoneCompleted(
    milestoneId: MilestoneId,
  ): readonly BadgeDefinition[] {
    return this.unlockMatchingBadges(
      (badge) =>
        badge.unlockRule.type === 'completeMilestone' &&
        badge.unlockRule.milestoneId === milestoneId,
    )
  }

  recordJourneyStageCompleted(
    stageId: JourneyStageId,
  ): readonly BadgeDefinition[] {
    return this.unlockMatchingBadges(
      (badge) =>
        badge.unlockRule.type === 'completeJourneyStage' &&
        badge.unlockRule.stageId === stageId,
    )
  }

  private unlockMatchingBadges(
    matches: (badge: BadgeDefinition) => boolean,
  ): readonly BadgeDefinition[] {
    const newlyUnlocked = this.badges.filter(
      (badge) =>
        matches(badge) && this.progressStore.unlockBadge(badge.badgeId),
    )

    if (newlyUnlocked.length > 0) {
      this.callbacks.onBadgesChanged(this.getUnlockedBadges())
    }

    return newlyUnlocked
  }

  private getUnlockedBadges(): readonly BadgeDefinition[] {
    return this.badges.filter((badge) =>
      this.progressStore.hasUnlockedBadge(badge.badgeId),
    )
  }

  private validateDefinitions(): void {
    const badgeIds = new Set<string>()

    for (const badge of this.badges) {
      if (badgeIds.has(badge.badgeId)) {
        throw new Error(`Duplicate badge ID: ${badge.badgeId}`)
      }

      badgeIds.add(badge.badgeId)
    }
  }
}
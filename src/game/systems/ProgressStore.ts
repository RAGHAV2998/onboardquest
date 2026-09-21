import {
  isDialogueId,
  type DialogueId,
} from '../../types/dialogue'
import { isBadgeId, type BadgeId } from '../../types/badge'
import { isNpcId, type NpcId } from '../../types/npc'
import {
  isJourneyStageId,
  isJourneyStatus,
  type JourneyStageId,
  type JourneyStatus,
} from '../../types/journey'
import {
  isCareerMilestoneId,
  isCareerPathId,
  type CareerMilestoneId,
  type CareerPathId,
} from '../../types/career'
import {
  isMilestoneId,
  isMissionId,
  type MilestoneId,
  type MissionId,
} from '../../types/mission'
import { isQuestId, type QuestId } from '../../types/quest'
import {
  isDiscoveryObjectId,
  isTerritoryId,
  type DiscoveryObjectId,
  type TerritoryId,
} from '../../types/territory'

const STORAGE_KEY = 'onboardquest.progress.v1'

type TimestampRecord<Id extends string> = Readonly<
  Partial<Record<Id, string>>
>

function isTimestamp(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    !Number.isNaN(Date.parse(value))
  )
}

function isTimestampRecord<Id extends string>(
  value: unknown,
  isId: (candidate: unknown) => candidate is Id,
): value is TimestampRecord<Id> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.entries(value).every(
      ([id, timestamp]) => isId(id) && isTimestamp(timestamp),
    )
  )
}

type SavedProgress = {
  readonly version: 1
  readonly onboardingStartedAt: string
  readonly visitedNpcIds: readonly NpcId[]
  readonly completedDialogueIds: readonly DialogueId[]
  readonly completedQuestIds: readonly QuestId[]
  readonly experiencePoints: number
  readonly playerLevel: number
  readonly unlockedBadgeIds: readonly BadgeId[]
  readonly claimedQuestRewardIds: readonly QuestId[]
  readonly unlockedTerritoryIds: readonly TerritoryId[]
  readonly completedTerritoryIds: readonly TerritoryId[]
  readonly discoveredObjectIds: readonly DiscoveryObjectId[]
  readonly completedMissionIds: readonly MissionId[]
  readonly claimedMissionRewardIds: readonly MissionId[]
  readonly completedMilestoneIds: readonly MilestoneId[]
  readonly claimedMilestoneRewardIds: readonly MilestoneId[]
  readonly unlockedJourneyStageIds: readonly JourneyStageId[]
  readonly completedJourneyStageIds: readonly JourneyStageId[]
  readonly activeJourneyStageId: JourneyStageId | null
  readonly journeyStatus: JourneyStatus
  readonly journeyRecommendationStageId: JourneyStageId | null
  readonly selectedCareerPathId: CareerPathId | null
  readonly completedCareerMilestoneIds: readonly CareerMilestoneId[]
  readonly questCompletedAt: TimestampRecord<QuestId>
  readonly territoryCompletedAt: TimestampRecord<TerritoryId>
  readonly missionCompletedAt: TimestampRecord<MissionId>
  readonly milestoneCompletedAt: TimestampRecord<MilestoneId>
  readonly journeyStageCompletedAt: TimestampRecord<JourneyStageId>
  readonly badgeUnlockedAt: TimestampRecord<BadgeId>
  readonly careerPathSelectedAt: string | null
  readonly careerMilestoneCompletedAt: TimestampRecord<CareerMilestoneId>
}

export class ProgressStore {
  private onboardingStartedAt: string
  private readonly visitedNpcIds: Set<NpcId>
  private readonly completedDialogueIds: Set<DialogueId>
  private readonly completedQuestIds: Set<QuestId>
  private experiencePoints: number
  private playerLevel: number
  private readonly unlockedBadgeIds: Set<BadgeId>
  private readonly claimedQuestRewardIds: Set<QuestId>
  private readonly unlockedTerritoryIds: Set<TerritoryId>
  private readonly completedTerritoryIds: Set<TerritoryId>
  private readonly discoveredObjectIds: Set<DiscoveryObjectId>
  private readonly completedMissionIds: Set<MissionId>
  private readonly claimedMissionRewardIds: Set<MissionId>
  private readonly completedMilestoneIds: Set<MilestoneId>
  private readonly claimedMilestoneRewardIds: Set<MilestoneId>
  private readonly unlockedJourneyStageIds: Set<JourneyStageId>
  private readonly completedJourneyStageIds: Set<JourneyStageId>
  private activeJourneyStageId: JourneyStageId | null
  private journeyStatus: JourneyStatus
  private journeyRecommendationStageId: JourneyStageId | null
  private selectedCareerPathId: CareerPathId | null
  private readonly completedCareerMilestoneIds: Set<CareerMilestoneId>
  private readonly questCompletedAt: Map<QuestId, string>
  private readonly territoryCompletedAt: Map<TerritoryId, string>
  private readonly missionCompletedAt: Map<MissionId, string>
  private readonly milestoneCompletedAt: Map<MilestoneId, string>
  private readonly journeyStageCompletedAt: Map<JourneyStageId, string>
  private readonly badgeUnlockedAt: Map<BadgeId, string>
  private careerPathSelectedAt: string | null
  private readonly careerMilestoneCompletedAt: Map<
    CareerMilestoneId,
    string
  >

  constructor(
    private readonly storage: Storage,
    private readonly now: () => string = () => new Date().toISOString(),
  ) {
    const savedProgress = this.loadProgress()
    this.onboardingStartedAt = savedProgress.onboardingStartedAt
    this.visitedNpcIds = new Set(savedProgress.visitedNpcIds)
    this.completedDialogueIds = new Set(
      savedProgress.completedDialogueIds,
    )
    this.completedQuestIds = new Set(savedProgress.completedQuestIds)
    this.experiencePoints = savedProgress.experiencePoints
    this.playerLevel = savedProgress.playerLevel
    this.unlockedBadgeIds = new Set(savedProgress.unlockedBadgeIds)
    this.claimedQuestRewardIds = new Set(
      savedProgress.claimedQuestRewardIds,
    )
    this.unlockedTerritoryIds = new Set(
      savedProgress.unlockedTerritoryIds,
    )
    this.completedTerritoryIds = new Set(
      savedProgress.completedTerritoryIds,
    )
    this.discoveredObjectIds = new Set(savedProgress.discoveredObjectIds)
    this.completedMissionIds = new Set(savedProgress.completedMissionIds)
    this.claimedMissionRewardIds = new Set(
      savedProgress.claimedMissionRewardIds,
    )
    this.completedMilestoneIds = new Set(
      savedProgress.completedMilestoneIds,
    )
    this.claimedMilestoneRewardIds = new Set(
      savedProgress.claimedMilestoneRewardIds,
    )
    this.unlockedJourneyStageIds = new Set(
      savedProgress.unlockedJourneyStageIds,
    )
    this.completedJourneyStageIds = new Set(
      savedProgress.completedJourneyStageIds,
    )
    this.activeJourneyStageId = savedProgress.activeJourneyStageId
    this.journeyStatus = savedProgress.journeyStatus
    this.journeyRecommendationStageId =
      savedProgress.journeyRecommendationStageId
    this.selectedCareerPathId = savedProgress.selectedCareerPathId
    this.completedCareerMilestoneIds = new Set(
      savedProgress.completedCareerMilestoneIds,
    )
    this.questCompletedAt = new Map(
      Object.entries(savedProgress.questCompletedAt) as [QuestId, string][],
    )
    this.territoryCompletedAt = new Map(
      Object.entries(savedProgress.territoryCompletedAt) as [
        TerritoryId,
        string,
      ][],
    )
    this.missionCompletedAt = new Map(
      Object.entries(savedProgress.missionCompletedAt) as [
        MissionId,
        string,
      ][],
    )
    this.milestoneCompletedAt = new Map(
      Object.entries(savedProgress.milestoneCompletedAt) as [
        MilestoneId,
        string,
      ][],
    )
    this.journeyStageCompletedAt = new Map(
      Object.entries(savedProgress.journeyStageCompletedAt) as [
        JourneyStageId,
        string,
      ][],
    )
    this.badgeUnlockedAt = new Map(
      Object.entries(savedProgress.badgeUnlockedAt) as [BadgeId, string][],
    )
    this.careerPathSelectedAt = savedProgress.careerPathSelectedAt
    this.careerMilestoneCompletedAt = new Map(
      Object.entries(savedProgress.careerMilestoneCompletedAt) as [
        CareerMilestoneId,
        string,
      ][],
    )
  }

  getOnboardingStartedAt(): string {
    return this.onboardingStartedAt
  }

  hasVisitedNpc(npcId: NpcId): boolean {
    return this.visitedNpcIds.has(npcId)
  }

  markNpcVisited(npcId: NpcId): boolean {
    if (this.visitedNpcIds.has(npcId)) {
      return false
    }

    this.visitedNpcIds.add(npcId)
    this.save()
    return true
  }

  hasCompletedDialogue(dialogueId: DialogueId): boolean {
    return this.completedDialogueIds.has(dialogueId)
  }

  markDialogueCompleted(dialogueId: DialogueId): boolean {
    if (this.completedDialogueIds.has(dialogueId)) {
      return false
    }

    this.completedDialogueIds.add(dialogueId)
    this.save()
    return true
  }

  hasCompletedQuest(questId: QuestId): boolean {
    return this.completedQuestIds.has(questId)
  }

  markQuestCompleted(questId: QuestId): boolean {
    if (this.completedQuestIds.has(questId)) {
      return false
    }

    this.completedQuestIds.add(questId)
    this.recordTimestamp(this.questCompletedAt, questId)
    this.save()
    return true
  }

  getQuestCompletedAt(questId: QuestId): string | null {
    return this.questCompletedAt.get(questId) ?? null
  }

  getExperiencePoints(): number {
    return this.experiencePoints
  }

  getPlayerLevel(): number {
    return this.playerLevel
  }

  setPlayerProgress(experiencePoints: number, playerLevel: number): void {
    this.experiencePoints = experiencePoints
    this.playerLevel = playerLevel
    this.save()
  }

  hasUnlockedBadge(badgeId: BadgeId): boolean {
    return this.unlockedBadgeIds.has(badgeId)
  }

  unlockBadge(badgeId: BadgeId): boolean {
    if (this.unlockedBadgeIds.has(badgeId)) {
      return false
    }

    this.unlockedBadgeIds.add(badgeId)
    this.recordTimestamp(this.badgeUnlockedAt, badgeId)
    this.save()
    return true
  }

  getBadgeUnlockedAt(badgeId: BadgeId): string | null {
    return this.badgeUnlockedAt.get(badgeId) ?? null
  }

  claimQuestReward(questId: QuestId): boolean {
    if (this.claimedQuestRewardIds.has(questId)) {
      return false
    }

    this.claimedQuestRewardIds.add(questId)
    this.save()
    return true
  }

  hasUnlockedTerritory(territoryId: TerritoryId): boolean {
    return this.unlockedTerritoryIds.has(territoryId)
  }

  unlockTerritory(territoryId: TerritoryId): boolean {
    if (this.unlockedTerritoryIds.has(territoryId)) {
      return false
    }

    this.unlockedTerritoryIds.add(territoryId)
    this.save()
    return true
  }

  hasCompletedTerritory(territoryId: TerritoryId): boolean {
    return this.completedTerritoryIds.has(territoryId)
  }

  completeTerritory(territoryId: TerritoryId): boolean {
    if (this.completedTerritoryIds.has(territoryId)) {
      return false
    }

    this.completedTerritoryIds.add(territoryId)
    this.recordTimestamp(this.territoryCompletedAt, territoryId)
    this.save()
    return true
  }

  getTerritoryCompletedAt(territoryId: TerritoryId): string | null {
    return this.territoryCompletedAt.get(territoryId) ?? null
  }

  hasDiscoveredObject(objectId: DiscoveryObjectId): boolean {
    return this.discoveredObjectIds.has(objectId)
  }

  discoverObject(objectId: DiscoveryObjectId): boolean {
    if (this.discoveredObjectIds.has(objectId)) {
      return false
    }

    this.discoveredObjectIds.add(objectId)
    this.save()
    return true
  }

  hasCompletedMission(missionId: MissionId): boolean {
    return this.completedMissionIds.has(missionId)
  }

  completeMission(missionId: MissionId): boolean {
    if (this.completedMissionIds.has(missionId)) {
      return false
    }

    this.completedMissionIds.add(missionId)
    this.recordTimestamp(this.missionCompletedAt, missionId)
    this.save()
    return true
  }

  getMissionCompletedAt(missionId: MissionId): string | null {
    return this.missionCompletedAt.get(missionId) ?? null
  }

  claimMissionReward(missionId: MissionId): boolean {
    if (this.claimedMissionRewardIds.has(missionId)) {
      return false
    }

    this.claimedMissionRewardIds.add(missionId)
    this.save()
    return true
  }

  hasCompletedMilestone(milestoneId: MilestoneId): boolean {
    return this.completedMilestoneIds.has(milestoneId)
  }

  completeMilestone(milestoneId: MilestoneId): boolean {
    if (this.completedMilestoneIds.has(milestoneId)) {
      return false
    }

    this.completedMilestoneIds.add(milestoneId)
    this.recordTimestamp(this.milestoneCompletedAt, milestoneId)
    this.save()
    return true
  }

  getMilestoneCompletedAt(milestoneId: MilestoneId): string | null {
    return this.milestoneCompletedAt.get(milestoneId) ?? null
  }

  claimMilestoneReward(milestoneId: MilestoneId): boolean {
    if (this.claimedMilestoneRewardIds.has(milestoneId)) {
      return false
    }

    this.claimedMilestoneRewardIds.add(milestoneId)
    this.save()
    return true
  }

  hasUnlockedJourneyStage(stageId: JourneyStageId): boolean {
    return this.unlockedJourneyStageIds.has(stageId)
  }

  unlockJourneyStage(stageId: JourneyStageId): boolean {
    if (this.unlockedJourneyStageIds.has(stageId)) {
      return false
    }

    this.unlockedJourneyStageIds.add(stageId)
    this.save()
    return true
  }

  hasCompletedJourneyStage(stageId: JourneyStageId): boolean {
    return this.completedJourneyStageIds.has(stageId)
  }

  completeJourneyStage(stageId: JourneyStageId): boolean {
    if (this.completedJourneyStageIds.has(stageId)) {
      return false
    }

    this.completedJourneyStageIds.add(stageId)
    this.recordTimestamp(this.journeyStageCompletedAt, stageId)
    this.save()
    return true
  }

  getJourneyStageCompletedAt(stageId: JourneyStageId): string | null {
    return this.journeyStageCompletedAt.get(stageId) ?? null
  }

  setJourneySnapshot(
    activeStageId: JourneyStageId | null,
    status: JourneyStatus,
    recommendationStageId: JourneyStageId | null,
  ): void {
    this.activeJourneyStageId = activeStageId
    this.journeyStatus = status
    this.journeyRecommendationStageId = recommendationStageId
    this.save()
  }

  getSelectedCareerPathId(): CareerPathId | null {
    return this.selectedCareerPathId
  }

  selectCareerPath(pathId: CareerPathId): boolean {
    if (this.selectedCareerPathId === pathId) {
      return false
    }

    this.selectedCareerPathId = pathId

    if (this.careerPathSelectedAt === null) {
      this.careerPathSelectedAt = this.now()
    }

    this.save()
    return true
  }

  getCareerPathSelectedAt(): string | null {
    return this.careerPathSelectedAt
  }

  hasCompletedCareerMilestone(milestoneId: CareerMilestoneId): boolean {
    return this.completedCareerMilestoneIds.has(milestoneId)
  }

  completeCareerMilestone(milestoneId: CareerMilestoneId): boolean {
    if (this.completedCareerMilestoneIds.has(milestoneId)) {
      return false
    }

    this.completedCareerMilestoneIds.add(milestoneId)
    this.recordTimestamp(this.careerMilestoneCompletedAt, milestoneId)
    this.save()
    return true
  }

  getCareerMilestoneCompletedAt(
    milestoneId: CareerMilestoneId,
  ): string | null {
    return this.careerMilestoneCompletedAt.get(milestoneId) ?? null
  }

  reset(): void {
    this.visitedNpcIds.clear()
    this.completedDialogueIds.clear()
    this.completedQuestIds.clear()
    this.experiencePoints = 0
    this.playerLevel = 1
    this.unlockedBadgeIds.clear()
    this.claimedQuestRewardIds.clear()
    this.unlockedTerritoryIds.clear()
    this.completedTerritoryIds.clear()
    this.discoveredObjectIds.clear()
    this.completedMissionIds.clear()
    this.claimedMissionRewardIds.clear()
    this.completedMilestoneIds.clear()
    this.claimedMilestoneRewardIds.clear()
    this.unlockedJourneyStageIds.clear()
    this.completedJourneyStageIds.clear()
    this.activeJourneyStageId = null
    this.journeyStatus = 'inProgress'
    this.journeyRecommendationStageId = null
    this.selectedCareerPathId = null
    this.completedCareerMilestoneIds.clear()
    this.questCompletedAt.clear()
    this.territoryCompletedAt.clear()
    this.missionCompletedAt.clear()
    this.milestoneCompletedAt.clear()
    this.journeyStageCompletedAt.clear()
    this.badgeUnlockedAt.clear()
    this.careerPathSelectedAt = null
    this.careerMilestoneCompletedAt.clear()
    this.onboardingStartedAt = this.now()

    try {
      this.storage.removeItem(STORAGE_KEY)
    } catch {
      // In-memory progress is still reset when storage is unavailable.
    }
  }

  private loadProgress(): SavedProgress {
    const emptyProgress: SavedProgress = {
      version: 1,
      onboardingStartedAt: this.now(),
      visitedNpcIds: [],
      completedDialogueIds: [],
      completedQuestIds: [],
      experiencePoints: 0,
      playerLevel: 1,
      unlockedBadgeIds: [],
      claimedQuestRewardIds: [],
      unlockedTerritoryIds: [],
      completedTerritoryIds: [],
      discoveredObjectIds: [],
      completedMissionIds: [],
      claimedMissionRewardIds: [],
      completedMilestoneIds: [],
      claimedMilestoneRewardIds: [],
      unlockedJourneyStageIds: [],
      completedJourneyStageIds: [],
      activeJourneyStageId: null,
      journeyStatus: 'inProgress',
      journeyRecommendationStageId: null,
      selectedCareerPathId: null,
      completedCareerMilestoneIds: [],
      questCompletedAt: {},
      territoryCompletedAt: {},
      missionCompletedAt: {},
      milestoneCompletedAt: {},
      journeyStageCompletedAt: {},
      badgeUnlockedAt: {},
      careerPathSelectedAt: null,
      careerMilestoneCompletedAt: {},
    }

    try {
      const savedValue = this.storage.getItem(STORAGE_KEY)

      if (!savedValue) {
        return emptyProgress
      }

      const parsedValue: unknown = JSON.parse(savedValue)

      if (typeof parsedValue !== 'object' || parsedValue === null) {
        return emptyProgress
      }

      const candidate = parsedValue as Record<string, unknown>
      const completedDialogueIds = candidate.completedDialogueIds ?? []
      const completedQuestIds = candidate.completedQuestIds ?? []
      const experiencePoints = candidate.experiencePoints ?? 0
      const playerLevel = candidate.playerLevel ?? 1
      const unlockedBadgeIds = candidate.unlockedBadgeIds ?? []
      const claimedQuestRewardIds = candidate.claimedQuestRewardIds ?? []
      const unlockedTerritoryIds = candidate.unlockedTerritoryIds ?? []
      const completedTerritoryIds = candidate.completedTerritoryIds ?? []
      const discoveredObjectIds = candidate.discoveredObjectIds ?? []
      const completedMissionIds = candidate.completedMissionIds ?? []
      const claimedMissionRewardIds = candidate.claimedMissionRewardIds ?? []
      const completedMilestoneIds = candidate.completedMilestoneIds ?? []
      const claimedMilestoneRewardIds =
        candidate.claimedMilestoneRewardIds ?? []
      const unlockedJourneyStageIds =
        candidate.unlockedJourneyStageIds ?? []
      const completedJourneyStageIds =
        candidate.completedJourneyStageIds ?? []
      const activeJourneyStageId = candidate.activeJourneyStageId ?? null
      const journeyStatus = candidate.journeyStatus ?? 'inProgress'
      const journeyRecommendationStageId =
        candidate.journeyRecommendationStageId ?? null
      const selectedCareerPathId = candidate.selectedCareerPathId ?? null
      const completedCareerMilestoneIds =
        candidate.completedCareerMilestoneIds ?? []
      const onboardingStartedAt =
        candidate.onboardingStartedAt ?? emptyProgress.onboardingStartedAt
      const questCompletedAt = candidate.questCompletedAt ?? {}
      const territoryCompletedAt = candidate.territoryCompletedAt ?? {}
      const missionCompletedAt = candidate.missionCompletedAt ?? {}
      const milestoneCompletedAt = candidate.milestoneCompletedAt ?? {}
      const journeyStageCompletedAt =
        candidate.journeyStageCompletedAt ?? {}
      const badgeUnlockedAt = candidate.badgeUnlockedAt ?? {}
      const careerPathSelectedAt = candidate.careerPathSelectedAt ?? null
      const careerMilestoneCompletedAt =
        candidate.careerMilestoneCompletedAt ?? {}

      if (
        candidate.version !== 1 ||
        !Array.isArray(candidate.visitedNpcIds) ||
        !candidate.visitedNpcIds.every(isNpcId) ||
        !Array.isArray(completedDialogueIds) ||
        !completedDialogueIds.every(isDialogueId) ||
        !Array.isArray(completedQuestIds) ||
        !completedQuestIds.every(isQuestId) ||
        typeof experiencePoints !== 'number' ||
        !Number.isInteger(experiencePoints) ||
        experiencePoints < 0 ||
        typeof playerLevel !== 'number' ||
        !Number.isInteger(playerLevel) ||
        playerLevel < 1 ||
        !Array.isArray(unlockedBadgeIds) ||
        !unlockedBadgeIds.every(isBadgeId) ||
        !Array.isArray(claimedQuestRewardIds) ||
        !claimedQuestRewardIds.every(isQuestId) ||
        !Array.isArray(unlockedTerritoryIds) ||
        !unlockedTerritoryIds.every(isTerritoryId) ||
        !Array.isArray(completedTerritoryIds) ||
        !completedTerritoryIds.every(isTerritoryId) ||
        !Array.isArray(discoveredObjectIds) ||
        !discoveredObjectIds.every(isDiscoveryObjectId) ||
        !Array.isArray(completedMissionIds) ||
        !completedMissionIds.every(isMissionId) ||
        !Array.isArray(claimedMissionRewardIds) ||
        !claimedMissionRewardIds.every(isMissionId) ||
        !Array.isArray(completedMilestoneIds) ||
        !completedMilestoneIds.every(isMilestoneId) ||
        !Array.isArray(claimedMilestoneRewardIds) ||
        !claimedMilestoneRewardIds.every(isMilestoneId) ||
        !Array.isArray(unlockedJourneyStageIds) ||
        !unlockedJourneyStageIds.every(isJourneyStageId) ||
        !Array.isArray(completedJourneyStageIds) ||
        !completedJourneyStageIds.every(isJourneyStageId) ||
        (activeJourneyStageId !== null &&
          !isJourneyStageId(activeJourneyStageId)) ||
        !isJourneyStatus(journeyStatus) ||
        (journeyRecommendationStageId !== null &&
          !isJourneyStageId(journeyRecommendationStageId)) ||
        (selectedCareerPathId !== null &&
          !isCareerPathId(selectedCareerPathId)) ||
        !Array.isArray(completedCareerMilestoneIds) ||
        !completedCareerMilestoneIds.every(isCareerMilestoneId) ||
        !isTimestamp(onboardingStartedAt) ||
        !isTimestampRecord(questCompletedAt, isQuestId) ||
        !isTimestampRecord(territoryCompletedAt, isTerritoryId) ||
        !isTimestampRecord(missionCompletedAt, isMissionId) ||
        !isTimestampRecord(milestoneCompletedAt, isMilestoneId) ||
        !isTimestampRecord(journeyStageCompletedAt, isJourneyStageId) ||
        !isTimestampRecord(badgeUnlockedAt, isBadgeId) ||
        (careerPathSelectedAt !== null &&
          !isTimestamp(careerPathSelectedAt)) ||
        !isTimestampRecord(
          careerMilestoneCompletedAt,
          isCareerMilestoneId,
        )
      ) {
        return emptyProgress
      }

      return {
        version: 1,
        onboardingStartedAt,
        visitedNpcIds: candidate.visitedNpcIds,
        completedDialogueIds,
        completedQuestIds,
        experiencePoints,
        playerLevel,
        unlockedBadgeIds,
        claimedQuestRewardIds,
        unlockedTerritoryIds,
        completedTerritoryIds,
        discoveredObjectIds,
        completedMissionIds,
        claimedMissionRewardIds,
        completedMilestoneIds,
        claimedMilestoneRewardIds,
        unlockedJourneyStageIds,
        completedJourneyStageIds,
        activeJourneyStageId,
        journeyStatus,
        journeyRecommendationStageId,
        selectedCareerPathId,
        completedCareerMilestoneIds,
        questCompletedAt,
        territoryCompletedAt,
        missionCompletedAt,
        milestoneCompletedAt,
        journeyStageCompletedAt,
        badgeUnlockedAt,
        careerPathSelectedAt,
        careerMilestoneCompletedAt,
      }
    } catch {
      return emptyProgress
    }
  }

  private save(): void {
    const progress: SavedProgress = {
      version: 1,
      onboardingStartedAt: this.onboardingStartedAt,
      visitedNpcIds: [...this.visitedNpcIds],
      completedDialogueIds: [...this.completedDialogueIds],
      completedQuestIds: [...this.completedQuestIds],
      experiencePoints: this.experiencePoints,
      playerLevel: this.playerLevel,
      unlockedBadgeIds: [...this.unlockedBadgeIds],
      claimedQuestRewardIds: [...this.claimedQuestRewardIds],
      unlockedTerritoryIds: [...this.unlockedTerritoryIds],
      completedTerritoryIds: [...this.completedTerritoryIds],
      discoveredObjectIds: [...this.discoveredObjectIds],
      completedMissionIds: [...this.completedMissionIds],
      claimedMissionRewardIds: [...this.claimedMissionRewardIds],
      completedMilestoneIds: [...this.completedMilestoneIds],
      claimedMilestoneRewardIds: [...this.claimedMilestoneRewardIds],
      unlockedJourneyStageIds: [...this.unlockedJourneyStageIds],
      completedJourneyStageIds: [...this.completedJourneyStageIds],
      activeJourneyStageId: this.activeJourneyStageId,
      journeyStatus: this.journeyStatus,
      journeyRecommendationStageId: this.journeyRecommendationStageId,
      selectedCareerPathId: this.selectedCareerPathId,
      completedCareerMilestoneIds: [...this.completedCareerMilestoneIds],
      questCompletedAt: Object.fromEntries(this.questCompletedAt),
      territoryCompletedAt: Object.fromEntries(this.territoryCompletedAt),
      missionCompletedAt: Object.fromEntries(this.missionCompletedAt),
      milestoneCompletedAt: Object.fromEntries(this.milestoneCompletedAt),
      journeyStageCompletedAt: Object.fromEntries(
        this.journeyStageCompletedAt,
      ),
      badgeUnlockedAt: Object.fromEntries(this.badgeUnlockedAt),
      careerPathSelectedAt: this.careerPathSelectedAt,
      careerMilestoneCompletedAt: Object.fromEntries(
        this.careerMilestoneCompletedAt,
      ),
    }

    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
      // Progress remains available for this session if storage is unavailable.
    }
  }

  private recordTimestamp<Id extends string>(
    timestamps: Map<Id, string>,
    id: Id,
  ): void {
    if (!timestamps.has(id)) {
      timestamps.set(id, this.now())
    }
  }
}
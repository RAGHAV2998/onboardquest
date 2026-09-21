import { describe, expect, it } from 'vitest'
import { contentRegistry } from '../../content/ContentRegistry'
import { CareerPathManager } from './CareerPathManager'
import { InsightsManager } from './InsightsManager'
import { JourneyManager } from './JourneyManager'
import { ProgressStore } from './ProgressStore'
import { TerritoryManager } from './TerritoryManager'

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()

  get length(): number {
    return this.values.size
  }

  clear(): void {
    this.values.clear()
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null
  }

  removeItem(key: string): void {
    this.values.delete(key)
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }
}

function createInsightsManager(
  progressStore: ProgressStore,
  now: () => string,
): InsightsManager {
  const territoryManager = new TerritoryManager(
    contentRegistry.territories,
    contentRegistry.documentationObjects,
    progressStore.getPlayerLevel(),
    progressStore,
    {
      onTerritoriesChanged: () => undefined,
      onTerritoryProgressChanged: () => undefined,
    },
  )
  const careerPathManager = new CareerPathManager(
    contentRegistry.careerPaths,
    progressStore,
    { onCareerStateChanged: () => undefined },
  )
  const journeyManager = new JourneyManager(
    contentRegistry.journeyStages,
    progressStore,
    { onJourneyChanged: () => undefined },
  )

  return new InsightsManager(
    contentRegistry,
    progressStore,
    journeyManager,
    careerPathManager,
    territoryManager,
    now,
  )
}

describe('InsightsManager', () => {
  it('creates a Day 1 local employee and manager snapshot', () => {
    const startedAt = '2026-09-21T08:00:00.000Z'
    const progress = new ProgressStore(new MemoryStorage(), () => startedAt)
    const insights = createInsightsManager(progress, () => startedAt)
    const snapshot = insights.getSnapshot()

    expect(snapshot.completion).toEqual({
      stages: { completed: 0, total: 5, percentage: 0 },
      territories: { completed: 0, total: 5, percentage: 0 },
      quests: { completed: 0, total: 2, percentage: 0 },
      missions: { completed: 0, total: 5, percentage: 0 },
    })
    expect(snapshot.progress).toEqual({
      careerPath: null,
      currentMilestone: null,
      level: 1,
      totalXp: 0,
      badgeCount: 0,
    })
    expect(snapshot.managerSummary.employees).toBe(1)
    expect(snapshot.timeline[0].status).toBe('current')
    expect(snapshot.durations.every(({ displayValue }) =>
      displayValue === 'In progress',
    )).toBe(true)
  })

  it('derives completed metrics, analytics, timeline, and export data', () => {
    const storage = new MemoryStorage()
    let currentTime = '2026-09-21T08:00:00.000Z'
    const progress = new ProgressStore(storage, () => currentTime)

    currentTime = '2026-09-21T08:10:00.000Z'
    progress.markDialogueCompleted('mentor-welcome')
    currentTime = '2026-09-21T08:20:00.000Z'
    progress.markQuestCompleted('meet-your-team')
    currentTime = '2026-09-21T08:25:00.000Z'
    progress.completeJourneyStage('meet-your-team')
    currentTime = '2026-09-21T08:30:00.000Z'
    progress.completeTerritory('team')
    currentTime = '2026-09-21T08:40:00.000Z'
    progress.markQuestCompleted('xstore-explorer')
    progress.completeTerritory('documentation')
    progress.completeJourneyStage('learn-the-territory')

    for (const mission of contentRegistry.missions) {
      progress.completeMission(mission.missionId)
    }

    currentTime = '2026-09-21T09:30:00.000Z'
    progress.completeMilestone('first-week-complete')
    progress.completeJourneyStage('first-week-missions')
    currentTime = '2026-09-21T09:35:00.000Z'

    for (const badge of contentRegistry.badges) {
      progress.unlockBadge(badge.badgeId)
    }

    currentTime = '2026-09-21T09:45:00.000Z'
    progress.selectCareerPath('data-ai')
    progress.setPlayerProgress(375, 3)

    const insights = createInsightsManager(
      progress,
      () => '2026-09-21T10:00:00.000Z',
    )
    const snapshot = insights.getSnapshot()

    expect(snapshot.completion).toEqual({
      stages: { completed: 3, total: 5, percentage: 60 },
      territories: { completed: 2, total: 5, percentage: 40 },
      quests: { completed: 2, total: 2, percentage: 100 },
      missions: { completed: 5, total: 5, percentage: 100 },
    })
    expect(snapshot.progress).toEqual({
      careerPath: 'Data & AI',
      currentMilestone: 'Explore Telemetry',
      level: 3,
      totalXp: 375,
      badgeCount: 3,
    })
    expect(snapshot.managerSummary).toEqual({
      employees: 1,
      stageCompletion: 60,
      missionCompletion: 100,
      questCompletion: 100,
      territoryCompletion: 40,
      topRecommendation: 'Complete Explore Telemetry.',
    })
    expect(snapshot.durations.map(({ displayValue }) => displayValue)).toEqual([
      '20 min',
      '25 min',
      '30 min',
      '1 hr 30 min',
    ])
    expect(snapshot.timeline.map(({ status }) => status)).toEqual([
      'completed',
      'completed',
      'completed',
      'completed',
      'current',
    ])
    expect(snapshot.achievements.every(({ unlockedAt }) => unlockedAt)).toBe(
      true,
    )

    const exported = insights.createProgressSummary()

    expect(exported.version).toBe(1)
    expect(exported.playerProfile).toMatchObject({
      profileType: 'local-demo-player',
      level: 3,
      totalXp: 375,
    })
    expect(exported.levels).toHaveLength(4)
    expect(exported.territories).toHaveLength(6)
    expect(exported.missions).toHaveLength(5)
    expect(exported.careerProgress).toMatchObject({
      selectedPathId: 'data-ai',
      title: 'Data & AI',
      currentMilestone: 'Explore Telemetry',
    })
  })

  it('labels completed legacy progress without timestamps accurately', () => {
    const storage = new MemoryStorage()
    const initial = new ProgressStore(
      storage,
      () => '2026-09-21T08:00:00.000Z',
    )

    initial.markQuestCompleted('meet-your-team')
    const saved = JSON.parse(
      storage.getItem('onboardquest.progress.v1') ?? '{}',
    ) as Record<string, unknown>
    saved.questCompletedAt = {}
    storage.setItem('onboardquest.progress.v1', JSON.stringify(saved))

    const restored = new ProgressStore(
      storage,
      () => '2026-09-22T08:00:00.000Z',
    )
    const snapshot = createInsightsManager(
      restored,
      () => '2026-09-22T08:00:00.000Z',
    ).getSnapshot()

    expect(snapshot.durations[0].displayValue).toBe(
      'Timestamp unavailable',
    )
  })
})
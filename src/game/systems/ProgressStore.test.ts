import { describe, expect, it } from 'vitest'
import { ProgressStore } from './ProgressStore'

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

describe('ProgressStore analytics timestamps', () => {
  it('records first completion times and preserves them across reloads', () => {
    const storage = new MemoryStorage()
    let currentTime = '2026-09-21T08:00:00.000Z'
    const progress = new ProgressStore(storage, () => currentTime)

    expect(progress.getOnboardingStartedAt()).toBe(currentTime)

    currentTime = '2026-09-21T08:05:00.000Z'
    expect(progress.markQuestCompleted('meet-your-team')).toBe(true)
    expect(progress.getQuestCompletedAt('meet-your-team')).toBe(currentTime)

    currentTime = '2026-09-21T08:10:00.000Z'
    expect(progress.markQuestCompleted('meet-your-team')).toBe(false)
    expect(progress.getQuestCompletedAt('meet-your-team')).toBe(
      '2026-09-21T08:05:00.000Z',
    )

    currentTime = '2026-09-21T08:15:00.000Z'
    expect(progress.unlockBadge('team-explorer')).toBe(true)

    const restored = new ProgressStore(storage, () =>
      '2026-09-22T08:00:00.000Z',
    )

    expect(restored.getOnboardingStartedAt()).toBe(
      '2026-09-21T08:00:00.000Z',
    )
    expect(restored.getQuestCompletedAt('meet-your-team')).toBe(
      '2026-09-21T08:05:00.000Z',
    )
    expect(restored.getBadgeUnlockedAt('team-explorer')).toBe(
      '2026-09-21T08:15:00.000Z',
    )
  })

  it('removes progress without clearing unrelated local storage', () => {
    const storage = new MemoryStorage()
    storage.setItem('unrelated.preference', 'keep-me')
    const progress = new ProgressStore(
      storage,
      () => '2026-09-21T08:00:00.000Z',
    )

    progress.completeMission('access-kusto')
    expect(storage.getItem('onboardquest.progress.v1')).not.toBeNull()

    progress.reset()

    expect(storage.getItem('onboardquest.progress.v1')).toBeNull()
    expect(storage.getItem('unrelated.preference')).toBe('keep-me')
  })
})
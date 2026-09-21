import { describe, expect, it } from 'vitest'
import { contentRegistry } from '../../content/ContentRegistry'
import { GameState } from './GameState'

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

describe('GameState mission progression', () => {
  it('unlocks Mentor Tower after every first-week mission', () => {
    const gameState = new GameState(new MemoryStorage())

    for (const mission of contentRegistry.missions) {
      expect(gameState.requestMissionCompletion(mission.missionId)).toBe(true)
    }

    expect(gameState.progressStore.getExperiencePoints()).toBe(375)
    expect(gameState.progressStore.getPlayerLevel()).toBe(3)
    expect(
      gameState.progressStore.hasCompletedMilestone('first-week-complete'),
    ).toBe(true)
    expect(gameState.territoryManager.isUnlocked('mentor-tower')).toBe(true)

    expect(gameState.requestMissionCompletion('access-kusto')).toBe(false)
    expect(gameState.progressStore.getExperiencePoints()).toBe(375)
  })
})
import { describe, expect, it } from 'vitest'
import { ProfileStore } from './ProfileStore'

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

describe('ProfileStore', () => {
  it('normalizes, stores, and reloads a local onboarding profile', () => {
    const storage = new MemoryStorage()
    const store = new ProfileStore(
      storage,
      () => '2026-09-21T12:00:00.000Z',
    )
    const result = store.save({
      displayName: '  Raghav  ',
      role: '  Engineer  ',
      team: '  Storage  ',
      startDate: '2026-09-01',
    })

    expect(result).toEqual({
      ok: true,
      profile: {
        displayName: 'Raghav',
        role: 'Engineer',
        team: 'Storage',
        startDate: '2026-09-01',
        updatedAt: '2026-09-21T12:00:00.000Z',
      },
      errors: {},
    })
    expect(store.getProfile()).toEqual(result.profile)
  })

  it('rejects invalid fields without replacing the saved profile', () => {
    const storage = new MemoryStorage()
    const store = new ProfileStore(
      storage,
      () => '2026-09-21T12:00:00.000Z',
    )
    const valid = store.save({
      displayName: 'Raghav',
      role: '',
      team: '',
      startDate: '',
    })
    const invalid = store.save({
      displayName: ' ',
      role: 'Engineer',
      team: 'Storage',
      startDate: '2026-09-22',
    })

    expect(invalid).toEqual({
      ok: false,
      profile: null,
      errors: {
        displayName: 'Display name is required.',
        startDate: 'Start date cannot be in the future.',
      },
    })
    expect(store.getProfile()).toEqual(valid.profile)
  })

  it('rejects malformed saved data safely', () => {
    const storage = new MemoryStorage()
    storage.setItem(
      'onboardquest.profile.v1',
      JSON.stringify({ version: 1, displayName: 42 }),
    )

    expect(new ProfileStore(storage).getProfile()).toBeNull()
  })
})
import type {
  ExperienceAward,
  LevelDefinition,
  PlayerProgress,
} from '../../types/progression'
import { ProgressStore } from './ProgressStore'

type ExperienceManagerCallbacks = {
  readonly onProgressChanged: (progress: PlayerProgress) => void
}

export class ExperienceManager {
  private readonly levels: readonly LevelDefinition[]

  constructor(
    levels: readonly LevelDefinition[],
    private readonly progressStore: ProgressStore,
    private readonly callbacks: ExperienceManagerCallbacks,
  ) {
    this.levels = [...levels].sort(
      (first, second) => first.minimumXp - second.minimumXp,
    )
    this.validateLevels()

    const totalXp = this.progressStore.getExperiencePoints()
    const level = this.getLevelForXp(totalXp)

    if (level !== this.progressStore.getPlayerLevel()) {
      this.progressStore.setPlayerProgress(totalXp, level)
    }

    this.callbacks.onProgressChanged(this.createProgress(totalXp))
  }

  awardXp(amount: number): ExperienceAward {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error('XP awards must be positive whole numbers.')
    }

    const previousXp = this.progressStore.getExperiencePoints()
    const previousLevel = this.getLevelForXp(previousXp)
    const totalXp = previousXp + amount
    const level = this.getLevelForXp(totalXp)
    const progress = this.createProgress(totalXp)

    this.progressStore.setPlayerProgress(totalXp, level)
    this.callbacks.onProgressChanged(progress)

    return {
      amount,
      previousLevel,
      progress,
      leveledUp: level > previousLevel,
    }
  }

  private createProgress(totalXp: number): PlayerProgress {
    const level = this.getLevelForXp(totalXp)
    const nextLevel = this.levels.find(
      ({ minimumXp }) => minimumXp > totalXp,
    )

    return {
      level,
      totalXp,
      nextLevelXp: nextLevel?.minimumXp ?? null,
    }
  }

  private getLevelForXp(totalXp: number): number {
    let currentLevel = this.levels[0].level

    for (const level of this.levels) {
      if (totalXp < level.minimumXp) {
        break
      }

      currentLevel = level.level
    }

    return currentLevel
  }

  private validateLevels(): void {
    if (
      this.levels.length === 0 ||
      this.levels[0].level !== 1 ||
      this.levels[0].minimumXp !== 0
    ) {
      throw new Error('Level definitions must start at Level 1 with 0 XP.')
    }

    const levelNumbers = new Set<number>()
    const thresholds = new Set<number>()

    for (const level of this.levels) {
      if (
        !Number.isInteger(level.level) ||
        level.level < 1 ||
        !Number.isInteger(level.minimumXp) ||
        level.minimumXp < 0 ||
        levelNumbers.has(level.level) ||
        thresholds.has(level.minimumXp)
      ) {
        throw new Error('Level definitions must be unique positive integers.')
      }

      levelNumbers.add(level.level)
      thresholds.add(level.minimumXp)
    }
  }
}
export type LevelDefinition = {
  readonly level: number
  readonly minimumXp: number
}

export type PlayerProgress = {
  readonly level: number
  readonly totalXp: number
  readonly nextLevelXp: number | null
}

export type ExperienceAward = {
  readonly amount: number
  readonly previousLevel: number
  readonly progress: PlayerProgress
  readonly leveledUp: boolean
}

export type AchievementNotification = {
  readonly kind:
    | 'questComplete'
    | 'missionComplete'
    | 'milestoneComplete'
    | 'badgeUnlocked'
  readonly title: string
  readonly message: string
}
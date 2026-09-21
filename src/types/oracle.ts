export type OracleMessageRole = 'player' | 'oracle'

export type OracleMessage = {
  readonly messageId: number
  readonly role: OracleMessageRole
  readonly text: string
}

export type OracleCareerContext = {
  readonly title: string
  readonly description: string
  readonly milestoneTitles: readonly string[]
}

export type OracleContext = {
  readonly level: number
  readonly currentStage: string
  readonly currentTerritory: string
  readonly completedQuestTitles: readonly string[]
  readonly completedTerritoryTitles: readonly string[]
  readonly completedMissionTitles: readonly string[]
  readonly remainingMissionTitles: readonly string[]
  readonly currentCareerPath: OracleCareerContext | null
  readonly currentMilestone: string | null
  readonly currentRecommendation: string
  readonly completedOnboardingGoals: number
  readonly totalOnboardingGoals: number
}

export type OracleProviderRequest = {
  readonly question: string
  readonly context: OracleContext
  readonly systemPrompt: string
  readonly history: readonly OracleMessage[]
}

export type OracleProviderResponse = {
  readonly text: string
}

export type OracleState = {
  readonly isOpen: boolean
  readonly isResponding: boolean
  readonly providerName: string
  readonly context: OracleContext | null
  readonly history: readonly OracleMessage[]
  readonly suggestedQuestions: readonly string[]
  readonly error: string | null
}
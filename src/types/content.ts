import type { BadgeDefinition } from './badge'
import type { CareerPath } from './career'
import type { DialogueEntry, DialogueId } from './dialogue'
import type { JourneyStage } from './journey'
import type {
  MilestoneDefinition,
  MissionDefinition,
} from './mission'
import type { MentorProfile, NpcDefinition, NpcId } from './npc'
import type { LevelDefinition } from './progression'
import type { QuestDefinition } from './quest'
import type {
  DiscoveryObjectDefinition,
  TerritoryDefinition,
} from './territory'

export const contentCategories = [
  'npcs',
  'dialogues',
  'quests',
  'territories',
  'missions',
  'careerPaths',
] as const

export type ContentCategory = (typeof contentCategories)[number]

export type ContentRegistryData = {
  readonly npcs: readonly NpcDefinition[]
  readonly mentorProfile: MentorProfile
  readonly dialogues: readonly DialogueEntry[]
  readonly startingDialogueIds: Partial<Record<NpcId, DialogueId>>
  readonly quests: readonly QuestDefinition[]
  readonly territories: readonly TerritoryDefinition[]
  readonly documentationObjects: readonly DiscoveryObjectDefinition[]
  readonly missions: readonly MissionDefinition[]
  readonly firstWeekMilestone: MilestoneDefinition
  readonly careerPaths: readonly CareerPath[]
  readonly badges: readonly BadgeDefinition[]
  readonly journeyStages: readonly JourneyStage[]
  readonly levelDefinitions: readonly LevelDefinition[]
}

export type ContentSourceMetadata = {
  readonly sourceTitle?: string
  readonly sourceUrl?: string
  readonly lastReviewed?: string
  readonly approvedForDemo?: boolean
}

export type ContentReference = {
  readonly category: ContentCategory
  readonly id: string
}

export type ContentDependency = {
  readonly from: ContentReference
  readonly to: ContentReference
  readonly relationship: string
}

export type ContentValidationSeverity = 'error' | 'warning'

export type ContentValidationIssue = {
  readonly severity: ContentValidationSeverity
  readonly code: string
  readonly message: string
  readonly reference?: ContentReference
  readonly field?: string
}

export type ContentValidationReport = {
  readonly isValid: boolean
  readonly issues: readonly ContentValidationIssue[]
  readonly errorCount: number
  readonly warningCount: number
}

export type ContentPreview = {
  readonly reference: ContentReference
  readonly title: string
  readonly summary: string
  readonly source?: ContentSourceMetadata
  readonly value: unknown
}

export type ContentSourceCatalog = Readonly<
  Partial<Record<`${ContentCategory}:${string}`, ContentSourceMetadata>>
>
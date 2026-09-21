import { badges } from '../data/badges'
import { careerPaths } from '../data/careerPaths'
import { dialogues, startingDialogueIds } from '../data/dialogues'
import { documentationObjects } from '../data/documentationObjects'
import { journeyStages } from '../data/journeyStages'
import { mentorNpc, mentorProfile } from '../data/mentorProfile'
import { firstWeekMilestone, missions } from '../data/missions'
import { levelDefinitions } from '../data/progression'
import { quests } from '../data/quests'
import { teamMembers } from '../data/teamMembers'
import { territories } from '../data/territories'
import type { CareerPath, CareerPathId } from '../types/career'
import type {
  ContentCategory,
  ContentDependency,
  ContentPreview,
  ContentReference,
  ContentRegistryData,
  ContentSourceCatalog,
  ContentValidationReport,
} from '../types/content'
import { contentCategories } from '../types/content'
import type { DialogueEntry, DialogueId } from '../types/dialogue'
import type { JourneyStage } from '../types/journey'
import type {
  MilestoneDefinition,
  MissionDefinition,
  MissionId,
} from '../types/mission'
import type {
  MentorProfile,
  NpcDefinition,
  NpcId,
} from '../types/npc'
import type { LevelDefinition } from '../types/progression'
import type { QuestDefinition, QuestId } from '../types/quest'
import type {
  DiscoveryObjectDefinition,
  TerritoryDefinition,
  TerritoryId,
} from '../types/territory'
import { ValidationLayer } from './ValidationLayer'

function referenceKey(reference: ContentReference): string {
  return `${reference.category}:${reference.id}`
}

export class ContentRegistry {
  readonly validationReport: ContentValidationReport

  private readonly previews: ReadonlyMap<string, ContentPreview>
  private readonly dependencies: readonly ContentDependency[]

  constructor(
    private readonly content: ContentRegistryData,
    private readonly sources: ContentSourceCatalog = {},
    validationLayer: ValidationLayer = new ValidationLayer(),
  ) {
    this.validationReport = validationLayer.validate(content)
    this.previews = this.createPreviews()
    this.dependencies = this.createDependencies()
  }

  get npcs(): readonly NpcDefinition[] {
    return this.content.npcs
  }

  get mentorProfile(): MentorProfile {
    return this.content.mentorProfile
  }

  get dialogues(): readonly DialogueEntry[] {
    return this.content.dialogues
  }

  get startingDialogueIds(): ContentRegistryData['startingDialogueIds'] {
    return this.content.startingDialogueIds
  }

  get quests(): readonly QuestDefinition[] {
    return this.content.quests
  }

  get territories(): readonly TerritoryDefinition[] {
    return this.content.territories
  }

  get documentationObjects(): readonly DiscoveryObjectDefinition[] {
    return this.content.documentationObjects
  }

  get missions(): readonly MissionDefinition[] {
    return this.content.missions
  }

  get firstWeekMilestone(): MilestoneDefinition {
    return this.content.firstWeekMilestone
  }

  get careerPaths(): readonly CareerPath[] {
    return this.content.careerPaths
  }

  get badges(): ContentRegistryData['badges'] {
    return this.content.badges
  }

  get journeyStages(): readonly JourneyStage[] {
    return this.content.journeyStages
  }

  get levelDefinitions(): readonly LevelDefinition[] {
    return this.content.levelDefinitions
  }

  getNpc(id: NpcId): NpcDefinition | undefined {
    return this.content.npcs.find((npc) => npc.id === id)
  }

  getDialogue(id: DialogueId): DialogueEntry | undefined {
    return this.content.dialogues.find(
      (dialogue) => dialogue.dialogueId === id,
    )
  }

  getQuest(id: QuestId): QuestDefinition | undefined {
    return this.content.quests.find((quest) => quest.questId === id)
  }

  getTerritory(id: TerritoryId): TerritoryDefinition | undefined {
    return this.content.territories.find(
      (territory) => territory.territoryId === id,
    )
  }

  getMission(id: MissionId): MissionDefinition | undefined {
    return this.content.missions.find(
      (mission) => mission.missionId === id,
    )
  }

  getCareerPath(id: CareerPathId): CareerPath | undefined {
    return this.content.careerPaths.find((path) => path.pathId === id)
  }

  getPreviews(category?: ContentCategory): readonly ContentPreview[] {
    const previews = [...this.previews.values()]

    return category
      ? previews.filter(
          ({ reference }) => reference.category === category,
        )
      : previews
  }

  getPreview(reference: ContentReference): ContentPreview | undefined {
    return this.previews.get(referenceKey(reference))
  }

  getDependencies(
    reference?: ContentReference,
  ): readonly ContentDependency[] {
    if (!reference) {
      return this.dependencies
    }

    const key = referenceKey(reference)
    return this.dependencies.filter(
      ({ from, to }) =>
        referenceKey(from) === key || referenceKey(to) === key,
    )
  }

  private createPreviews(): ReadonlyMap<string, ContentPreview> {
    const previews: ContentPreview[] = [
      ...this.content.npcs.map((npc) =>
        this.createPreview(
          'npcs',
          npc.id,
          npc.name,
          `Interactive character in ${npc.mapId}.`,
          npc,
        ),
      ),
      ...this.content.dialogues.map((dialogue) =>
        this.createPreview(
          'dialogues',
          dialogue.dialogueId,
          `${dialogue.npcName} dialogue`,
          dialogue.text,
          dialogue,
        ),
      ),
      ...this.content.quests.map((quest) =>
        this.createPreview(
          'quests',
          quest.questId,
          quest.title,
          quest.description,
          quest,
        ),
      ),
      ...this.content.territories.map((territory) =>
        this.createPreview(
          'territories',
          territory.territoryId,
          territory.title,
          territory.description,
          territory,
        ),
      ),
      ...this.content.missions.map((mission) =>
        this.createPreview(
          'missions',
          mission.missionId,
          mission.title,
          mission.description,
          mission,
        ),
      ),
      ...this.content.careerPaths.map((path) =>
        this.createPreview(
          'careerPaths',
          path.pathId,
          path.title,
          path.description,
          path,
        ),
      ),
    ]

    const byKey = new Map<string, ContentPreview>()

    for (const preview of previews) {
      const key = referenceKey(preview.reference)

      if (!byKey.has(key)) {
        byKey.set(key, preview)
      }
    }

    return byKey
  }

  private createPreview(
    category: ContentCategory,
    id: string,
    title: string,
    summary: string,
    value: unknown,
  ): ContentPreview {
    const reference = { category, id } as const
    const source = this.sources[
      referenceKey(reference) as `${ContentCategory}:${string}`
    ]

    return {
      reference,
      title,
      summary,
      source,
      value,
    }
  }

  private createDependencies(): readonly ContentDependency[] {
    const dependencies: ContentDependency[] = []

    for (const [npcId, dialogueId] of Object.entries(
      this.content.startingDialogueIds,
    )) {
      if (dialogueId) {
        dependencies.push({
          from: { category: 'npcs', id: npcId },
          to: { category: 'dialogues', id: dialogueId },
          relationship: 'starts with',
        })
      }
    }

    for (const dialogue of this.content.dialogues) {
      if (dialogue.nextDialogueId) {
        dependencies.push({
          from: { category: 'dialogues', id: dialogue.dialogueId },
          to: {
            category: 'dialogues',
            id: dialogue.nextDialogueId,
          },
          relationship: 'continues to',
        })
      }
    }

    for (const quest of this.content.quests) {
      for (const objective of quest.objectives) {
        if (objective.completionRule.type === 'completeDialogue') {
          dependencies.push({
            from: { category: 'quests', id: quest.questId },
            to: {
              category: 'dialogues',
              id: objective.completionRule.dialogueId,
            },
            relationship: 'completed by',
          })
        }
      }
    }

    for (const territory of this.content.territories) {
      for (const questId of territory.quests) {
        dependencies.push({
          from: {
            category: 'territories',
            id: territory.territoryId,
          },
          to: { category: 'quests', id: questId },
          relationship: 'contains',
        })
      }
    }

    for (const path of this.content.careerPaths) {
      dependencies.push({
        from: { category: 'careerPaths', id: path.pathId },
        to: {
          category: 'dialogues',
          id: path.unlockRule.dialogueId,
        },
        relationship: 'unlocked by',
      })
    }

    return dependencies
  }
}

const localContent: ContentRegistryData = {
  npcs: [...teamMembers, mentorNpc],
  mentorProfile,
  dialogues,
  startingDialogueIds,
  quests,
  territories,
  documentationObjects,
  missions,
  firstWeekMilestone,
  careerPaths,
  badges,
  journeyStages,
  levelDefinitions,
}

export const contentRegistry = new ContentRegistry(localContent)

export { contentCategories }
import { describe, expect, it } from 'vitest'
import type {
  ContentRegistryData,
  ContentSourceCatalog,
} from '../types/content'
import type { DialogueEntry } from '../types/dialogue'
import type { QuestDefinition } from '../types/quest'
import {
  ContentRegistry,
  contentCategories,
  contentRegistry,
} from './ContentRegistry'

function createRegistryData(
  overrides: Partial<ContentRegistryData> = {},
): ContentRegistryData {
  return {
    npcs: contentRegistry.npcs,
    mentorProfile: contentRegistry.mentorProfile,
    dialogues: contentRegistry.dialogues,
    startingDialogueIds: contentRegistry.startingDialogueIds,
    quests: contentRegistry.quests,
    territories: contentRegistry.territories,
    documentationObjects: contentRegistry.documentationObjects,
    missions: contentRegistry.missions,
    firstWeekMilestone: contentRegistry.firstWeekMilestone,
    careerPaths: contentRegistry.careerPaths,
    badges: contentRegistry.badges,
    journeyStages: contentRegistry.journeyStages,
    levelDefinitions: contentRegistry.levelDefinitions,
    ...overrides,
  }
}

describe('ContentRegistry', () => {
  it('loads every Studio category with a clean validation report', () => {
    const categoryCounts = Object.fromEntries(
      contentCategories.map((category) => [
        category,
        contentRegistry.getPreviews(category).length,
      ]),
    )

    expect(categoryCounts).toEqual({
      npcs: 5,
      dialogues: 13,
      quests: 2,
      territories: 6,
      missions: 5,
      careerPaths: 4,
    })
    expect(contentRegistry.validationReport).toEqual({
      isValid: true,
      issues: [],
      errorCount: 0,
      warningCount: 0,
    })
  })

  it('provides typed lookups and cross-category dependencies', () => {
    expect(contentRegistry.getNpc('buddy')?.name).toBe('Buddy')
    expect(contentRegistry.getQuest('meet-your-team')?.rewardXp).toBe(50)
    expect(
      contentRegistry.getDependencies({ category: 'npcs', id: 'buddy' }),
    ).toContainEqual({
      from: { category: 'npcs', id: 'buddy' },
      to: { category: 'dialogues', id: 'buddy-welcome' },
      relationship: 'starts with',
    })
    expect(
      contentRegistry.getDependencies({
        category: 'territories',
        id: 'documentation',
      }),
    ).toContainEqual({
      from: { category: 'territories', id: 'documentation' },
      to: { category: 'quests', id: 'xstore-explorer' },
      relationship: 'contains',
    })
  })

  it('attaches optional source metadata without changing domain content', () => {
    const sources: ContentSourceCatalog = {
      'quests:meet-your-team': {
        sourceTitle: 'Approved onboarding source',
        sourceUrl: 'https://example.test/onboarding',
        lastReviewed: '2026-01-15',
        approvedForDemo: true,
      },
    }
    const registry = new ContentRegistry(createRegistryData(), sources)

    expect(
      registry.getPreview({
        category: 'quests',
        id: 'meet-your-team',
      })?.source,
    ).toEqual(sources['quests:meet-your-team'])
    expect(registry.getQuest('meet-your-team')).toBe(
      contentRegistry.getQuest('meet-your-team'),
    )
  })

  it('reports duplicate IDs and broken content references', () => {
    const firstDialogue = contentRegistry.dialogues[0]
    const brokenDialogue: DialogueEntry = {
      ...firstDialogue,
      nextDialogueId: 'missing-dialogue',
    }
    const firstQuest = contentRegistry.quests[0]
    const brokenQuest: QuestDefinition = {
      ...firstQuest,
      objectives: [
        {
          ...firstQuest.objectives[0],
          completionRule: {
            type: 'completeDialogue',
            dialogueId: 'missing-dialogue',
          },
        },
        ...firstQuest.objectives.slice(1),
      ],
    }
    const registry = new ContentRegistry(
      createRegistryData({
        dialogues: [
          brokenDialogue,
          ...contentRegistry.dialogues.slice(1),
          contentRegistry.dialogues[1],
        ],
        quests: [brokenQuest, ...contentRegistry.quests.slice(1)],
      }),
    )
    const issueCodes = registry.validationReport.issues.map(
      ({ code }) => code,
    )

    expect(registry.validationReport.isValid).toBe(false)
    expect(issueCodes).toContain('duplicate-id')
    expect(issueCodes).toContain('unknown-next-dialogue')
    expect(issueCodes).toContain('unknown-objective-target')
  })
})
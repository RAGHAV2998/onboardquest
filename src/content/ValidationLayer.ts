import type {
  ContentCategory,
  ContentRegistryData,
  ContentValidationIssue,
  ContentValidationReport,
} from '../types/content'

type IssueLocation = {
  readonly category?: ContentCategory
  readonly id?: string
  readonly field?: string
}

function addIssue(
  issues: ContentValidationIssue[],
  severity: ContentValidationIssue['severity'],
  code: string,
  message: string,
  location: IssueLocation = {},
): void {
  issues.push({
    severity,
    code,
    message,
    reference:
      location.category !== undefined && location.id !== undefined
        ? { category: location.category, id: location.id }
        : undefined,
    field: location.field,
  })
}

function requireText(
  issues: ContentValidationIssue[],
  value: string,
  field: string,
  category: ContentCategory,
  id: string,
): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    addIssue(
      issues,
      'error',
      'required-text',
      `${field} is required.`,
      { category, id, field },
    )
  }
}

function validateUniqueIds<T>(
  issues: ContentValidationIssue[],
  items: readonly T[],
  getId: (item: T) => string,
  category: ContentCategory,
): void {
  const seen = new Set<string>()

  for (const item of items) {
    const id = getId(item)

    if (seen.has(id)) {
      addIssue(
        issues,
        'error',
        'duplicate-id',
        `Duplicate ${category} ID "${id}".`,
        { category, id },
      )
    }

    seen.add(id)
  }
}

function validateReward(
  issues: ContentValidationIssue[],
  rewardXp: number,
  category: ContentCategory,
  id: string,
): void {
  if (!Number.isFinite(rewardXp) || rewardXp < 0) {
    addIssue(
      issues,
      'error',
      'invalid-reward',
      'rewardXp must be a non-negative number.',
      { category, id, field: 'rewardXp' },
    )
  }
}

export class ValidationLayer {
  validate(content: ContentRegistryData): ContentValidationReport {
    const issues: ContentValidationIssue[] = []

    this.validateNpcs(content, issues)
    this.validateDialogues(content, issues)
    this.validateQuests(content, issues)
    this.validateTerritories(content, issues)
    this.validateMissions(content, issues)
    this.validateCareerPaths(content, issues)
    this.validateSupportingContent(content, issues)

    const errorCount = issues.filter(
      ({ severity }) => severity === 'error',
    ).length
    const warningCount = issues.length - errorCount

    return {
      isValid: errorCount === 0,
      issues,
      errorCount,
      warningCount,
    }
  }

  private validateNpcs(
    content: ContentRegistryData,
    issues: ContentValidationIssue[],
  ): void {
    validateUniqueIds(issues, content.npcs, ({ id }) => id, 'npcs')

    for (const npc of content.npcs) {
      requireText(issues, npc.id, 'id', 'npcs', npc.id)
      requireText(issues, npc.name, 'name', 'npcs', npc.id)

      if (
        !Number.isFinite(npc.position.x) ||
        !Number.isFinite(npc.position.y)
      ) {
        addIssue(
          issues,
          'error',
          'invalid-position',
          'NPC position must contain finite coordinates.',
          { category: 'npcs', id: npc.id, field: 'position' },
        )
      }

      if (
        !Number.isFinite(npc.interactionRadius) ||
        npc.interactionRadius <= 0
      ) {
        addIssue(
          issues,
          'error',
          'invalid-interaction-radius',
          'interactionRadius must be greater than zero.',
          {
            category: 'npcs',
            id: npc.id,
            field: 'interactionRadius',
          },
        )
      }

      if (content.startingDialogueIds[npc.id] === undefined) {
        addIssue(
          issues,
          'warning',
          'missing-start-dialogue',
          'NPC has no starting dialogue.',
          { category: 'npcs', id: npc.id },
        )
      }
    }
  }

  private validateDialogues(
    content: ContentRegistryData,
    issues: ContentValidationIssue[],
  ): void {
    validateUniqueIds(
      issues,
      content.dialogues,
      ({ dialogueId }) => dialogueId,
      'dialogues',
    )
    const npcIds = new Set(content.npcs.map(({ id }) => id))
    const dialoguesById = new Map(
      content.dialogues.map((dialogue) => [dialogue.dialogueId, dialogue]),
    )

    for (const dialogue of content.dialogues) {
      requireText(
        issues,
        dialogue.dialogueId,
        'dialogueId',
        'dialogues',
        dialogue.dialogueId,
      )
      requireText(
        issues,
        dialogue.npcName,
        'npcName',
        'dialogues',
        dialogue.dialogueId,
      )
      requireText(
        issues,
        dialogue.text,
        'text',
        'dialogues',
        dialogue.dialogueId,
      )

      if (!npcIds.has(dialogue.npcId)) {
        addIssue(
          issues,
          'error',
          'unknown-dialogue-npc',
          `Dialogue references unknown NPC "${dialogue.npcId}".`,
          {
            category: 'dialogues',
            id: dialogue.dialogueId,
            field: 'npcId',
          },
        )
      }

      if (dialogue.nextDialogueId !== null) {
        const nextDialogue = dialoguesById.get(dialogue.nextDialogueId)

        if (!nextDialogue) {
          addIssue(
            issues,
            'error',
            'unknown-next-dialogue',
            `nextDialogueId references "${dialogue.nextDialogueId}", which does not exist.`,
            {
              category: 'dialogues',
              id: dialogue.dialogueId,
              field: 'nextDialogueId',
            },
          )
        } else if (nextDialogue.npcId !== dialogue.npcId) {
          addIssue(
            issues,
            'error',
            'dialogue-chain-npc-mismatch',
            'A dialogue chain cannot switch to a different NPC.',
            {
              category: 'dialogues',
              id: dialogue.dialogueId,
              field: 'nextDialogueId',
            },
          )
        }
      }
    }

    for (const [npcId, dialogueId] of Object.entries(
      content.startingDialogueIds,
    )) {
      const dialogue = dialogueId
        ? dialoguesById.get(dialogueId)
        : undefined

      if (!npcIds.has(npcId as (typeof content.npcs)[number]['id'])) {
        addIssue(
          issues,
          'error',
          'unknown-start-dialogue-npc',
          `Starting dialogue references unknown NPC "${npcId}".`,
        )
      } else if (!dialogue) {
        addIssue(
          issues,
          'error',
          'unknown-start-dialogue',
          `Starting dialogue "${dialogueId}" does not exist.`,
          { category: 'npcs', id: npcId, field: 'startingDialogueId' },
        )
      } else if (dialogue.npcId !== npcId) {
        addIssue(
          issues,
          'error',
          'start-dialogue-npc-mismatch',
          'Starting dialogue belongs to a different NPC.',
          { category: 'npcs', id: npcId, field: 'startingDialogueId' },
        )
      }
    }
  }

  private validateQuests(
    content: ContentRegistryData,
    issues: ContentValidationIssue[],
  ): void {
    validateUniqueIds(
      issues,
      content.quests,
      ({ questId }) => questId,
      'quests',
    )
    const dialogueIds = new Set(
      content.dialogues.map(({ dialogueId }) => dialogueId),
    )
    const objectIds = new Set(
      content.documentationObjects.map(({ objectId }) => objectId),
    )

    for (const quest of content.quests) {
      requireText(issues, quest.questId, 'questId', 'quests', quest.questId)
      requireText(issues, quest.title, 'title', 'quests', quest.questId)
      requireText(
        issues,
        quest.description,
        'description',
        'quests',
        quest.questId,
      )
      validateReward(issues, quest.rewardXp, 'quests', quest.questId)

      if (quest.objectives.length === 0) {
        addIssue(
          issues,
          'error',
          'quest-without-objectives',
          'Quest must contain at least one objective.',
          { category: 'quests', id: quest.questId, field: 'objectives' },
        )
      }

      const objectiveIds = new Set<string>()

      for (const objective of quest.objectives) {
        requireText(
          issues,
          objective.objectiveId,
          'objectiveId',
          'quests',
          quest.questId,
        )
        requireText(
          issues,
          objective.label,
          'label',
          'quests',
          quest.questId,
        )

        if (objectiveIds.has(objective.objectiveId)) {
          addIssue(
            issues,
            'error',
            'duplicate-objective-id',
            `Duplicate objective ID "${objective.objectiveId}".`,
            { category: 'quests', id: quest.questId, field: 'objectives' },
          )
        }
        objectiveIds.add(objective.objectiveId)

        const rule = objective.completionRule
        const targetExists =
          rule.type === 'completeDialogue'
            ? dialogueIds.has(rule.dialogueId)
            : objectIds.has(rule.objectId)

        if (!targetExists) {
          addIssue(
            issues,
            'error',
            'unknown-objective-target',
            'Quest objective references content that does not exist.',
            {
              category: 'quests',
              id: quest.questId,
              field: 'objectives',
            },
          )
        }
      }
    }
  }

  private validateTerritories(
    content: ContentRegistryData,
    issues: ContentValidationIssue[],
  ): void {
    validateUniqueIds(
      issues,
      content.territories,
      ({ territoryId }) => territoryId,
      'territories',
    )
    const questIds = new Set(content.quests.map(({ questId }) => questId))
    const territoryIds = new Set(
      content.territories.map(({ territoryId }) => territoryId),
    )

    for (const territory of content.territories) {
      requireText(
        issues,
        territory.territoryId,
        'territoryId',
        'territories',
        territory.territoryId,
      )
      requireText(
        issues,
        territory.title,
        'title',
        'territories',
        territory.territoryId,
      )
      requireText(
        issues,
        territory.description,
        'description',
        'territories',
        territory.territoryId,
      )

      if (
        !Number.isInteger(territory.requiredLevel) ||
        territory.requiredLevel < 1
      ) {
        addIssue(
          issues,
          'error',
          'invalid-required-level',
          'requiredLevel must be a positive integer.',
          {
            category: 'territories',
            id: territory.territoryId,
            field: 'requiredLevel',
          },
        )
      }

      for (const questId of territory.quests) {
        if (!questIds.has(questId)) {
          addIssue(
            issues,
            'error',
            'unknown-territory-quest',
            `Territory references unknown quest "${questId}".`,
            {
              category: 'territories',
              id: territory.territoryId,
              field: 'quests',
            },
          )
        }
      }
    }

    for (const object of content.documentationObjects) {
      if (!territoryIds.has(object.territoryId)) {
        addIssue(
          issues,
          'error',
          'unknown-object-territory',
          `Discovery object "${object.objectId}" references an unknown territory.`,
        )
      }
    }
  }

  private validateMissions(
    content: ContentRegistryData,
    issues: ContentValidationIssue[],
  ): void {
    validateUniqueIds(
      issues,
      content.missions,
      ({ missionId }) => missionId,
      'missions',
    )
    const validCategories = new Set([
      'access',
      'learning',
      'networking',
      'coding',
    ])

    for (const mission of content.missions) {
      requireText(
        issues,
        mission.missionId,
        'missionId',
        'missions',
        mission.missionId,
      )
      requireText(
        issues,
        mission.title,
        'title',
        'missions',
        mission.missionId,
      )
      requireText(
        issues,
        mission.description,
        'description',
        'missions',
        mission.missionId,
      )
      validateReward(issues, mission.rewardXp, 'missions', mission.missionId)

      if (!validCategories.has(mission.category)) {
        addIssue(
          issues,
          'error',
          'invalid-mission-category',
          `Unknown mission category "${mission.category}".`,
          { category: 'missions', id: mission.missionId, field: 'category' },
        )
      }

      if (mission.completionRequirement.type !== 'manualConfirmation') {
        addIssue(
          issues,
          'error',
          'invalid-mission-completion',
          'MVP missions must use manualConfirmation.',
          {
            category: 'missions',
            id: mission.missionId,
            field: 'completionRequirement',
          },
        )
      }
    }
  }

  private validateCareerPaths(
    content: ContentRegistryData,
    issues: ContentValidationIssue[],
  ): void {
    validateUniqueIds(
      issues,
      content.careerPaths,
      ({ pathId }) => pathId,
      'careerPaths',
    )
    const dialogueIds = new Set(
      content.dialogues.map(({ dialogueId }) => dialogueId),
    )
    const trackIds = new Set<string>()
    const milestoneIds = new Set<string>()

    for (const path of content.careerPaths) {
      requireText(
        issues,
        path.pathId,
        'pathId',
        'careerPaths',
        path.pathId,
      )
      requireText(
        issues,
        path.title,
        'title',
        'careerPaths',
        path.pathId,
      )
      requireText(
        issues,
        path.description,
        'description',
        'careerPaths',
        path.pathId,
      )

      if (!dialogueIds.has(path.unlockRule.dialogueId)) {
        addIssue(
          issues,
          'error',
          'unknown-career-unlock-dialogue',
          `Career path references unknown dialogue "${path.unlockRule.dialogueId}".`,
          {
            category: 'careerPaths',
            id: path.pathId,
            field: 'unlockRule',
          },
        )
      }

      if (trackIds.has(path.track.trackId)) {
        addIssue(
          issues,
          'error',
          'duplicate-track-id',
          `Duplicate career track ID "${path.track.trackId}".`,
          { category: 'careerPaths', id: path.pathId, field: 'track' },
        )
      }
      trackIds.add(path.track.trackId)

      if (path.track.milestones.length === 0) {
        addIssue(
          issues,
          'error',
          'career-path-without-milestones',
          'Career path must contain at least one milestone.',
          {
            category: 'careerPaths',
            id: path.pathId,
            field: 'track.milestones',
          },
        )
      }

      const sortedOrders = path.track.milestones
        .map(({ order }) => order)
        .sort((left, right) => left - right)

      for (const [index, milestone] of path.track.milestones.entries()) {
        if (milestoneIds.has(milestone.milestoneId)) {
          addIssue(
            issues,
            'error',
            'duplicate-career-milestone-id',
            `Duplicate career milestone ID "${milestone.milestoneId}".`,
            {
              category: 'careerPaths',
              id: path.pathId,
              field: 'track.milestones',
            },
          )
        }
        milestoneIds.add(milestone.milestoneId)

        requireText(
          issues,
          milestone.title,
          'milestone.title',
          'careerPaths',
          path.pathId,
        )
        requireText(
          issues,
          milestone.description,
          'milestone.description',
          'careerPaths',
          path.pathId,
        )

        if (sortedOrders[index] !== index + 1) {
          addIssue(
            issues,
            'error',
            'invalid-career-milestone-order',
            'Career milestone order must be unique and start at 1.',
            {
              category: 'careerPaths',
              id: path.pathId,
              field: 'track.milestones',
            },
          )
          break
        }
      }
    }
  }

  private validateSupportingContent(
    content: ContentRegistryData,
    issues: ContentValidationIssue[],
  ): void {
    const questIds = new Set(content.quests.map(({ questId }) => questId))
    const territoryIds = new Set(
      content.territories.map(({ territoryId }) => territoryId),
    )
    const milestoneIds = new Set([
      content.firstWeekMilestone.milestoneId,
    ])
    const stageIds = new Set(
      content.journeyStages.map(({ stageId }) => stageId),
    )

    const validateJourneyRule = (
      rule: (typeof content.journeyStages)[number]['unlockRule'],
      stageId: string,
    ): void => {
      const valid =
        rule.type === 'always' ||
        rule.type === 'never' ||
        (rule.type === 'completeQuest' && questIds.has(rule.questId)) ||
        (rule.type === 'completeTerritory' &&
          territoryIds.has(rule.territoryId)) ||
        (rule.type === 'completeMilestone' &&
          milestoneIds.has(rule.milestoneId))

      if (!valid) {
        addIssue(
          issues,
          'error',
          'unknown-journey-rule-target',
          `Journey stage "${stageId}" references content that does not exist.`,
        )
      }
    }

    for (const stage of content.journeyStages) {
      validateJourneyRule(stage.unlockRule, stage.stageId)
      validateJourneyRule(stage.completionRule, stage.stageId)
    }

    for (const badge of content.badges) {
      const rule = badge.unlockRule
      const valid =
        (rule.type === 'completeQuest' && questIds.has(rule.questId)) ||
        (rule.type === 'completeMilestone' &&
          milestoneIds.has(rule.milestoneId)) ||
        (rule.type === 'completeJourneyStage' &&
          stageIds.has(rule.stageId))

      if (!valid) {
        addIssue(
          issues,
          'error',
          'unknown-badge-rule-target',
          `Badge "${badge.badgeId}" references content that does not exist.`,
        )
      }
    }

    const levels = content.levelDefinitions.map(({ level }) => level)
    const minimumXp = content.levelDefinitions.map(
      ({ minimumXp: threshold }) => threshold,
    )

    if (
      levels.length === 0 ||
      levels.some((level, index) => level !== index + 1) ||
      minimumXp.some(
        (threshold, index) =>
          threshold < 0 ||
          (index > 0 && threshold <= minimumXp[index - 1]),
      )
    ) {
      addIssue(
        issues,
        'error',
        'invalid-level-progression',
        'Levels must be sequential with increasing XP thresholds.',
      )
    }
  }
}
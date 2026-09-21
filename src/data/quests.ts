import type { QuestDefinition } from '../types/quest'

export const quests = [
  {
    questId: 'meet-your-team',
    title: 'Meet Your Team',
    description: 'Speak with every team member in Team Village.',
    rewardXp: 50,
    objectives: [
      {
        objectiveId: 'meet-buddy',
        label: 'Buddy',
        completionRule: {
          type: 'completeDialogue',
          dialogueId: 'buddy-welcome',
        },
      },
      {
        objectiveId: 'meet-manager',
        label: 'Manager',
        completionRule: {
          type: 'completeDialogue',
          dialogueId: 'manager-welcome',
        },
      },
      {
        objectiveId: 'meet-senior-engineer',
        label: 'Senior Engineer',
        completionRule: {
          type: 'completeDialogue',
          dialogueId: 'senior-engineer-welcome',
        },
      },
      {
        objectiveId: 'meet-product-manager',
        label: 'Product Manager',
        completionRule: {
          type: 'completeDialogue',
          dialogueId: 'product-manager-welcome',
        },
      },
    ],
  },
  {
    questId: 'xstore-explorer',
    title: 'XStore Explorer',
    description:
      'Review onboarding documentation and discover where technical knowledge is stored.',
    rewardXp: 100,
    objectives: [
      {
        objectiveId: 'discover-architecture-guide',
        label: 'Architecture Guide',
        completionRule: {
          type: 'discoverObject',
          objectId: 'architecture-guide',
        },
      },
      {
        objectiveId: 'discover-setup-guide',
        label: 'Setup Guide',
        completionRule: {
          type: 'discoverObject',
          objectId: 'setup-guide',
        },
      },
      {
        objectiveId: 'discover-team-wiki',
        label: 'Team Wiki',
        completionRule: {
          type: 'discoverObject',
          objectId: 'team-wiki',
        },
      },
    ],
  },
] as const satisfies readonly QuestDefinition[]
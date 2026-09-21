import type { JourneyStage } from '../types/journey'

export const journeyStages = [
  {
    stageId: 'meet-your-team',
    order: 1,
    title: 'Meet Your Team',
    description: 'Meet the people who will support your onboarding.',
    unlockRule: { type: 'always' },
    completionRule: {
      type: 'completeQuest',
      questId: 'meet-your-team',
    },
    recommendation: 'Talk to remaining team members.',
  },
  {
    stageId: 'learn-the-territory',
    order: 2,
    title: 'Learn the Territory',
    description: 'Discover where organizational knowledge is stored.',
    unlockRule: {
      type: 'completeQuest',
      questId: 'meet-your-team',
    },
    completionRule: {
      type: 'completeTerritory',
      territoryId: 'documentation',
    },
    recommendation: 'Explore documentation territory.',
  },
  {
    stageId: 'first-week-missions',
    order: 3,
    title: 'First Week Missions',
    description: 'Complete the practical tasks for your first week.',
    unlockRule: {
      type: 'completeTerritory',
      territoryId: 'documentation',
    },
    completionRule: {
      type: 'completeMilestone',
      milestoneId: 'first-week-complete',
    },
    recommendation: 'Complete first week missions.',
  },
  {
    stageId: 'become-productive',
    order: 4,
    title: 'Become Productive',
    description: 'Build confidence through guided productive work.',
    unlockRule: {
      type: 'completeMilestone',
      milestoneId: 'first-week-complete',
    },
    completionRule: { type: 'never' },
    recommendation: 'Visit Mentor Tower and choose a path.',
  },
  {
    stageId: 'team-contributor',
    order: 5,
    title: 'Team Contributor',
    description: 'Grow into an established contributor on the team.',
    unlockRule: { type: 'never' },
    completionRule: { type: 'never' },
    recommendation: 'Team Contributor unlocks in a future phase.',
  },
] as const satisfies readonly JourneyStage[]
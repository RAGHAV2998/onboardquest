import type { BadgeDefinition } from '../types/badge'

export const badges = [
  {
    badgeId: 'team-explorer',
    name: 'Team Explorer',
    description: 'Completed the Meet Your Team quest.',
    unlockRule: {
      type: 'completeJourneyStage',
      stageId: 'meet-your-team',
    },
  },
  {
    badgeId: 'xstore-explorer',
    name: 'XStore Explorer',
    description: 'Completed the Learn the Territory journey stage.',
    unlockRule: {
      type: 'completeJourneyStage',
      stageId: 'learn-the-territory',
    },
  },
  {
    badgeId: 'onboarding-champion',
    name: 'Onboarding Champion',
    description: 'Completed every first-week onboarding mission.',
    unlockRule: {
      type: 'completeJourneyStage',
      stageId: 'first-week-missions',
    },
  },
] as const satisfies readonly BadgeDefinition[]
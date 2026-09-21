import type {
  MilestoneDefinition,
  MissionDefinition,
} from '../types/mission'

export const missions = [
  {
    missionId: 'access-kusto',
    title: 'Access Kusto',
    description: 'Gain access to the analytics platform.',
    category: 'access',
    initialStatus: 'available',
    rewardXp: 25,
    completionRequirement: { type: 'manualConfirmation' },
  },
  {
    missionId: 'run-first-query',
    title: 'Run Your First Query',
    description: 'Execute your first query and understand the result.',
    category: 'learning',
    initialStatus: 'available',
    rewardXp: 25,
    completionRequirement: { type: 'manualConfirmation' },
  },
  {
    missionId: 'read-architecture-overview',
    title: 'Read Architecture Overview',
    description: 'Understand the high-level platform architecture.',
    category: 'learning',
    initialStatus: 'available',
    rewardXp: 50,
    completionRequirement: { type: 'manualConfirmation' },
  },
  {
    missionId: 'meet-your-mentor',
    title: 'Meet Your Mentor',
    description: 'Connect with your onboarding mentor.',
    category: 'networking',
    initialStatus: 'available',
    rewardXp: 25,
    completionRequirement: { type: 'manualConfirmation' },
  },
  {
    missionId: 'fix-first-bug',
    title: 'Fix Your First Bug',
    description: 'Complete your first engineering contribution.',
    category: 'coding',
    initialStatus: 'available',
    rewardXp: 100,
    completionRequirement: { type: 'manualConfirmation' },
  },
] as const satisfies readonly MissionDefinition[]

export const firstWeekMilestone = {
  milestoneId: 'first-week-complete',
  title: 'First Week Complete',
  rewardXp: 150,
} as const satisfies MilestoneDefinition
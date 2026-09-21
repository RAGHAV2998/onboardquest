import type { CareerPath } from '../types/career'

export const careerPaths = [
  {
    pathId: 'engineer',
    title: 'Engineer',
    description: 'Grow from platform understanding to feature ownership.',
    unlockRule: {
      type: 'completeDialogue',
      dialogueId: 'mentor-welcome',
    },
    track: {
      trackId: 'engineer-track',
      milestones: [
        {
          milestoneId: 'engineer-learn-architecture',
          order: 1,
          title: 'Learn Architecture',
          description: 'Build a working model of the platform architecture.',
        },
        {
          milestoneId: 'engineer-first-contribution',
          order: 2,
          title: 'First Contribution',
          description: 'Complete a focused engineering contribution.',
        },
        {
          milestoneId: 'engineer-own-feature',
          order: 3,
          title: 'Own a Feature',
          description: 'Take responsibility for a feature from plan to delivery.',
        },
      ],
    },
  },
  {
    pathId: 'data-ai',
    title: 'Data & AI',
    description: 'Turn telemetry and data into useful team insights.',
    unlockRule: {
      type: 'completeDialogue',
      dialogueId: 'mentor-welcome',
    },
    track: {
      trackId: 'data-ai-track',
      milestones: [
        {
          milestoneId: 'data-ai-explore-telemetry',
          order: 1,
          title: 'Explore Telemetry',
          description: 'Learn what signals are available and what they mean.',
        },
        {
          milestoneId: 'data-ai-create-dashboard',
          order: 2,
          title: 'Create a Dashboard',
          description: 'Organize useful signals into a clear dashboard.',
        },
        {
          milestoneId: 'data-ai-deliver-insight',
          order: 3,
          title: 'Deliver an Insight',
          description: 'Use data to answer a meaningful team question.',
        },
      ],
    },
  },
  {
    pathId: 'reliability',
    title: 'Reliability',
    description: 'Develop operational judgment and improve service health.',
    unlockRule: {
      type: 'completeDialogue',
      dialogueId: 'mentor-welcome',
    },
    track: {
      trackId: 'reliability-track',
      milestones: [
        {
          milestoneId: 'reliability-understand-incidents',
          order: 1,
          title: 'Understand Incidents',
          description: 'Learn the lifecycle and impact of service incidents.',
        },
        {
          milestoneId: 'reliability-study-root-causes',
          order: 2,
          title: 'Study Root Causes',
          description: 'Practice tracing symptoms back to contributing causes.',
        },
        {
          milestoneId: 'reliability-improve-operational-health',
          order: 3,
          title: 'Improve Operational Health',
          description: 'Complete a focused reliability improvement.',
        },
      ],
    },
  },
  {
    pathId: 'leadership',
    title: 'Leadership',
    description: 'Grow your impact through support, direction, and ownership.',
    unlockRule: {
      type: 'completeDialogue',
      dialogueId: 'mentor-welcome',
    },
    track: {
      trackId: 'leadership-track',
      milestones: [
        {
          milestoneId: 'leadership-mentor-others',
          order: 1,
          title: 'Mentor Others',
          description: 'Support another person through a learning challenge.',
        },
        {
          milestoneId: 'leadership-drive-project',
          order: 2,
          title: 'Drive a Project',
          description: 'Coordinate a project toward a clear outcome.',
        },
        {
          milestoneId: 'leadership-lead-initiative',
          order: 3,
          title: 'Lead an Initiative',
          description: 'Lead a broader initiative across team boundaries.',
        },
      ],
    },
  },
] as const satisfies readonly CareerPath[]
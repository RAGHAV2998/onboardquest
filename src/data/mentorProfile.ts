import type { MentorProfile, NpcDefinition } from '../types/npc'

export const mentorProfile = {
  npcId: 'mentor',
  name: 'Mentor',
  role: 'Growth Mentor (fictional placeholder)',
  summary: 'Introduces the deterministic growth paths available after onboarding.',
  howTheyCanHelp: 'Explains each path and helps you choose a next milestone.',
} as const satisfies MentorProfile

export const mentorNpc = {
  id: 'mentor',
  name: 'Mentor',
  mapId: 'mentor-tower',
  position: { x: 720, y: 300 },
  color: 0x385d78,
  interactionRadius: 130,
  appearance: 'mentor',
} as const satisfies NpcDefinition
import type { DialogueEntry, DialogueId } from '../types/dialogue'
import type { NpcId } from '../types/npc'

export const dialogues = [
  {
    npcId: 'buddy',
    npcName: 'Buddy',
    dialogueId: 'buddy-welcome',
    text: "Welcome to Team Village. I'm your onboarding buddy.",
    nextDialogueId: 'buddy-first-week',
  },
  {
    npcId: 'buddy',
    npcName: 'Buddy',
    dialogueId: 'buddy-first-week',
    text: "During your first week you'll meet people, learn tools and explore the organization.",
    nextDialogueId: 'buddy-meet-team',
  },
  {
    npcId: 'buddy',
    npcName: 'Buddy',
    dialogueId: 'buddy-meet-team',
    text: "When you're ready, start by meeting the rest of the team.",
    nextDialogueId: null,
  },
  {
    npcId: 'manager',
    npcName: 'Manager',
    dialogueId: 'manager-welcome',
    text: "Welcome. I'm the Manager placeholder for this Team Village demo.",
    nextDialogueId: 'manager-approved-content',
  },
  {
    npcId: 'manager',
    npcName: 'Manager',
    dialogueId: 'manager-approved-content',
    text: 'My approved team introduction will be added here later.',
    nextDialogueId: null,
  },
  {
    npcId: 'senior-engineer',
    npcName: 'Senior Engineer',
    dialogueId: 'senior-engineer-welcome',
    text: "Hello. I'm the Senior Engineer placeholder for this demo.",
    nextDialogueId: 'senior-engineer-approved-content',
  },
  {
    npcId: 'senior-engineer',
    npcName: 'Senior Engineer',
    dialogueId: 'senior-engineer-approved-content',
    text: 'My approved technical introduction will be added here later.',
    nextDialogueId: 'senior-engineer-privacy',
  },
  {
    npcId: 'senior-engineer',
    npcName: 'Senior Engineer',
    dialogueId: 'senior-engineer-privacy',
    text: 'Until then, no internal technical details are included.',
    nextDialogueId: null,
  },
  {
    npcId: 'product-manager',
    npcName: 'Product Manager',
    dialogueId: 'product-manager-welcome',
    text: "Hello. I'm the Product Manager placeholder for this demo.",
    nextDialogueId: 'product-manager-approved-content',
  },
  {
    npcId: 'product-manager',
    npcName: 'Product Manager',
    dialogueId: 'product-manager-approved-content',
    text: 'My approved product introduction will be added here later.',
    nextDialogueId: null,
  },
  {
    npcId: 'mentor',
    npcName: 'Mentor',
    dialogueId: 'mentor-welcome',
    text: 'Congratulations on finishing onboarding.',
    nextDialogueId: 'mentor-build-expertise',
  },
  {
    npcId: 'mentor',
    npcName: 'Mentor',
    dialogueId: 'mentor-build-expertise',
    text: "Now it's time to start building expertise.",
    nextDialogueId: 'mentor-choose-path',
  },
  {
    npcId: 'mentor',
    npcName: 'Mentor',
    dialogueId: 'mentor-choose-path',
    text: 'Choose a growth path to continue your journey.',
    nextDialogueId: null,
  },
] as const satisfies readonly DialogueEntry[]

export const startingDialogueIds: Partial<Record<NpcId, DialogueId>> = {
  buddy: 'buddy-welcome',
  manager: 'manager-welcome',
  'senior-engineer': 'senior-engineer-welcome',
  'product-manager': 'product-manager-welcome',
  mentor: 'mentor-welcome',
}
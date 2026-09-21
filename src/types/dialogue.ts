import type { NpcId } from './npc'

export type DialogueId = string

export type DialogueEntry = {
  readonly npcId: NpcId
  readonly npcName: string
  readonly dialogueId: DialogueId
  readonly text: string
  readonly nextDialogueId: DialogueId | null
}

export function isDialogueId(value: unknown): value is DialogueId {
  return typeof value === 'string' && value.trim().length > 0
}
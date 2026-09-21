import Phaser from 'phaser'
import type {
  DialogueEntry,
  DialogueId,
} from '../../types/dialogue'
import type { NpcId } from '../../types/npc'

type DialogueStateCallbacks = {
  readonly onDialogueChanged: (dialogue: DialogueEntry | null) => void
  readonly onDialogueCompleted: (dialogueId: DialogueId) => void
  readonly onDialogueClosed: () => void
}

export class DialogueStateManager {
  private readonly dialoguesById: ReadonlyMap<DialogueId, DialogueEntry>
  private activeDialogue: DialogueEntry | null = null
  private activeStartingDialogueId: DialogueId | null = null

  constructor(
    dialogues: readonly DialogueEntry[],
    private readonly startingDialogueIds: Partial<
      Record<NpcId, DialogueId>
    >,
    private readonly advanceKeys: readonly Phaser.Input.Keyboard.Key[],
    private readonly callbacks: DialogueStateCallbacks,
  ) {
    this.dialoguesById = this.createDialogueMap(dialogues)
    this.validateDialogueLinks(dialogues)
  }

  get isOpen(): boolean {
    return this.activeDialogue !== null
  }

  openForNpc(npcId: NpcId): boolean {
    if (this.isOpen) {
      return false
    }

    const startingDialogueId = this.startingDialogueIds[npcId]

    if (!startingDialogueId) {
      return false
    }

    const startingDialogue = this.getDialogue(startingDialogueId)

    if (startingDialogue.npcId !== npcId) {
      throw new Error(
        `Dialogue ${startingDialogueId} does not belong to NPC ${npcId}.`,
      )
    }

    this.activeStartingDialogueId = startingDialogueId
    this.activeDialogue = startingDialogue
    this.callbacks.onDialogueChanged(startingDialogue)
    return true
  }

  update(): void {
    if (
      this.activeDialogue &&
      this.advanceKeys.some((key) => Phaser.Input.Keyboard.JustDown(key))
    ) {
      this.advance()
    }
  }

  private advance(): void {
    const currentDialogue = this.activeDialogue

    if (!currentDialogue) {
      return
    }

    if (currentDialogue.nextDialogueId) {
      const nextDialogue = this.getDialogue(currentDialogue.nextDialogueId)

      if (nextDialogue.npcId !== currentDialogue.npcId) {
        throw new Error(
          `Dialogue ${currentDialogue.dialogueId} links to another NPC.`,
        )
      }

      this.activeDialogue = nextDialogue
      this.callbacks.onDialogueChanged(nextDialogue)
      return
    }

    const completedDialogueId = this.activeStartingDialogueId
    this.activeDialogue = null
    this.activeStartingDialogueId = null

    if (completedDialogueId) {
      this.callbacks.onDialogueCompleted(completedDialogueId)
    }

    this.callbacks.onDialogueChanged(null)
    this.callbacks.onDialogueClosed()
  }

  private createDialogueMap(
    dialogues: readonly DialogueEntry[],
  ): ReadonlyMap<DialogueId, DialogueEntry> {
    const dialogueMap = new Map<DialogueId, DialogueEntry>()

    for (const dialogue of dialogues) {
      if (dialogueMap.has(dialogue.dialogueId)) {
        throw new Error(`Duplicate dialogue ID: ${dialogue.dialogueId}`)
      }

      dialogueMap.set(dialogue.dialogueId, dialogue)
    }

    return dialogueMap
  }

  private validateDialogueLinks(dialogues: readonly DialogueEntry[]): void {
    for (const dialogue of dialogues) {
      if (
        dialogue.nextDialogueId &&
        !this.dialoguesById.has(dialogue.nextDialogueId)
      ) {
        throw new Error(
          `Dialogue ${dialogue.dialogueId} has an unknown next dialogue.`,
        )
      }
    }

    for (const startingDialogueId of Object.values(
      this.startingDialogueIds,
    )) {
      if (
        startingDialogueId &&
        !this.dialoguesById.has(startingDialogueId)
      ) {
        throw new Error(`Unknown starting dialogue: ${startingDialogueId}`)
      }
    }
  }

  private getDialogue(dialogueId: DialogueId): DialogueEntry {
    const dialogue = this.dialoguesById.get(dialogueId)

    if (!dialogue) {
      throw new Error(`Unknown dialogue: ${dialogueId}`)
    }

    return dialogue
  }
}
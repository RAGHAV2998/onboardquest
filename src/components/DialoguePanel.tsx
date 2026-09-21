import type { DialogueEntry } from '../types/dialogue'

type DialoguePanelProps = {
  readonly dialogue: DialogueEntry | null
}

export function DialoguePanel({ dialogue }: DialoguePanelProps) {
  if (!dialogue) {
    return null
  }

  return (
    <section
      className="dialogue-panel"
      aria-label={`${dialogue.npcName} dialogue`}
      aria-live="polite"
    >
      <p className="dialogue-speaker">{dialogue.npcName}</p>
      <p className="dialogue-text">{dialogue.text}</p>
      <p className="dialogue-prompt">
        <kbd>Space</kbd> or <kbd>Enter</kbd>
        <span>{dialogue.nextDialogueId ? 'Next' : 'Close'}</span>
      </p>
    </section>
  )
}
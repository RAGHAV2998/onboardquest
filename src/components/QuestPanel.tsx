import type { QuestState } from '../types/quest'

type QuestPanelProps = {
  readonly quests: readonly QuestState[]
}

export function QuestPanel({ quests }: QuestPanelProps) {
  if (quests.length === 0) {
    return null
  }

  return (
    <aside className="quest-panel" aria-label="Quest progress">
      {quests.map((quest) => (
        <section
          key={quest.questId}
          className="quest-entry"
          aria-labelledby={`${quest.questId}-title`}
        >
          <p className="quest-status-label">
            {quest.completed ? 'Quest complete' : 'Active quest'}
          </p>
          <h2 id={`${quest.questId}-title`}>{quest.title}</h2>
          <p className="quest-description">{quest.description}</p>

          <p className="quest-list-label">Completed:</p>
          <ul className="quest-objectives">
            {quest.objectives.map((objective) => (
              <li key={objective.objectiveId}>
                <span
                  className={`objective-box${
                    objective.completed ? ' objective-box-complete' : ''
                  }`}
                  aria-hidden="true"
                />
                <span>{objective.label}</span>
                <span className="sr-only">
                  {objective.completed ? ' completed' : ' not completed'}
                </span>
              </li>
            ))}
          </ul>

          <div className="quest-progress-summary">
            <span>Progress</span>
            <strong>
              {quest.completedCount} / {quest.totalCount}
            </strong>
          </div>
          <div
            className="quest-progress-track"
            role="progressbar"
            aria-label={`${quest.title} progress`}
            aria-valuemin={0}
            aria-valuemax={quest.totalCount}
            aria-valuenow={quest.completedCount}
          >
            <span
              style={{
                width: `${
                  (quest.completedCount / quest.totalCount) * 100
                }%`,
              }}
            />
          </div>
        </section>
      ))}
    </aside>
  )
}
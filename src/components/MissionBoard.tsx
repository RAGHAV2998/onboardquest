import { useState } from 'react'
import type { MissionBoardState, MissionId } from '../types/mission'

type MissionBoardProps = {
  readonly board: MissionBoardState | null
  readonly onComplete: (missionId: MissionId) => void
}

const categoryLabels = {
  access: 'Access',
  learning: 'Learning',
  networking: 'Networking',
  coding: 'Coding',
} as const

export function MissionBoard({ board, onComplete }: MissionBoardProps) {
  const [selectedMissionId, setSelectedMissionId] =
    useState<MissionId | null>(null)

  if (!board) {
    return null
  }

  const selectedMission =
    board.missions.find(
      ({ missionId }) => missionId === selectedMissionId,
    ) ?? board.missions[0]

  return (
    <section className="mission-board" aria-labelledby="mission-board-title">
      <header className="mission-board-header">
        <div>
          <p>Self-reported onboarding tasks</p>
          <h2 id="mission-board-title">{board.title}</h2>
        </div>
        <div className="mission-board-progress">
          <span>Progress</span>
          <strong>
            {board.completedCount} / {board.totalCount}
          </strong>
        </div>
      </header>

      <div className="mission-board-layout">
        <div className="mission-list" aria-label="First week missions">
          {board.missions.map((mission) => (
            <button
              key={mission.missionId}
              className="mission-list-item"
              data-selected={mission.missionId === selectedMission.missionId}
              type="button"
              onClick={() => setSelectedMissionId(mission.missionId)}
            >
              <span
                className={`objective-box${
                  mission.status === 'completed'
                    ? ' objective-box-complete'
                    : ''
                }`}
                aria-hidden="true"
              />
              <span className="mission-list-copy">
                <strong>{mission.title}</strong>
                <small>{categoryLabels[mission.category]}</small>
              </span>
              <span className="mission-list-reward">+{mission.rewardXp} XP</span>
              <span className="sr-only">
                {mission.status === 'completed' ? ' completed' : ' available'}
              </span>
            </button>
          ))}
        </div>

        <article className="mission-details" aria-live="polite">
          <p className="mission-category">
            {categoryLabels[selectedMission.category]}
          </p>
          <h3>{selectedMission.title}</h3>
          <p className="mission-description">{selectedMission.description}</p>

          <dl className="mission-meta">
            <div>
              <dt>Reward</dt>
              <dd>+{selectedMission.rewardXp} XP</dd>
            </div>
            <div>
              <dt>Completion</dt>
              <dd>Manual confirmation</dd>
            </div>
          </dl>

          <p className="mission-self-report">
            Completion is self-reported and is not verified automatically.
          </p>
          <button
            className="mission-complete-button"
            type="button"
            disabled={selectedMission.status === 'completed'}
            onClick={() => onComplete(selectedMission.missionId)}
          >
            {selectedMission.status === 'completed'
              ? 'Mission completed'
              : 'Mark mission complete'}
          </button>
        </article>
      </div>
    </section>
  )
}
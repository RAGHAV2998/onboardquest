import type {
  CareerMilestoneId,
  CareerPathId,
  CareerState,
} from '../types/career'

type CareerPathsProps = {
  readonly career: CareerState | null
  readonly onSelectPath: (pathId: CareerPathId) => void
  readonly onCompleteMilestone: (milestoneId: CareerMilestoneId) => void
}

export function CareerPaths({
  career,
  onSelectPath,
  onCompleteMilestone,
}: CareerPathsProps) {
  if (!career) {
    return null
  }

  return (
    <section className="career-paths" aria-labelledby="career-paths-title">
      <header className="career-paths-header">
        <div>
          <p>Growth after onboarding</p>
          <h2 id="career-paths-title">Career Paths</h2>
        </div>
        <strong>{career.currentPath?.title ?? 'No active path'}</strong>
      </header>

      <div className="career-path-grid">
        {career.paths.map((path) => (
          <article
            key={path.pathId}
            className="career-path-card"
            data-status={path.status}
          >
            <div className="career-path-card-header">
              <div>
                <p>
                  {path.status === 'locked'
                    ? '\uD83D\uDD12 Locked'
                    : path.status === 'active'
                      ? '\u2B50 Active path'
                      : 'Unlocked'}
                </p>
                <h3>{path.title}</h3>
              </div>
              <strong>
                {path.completedCount} / {path.totalCount}
              </strong>
            </div>
            <p className="career-path-description">{path.description}</p>

            <ul className="career-milestone-preview">
              {path.track.milestones.map((milestone) => (
                <li key={milestone.milestoneId}>
                  <span
                    className={`objective-box${
                      milestone.completed ? ' objective-box-complete' : ''
                    }`}
                    aria-hidden="true"
                  />
                  <span>{milestone.title}</span>
                  <span className="sr-only">
                    {milestone.completed ? ' completed' : ' not completed'}
                  </span>
                </li>
              ))}
            </ul>

            <div className="career-path-progress">
              <span>Progress</span>
              <strong>
                {path.completedCount} / {path.totalCount}
              </strong>
            </div>
            <button
              type="button"
              disabled={path.status === 'locked' || path.status === 'active'}
              onClick={() => onSelectPath(path.pathId)}
            >
              {path.status === 'locked'
                ? 'Talk to Mentor to unlock'
                : path.status === 'active'
                  ? 'Active path'
                  : career.selectedPathId
                    ? 'Switch to this path'
                    : 'Choose this path'}
            </button>
          </article>
        ))}
      </div>

      {career.currentPath && (
        <section className="career-active-track" aria-live="polite">
          <div>
            <p>Current Career Path</p>
            <h3>{career.currentPath.title}</h3>
          </div>
          {career.currentMilestone ? (
            <div className="career-current-milestone">
              <span>
                Milestone {career.currentMilestone.order} of{' '}
                {career.currentPath.totalCount}
              </span>
              <strong>{career.currentMilestone.title}</strong>
              <p>{career.currentMilestone.description}</p>
              <small>
                Milestone completion is self-reported for this local demo.
              </small>
              <button
                type="button"
                onClick={() =>
                  onCompleteMilestone(career.currentMilestone!.milestoneId)
                }
              >
                Mark milestone complete
              </button>
            </div>
          ) : (
            <p className="career-track-complete">
              All milestones in this path are complete.
            </p>
          )}
        </section>
      )}
    </section>
  )
}
import type { BadgeDefinition } from '../types/badge'
import type { JourneyState } from '../types/journey'
import type { PlayerProgress } from '../types/progression'

type JourneyCompletionScreenProps = {
  readonly journey: JourneyState | null
  readonly progress: PlayerProgress | null
  readonly badges: readonly BadgeDefinition[]
  readonly onDismiss: () => void
}

export function JourneyCompletionScreen({
  journey,
  progress,
  badges,
  onDismiss,
}: JourneyCompletionScreenProps) {
  if (!journey) {
    return null
  }

  return (
    <div className="journey-completion-backdrop" role="presentation">
      <section
        className="journey-completion-screen"
        role="dialog"
        aria-modal="true"
        aria-labelledby="journey-completion-title"
      >
        <button
          className="journey-completion-close"
          type="button"
          aria-label="Close completion screen"
          title="Close"
          onClick={onDismiss}
        >
          {'\u00D7'}
        </button>
        <p className="journey-completion-label">Journey milestone</p>
        <h2 id="journey-completion-title">Welcome Aboard!</h2>
        <p>You have completed your first onboarding journey.</p>

        <dl className="journey-completion-stats">
          <div>
            <dt>Total XP</dt>
            <dd>{progress?.totalXp ?? 0}</dd>
          </div>
          <div>
            <dt>Level</dt>
            <dd>{progress?.level ?? 1}</dd>
          </div>
          <div>
            <dt>Stages</dt>
            <dd>{journey.completedCount} / {journey.totalCount}</dd>
          </div>
        </dl>

        <p className="journey-completion-badges-label">Badges earned</p>
        <ul className="journey-completion-badges">
          {badges.map((badge) => (
            <li key={badge.badgeId}>{badge.name}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
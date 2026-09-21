import type { BadgeDefinition } from '../types/badge'
import type { PlayerProgress } from '../types/progression'

type PlayerProfileProps = {
  readonly progress: PlayerProgress | null
  readonly badges: readonly BadgeDefinition[]
}

export function PlayerProfile({
  progress,
  badges,
}: PlayerProfileProps) {
  const level = progress?.level ?? 1
  const totalXp = progress?.totalXp ?? 0
  const nextLevelXp = progress?.nextLevelXp ?? 100

  return (
    <section className="player-profile" aria-labelledby="player-profile-title">
      <p className="profile-label">Player profile</p>
      <h2 id="player-profile-title">Player Progress</h2>

      <dl className="profile-stats">
        <div>
          <dt>Level</dt>
          <dd>{level}</dd>
        </div>
        <div>
          <dt>XP</dt>
          <dd>
            {totalXp} / {progress?.nextLevelXp === null ? 'Max' : nextLevelXp}
          </dd>
        </div>
      </dl>

      <p className="profile-badges-label">Badges:</p>
      {badges.length === 0 ? (
        <p className="profile-empty-state">No badges unlocked</p>
      ) : (
        <ul className="profile-badges">
          {badges.map((badge) => (
            <li key={badge.badgeId}>
              <span className="badge-medallion" aria-hidden="true" />
              <span>
                <strong>{badge.name}</strong>
                <small>{badge.description}</small>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
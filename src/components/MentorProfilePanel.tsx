import type { MentorProfile } from '../types/npc'

type MentorProfilePanelProps = {
  readonly profile: MentorProfile
}

export function MentorProfilePanel({ profile }: MentorProfilePanelProps) {
  return (
    <aside className="mentor-profile-panel" aria-labelledby="mentor-profile-title">
      <p>Mentor profile</p>
      <h2 id="mentor-profile-title">{profile.name}</h2>
      <dl>
        <div>
          <dt>Role</dt>
          <dd>{profile.role}</dd>
        </div>
        <div>
          <dt>Purpose</dt>
          <dd>{profile.summary}</dd>
        </div>
        <div>
          <dt>How they can help</dt>
          <dd>{profile.howTheyCanHelp}</dd>
        </div>
      </dl>
    </aside>
  )
}
import { useState } from 'react'
import type {
  AuthState,
  OnboardingProfile,
  OnboardingProfileDraft,
  ProfileSaveResult,
  ProfileValidationErrors,
} from '../types/auth'
import { emptyOnboardingProfile } from '../types/auth'

type AccountPanelProps = {
  readonly auth: AuthState
  readonly profile: OnboardingProfile | null
  readonly microsoftLoginUrl: string
  readonly githubLoginUrl: string
  readonly logoutUrl: string
  readonly onSaveProfile: (
    draft: OnboardingProfileDraft,
  ) => ProfileSaveResult
}

function providerLabel(provider: string): string {
  return provider === 'aad'
    ? 'Microsoft'
    : provider === 'github'
      ? 'GitHub'
      : provider
}

export function AccountPanel({
  auth,
  profile,
  microsoftLoginUrl,
  githubLoginUrl,
  logoutUrl,
  onSaveProfile,
}: AccountPanelProps) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<OnboardingProfileDraft>(
    emptyOnboardingProfile,
  )
  const [errors, setErrors] = useState<ProfileValidationErrors>({})
  const accountLabel =
    profile?.displayName ??
    (auth.status === 'authenticated' ? auth.user.userDetails : 'Account')
  const accountInitial = accountLabel.trim().charAt(0).toUpperCase() || 'A'

  const startEditing = () => {
    setDraft(
      profile ?? {
        ...emptyOnboardingProfile,
        displayName:
          auth.status === 'authenticated' ? auth.user.userDetails : '',
      },
    )
    setErrors({})
    setEditing(true)
  }

  const updateField = (
    field: keyof OnboardingProfileDraft,
    value: string,
  ) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const submitProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = onSaveProfile(draft)

    if (!result.ok) {
      setErrors(result.errors)
      return
    }

    setErrors({})
    setEditing(false)
  }

  return (
    <div className="account-shell">
      <button
        type="button"
        className="account-trigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true">{accountInitial}</span>
        <strong>{accountLabel}</strong>
      </button>

      {open && (
        <section
          className="account-panel"
          role="dialog"
          aria-label="Account and onboarding profile"
        >
          <header className="account-panel-header">
            <div>
              <p>Player account</p>
              <h2>{accountLabel}</h2>
            </div>
            <button
              type="button"
              aria-label="Close account panel"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </header>

          {auth.status === 'loading' && (
            <p className="account-auth-status">Checking sign-in status...</p>
          )}

          {auth.status === 'unavailable' && (
            <p className="account-auth-status">
              Managed sign-in is available on the hosted Azure app.
            </p>
          )}

          {auth.status === 'anonymous' && (
            <div className="account-login-options">
              <p>Optional sign-in</p>
              <a href={microsoftLoginUrl}>Continue with Microsoft</a>
              <a href={githubLoginUrl}>Continue with GitHub</a>
              <small>Anonymous play remains available.</small>
            </div>
          )}

          {auth.status === 'authenticated' && (
            <div className="account-signed-in">
              <span>Signed in with {providerLabel(auth.user.identityProvider)}</span>
              <strong>{auth.user.userDetails}</strong>
              <a href={logoutUrl}>Sign out</a>
            </div>
          )}

          <div className="account-profile-divider" />

          {editing ? (
            <form className="account-profile-form" onSubmit={submitProfile}>
              <p>Onboarding profile</p>
              <label>
                Display name
                <input
                  type="text"
                  value={draft.displayName}
                  maxLength={60}
                  aria-invalid={errors.displayName !== undefined}
                  onChange={(event) =>
                    updateField('displayName', event.target.value)
                  }
                />
                {errors.displayName && <small>{errors.displayName}</small>}
              </label>
              <label>
                Role or job title
                <input
                  type="text"
                  value={draft.role}
                  maxLength={80}
                  aria-invalid={errors.role !== undefined}
                  onChange={(event) => updateField('role', event.target.value)}
                />
                {errors.role && <small>{errors.role}</small>}
              </label>
              <label>
                Team
                <input
                  type="text"
                  value={draft.team}
                  maxLength={80}
                  aria-invalid={errors.team !== undefined}
                  onChange={(event) => updateField('team', event.target.value)}
                />
                {errors.team && <small>{errors.team}</small>}
              </label>
              <label>
                Start date
                <input
                  type="date"
                  value={draft.startDate}
                  max={new Date().toISOString().slice(0, 10)}
                  aria-invalid={errors.startDate !== undefined}
                  onChange={(event) =>
                    updateField('startDate', event.target.value)
                  }
                />
                {errors.startDate && <small>{errors.startDate}</small>}
              </label>
              <div className="account-profile-actions">
                <button type="button" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button type="submit">Save profile</button>
              </div>
            </form>
          ) : (
            <div className="account-profile-summary">
              <p>Onboarding profile</p>
              {profile ? (
                <dl>
                  <div>
                    <dt>Name</dt>
                    <dd>{profile.displayName}</dd>
                  </div>
                  <div>
                    <dt>Role</dt>
                    <dd>{profile.role || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt>Team</dt>
                    <dd>{profile.team || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt>Start date</dt>
                    <dd>{profile.startDate || 'Not provided'}</dd>
                  </div>
                </dl>
              ) : (
                <span>Add your local onboarding details.</span>
              )}
              <button type="button" onClick={startEditing}>
                {profile ? 'Edit profile' : 'Create profile'}
              </button>
            </div>
          )}

          <p className="account-local-note">
            Profile and game progress stay only in this browser.
          </p>
        </section>
      )}
    </div>
  )
}
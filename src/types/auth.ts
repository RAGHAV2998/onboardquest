export type AuthProvider = 'aad' | 'github'

export type AuthenticatedUser = {
  readonly identityProvider: string
  readonly userId: string
  readonly userDetails: string
  readonly userRoles: readonly string[]
}

export type AuthState =
  | {
      readonly status: 'loading'
      readonly managedAuthAvailable: false
      readonly user: null
    }
  | {
      readonly status: 'unavailable'
      readonly managedAuthAvailable: false
      readonly user: null
    }
  | {
      readonly status: 'anonymous'
      readonly managedAuthAvailable: true
      readonly user: null
    }
  | {
      readonly status: 'authenticated'
      readonly managedAuthAvailable: true
      readonly user: AuthenticatedUser
    }

export type OnboardingProfileDraft = {
  readonly displayName: string
  readonly role: string
  readonly team: string
  readonly startDate: string
}

export type OnboardingProfile = OnboardingProfileDraft & {
  readonly updatedAt: string
}

export type ProfileField = keyof OnboardingProfileDraft

export type ProfileValidationErrors = Readonly<
  Partial<Record<ProfileField, string>>
>

export type ProfileSaveResult =
  | {
      readonly ok: true
      readonly profile: OnboardingProfile
      readonly errors: ProfileValidationErrors
    }
  | {
      readonly ok: false
      readonly profile: null
      readonly errors: ProfileValidationErrors
    }

export const emptyOnboardingProfile: OnboardingProfileDraft = {
  displayName: '',
  role: '',
  team: '',
  startDate: '',
}
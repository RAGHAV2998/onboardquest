import type {
  OnboardingProfile,
  OnboardingProfileDraft,
  ProfileSaveResult,
  ProfileValidationErrors,
} from '../types/auth'

const PROFILE_STORAGE_KEY = 'onboardquest.profile.v1'
const DISPLAY_NAME_LIMIT = 60
const TEXT_FIELD_LIMIT = 80

type SavedProfile = OnboardingProfile & {
  readonly version: 1
}

function isTimestamp(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    !Number.isNaN(Date.parse(value))
  )
}

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
}

export class ProfileStore {
  constructor(
    private readonly storage: Storage,
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}

  getProfile(): OnboardingProfile | null {
    try {
      const savedValue = this.storage.getItem(PROFILE_STORAGE_KEY)

      if (!savedValue) {
        return null
      }

      const parsed: unknown = JSON.parse(savedValue)

      if (typeof parsed !== 'object' || parsed === null) {
        return null
      }

      const candidate = parsed as Record<string, unknown>

      if (
        candidate.version !== 1 ||
        typeof candidate.displayName !== 'string' ||
        typeof candidate.role !== 'string' ||
        typeof candidate.team !== 'string' ||
        typeof candidate.startDate !== 'string' ||
        !isTimestamp(candidate.updatedAt)
      ) {
        return null
      }

      const draft = this.normalize({
        displayName: candidate.displayName,
        role: candidate.role,
        team: candidate.team,
        startDate: candidate.startDate,
      })

      if (Object.keys(this.validate(draft)).length > 0) {
        return null
      }

      return {
        ...draft,
        updatedAt: candidate.updatedAt,
      }
    } catch {
      return null
    }
  }

  save(draft: OnboardingProfileDraft): ProfileSaveResult {
    const normalized = this.normalize(draft)
    const errors = this.validate(normalized)

    if (Object.keys(errors).length > 0) {
      return {
        ok: false,
        profile: null,
        errors,
      }
    }

    const profile: OnboardingProfile = {
      ...normalized,
      updatedAt: this.now(),
    }
    const savedProfile: SavedProfile = {
      version: 1,
      ...profile,
    }

    try {
      this.storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(savedProfile))
    } catch {
      return {
        ok: false,
        profile: null,
        errors: {
          displayName: 'Profile could not be saved in this browser.',
        },
      }
    }

    return {
      ok: true,
      profile,
      errors: {},
    }
  }

  private normalize(draft: OnboardingProfileDraft): OnboardingProfileDraft {
    return {
      displayName: draft.displayName.trim(),
      role: draft.role.trim(),
      team: draft.team.trim(),
      startDate: draft.startDate.trim(),
    }
  }

  private validate(
    draft: OnboardingProfileDraft,
  ): ProfileValidationErrors {
    const errors: Partial<Record<keyof OnboardingProfileDraft, string>> = {}

    if (draft.displayName.length === 0) {
      errors.displayName = 'Display name is required.'
    } else if (draft.displayName.length > DISPLAY_NAME_LIMIT) {
      errors.displayName = `Use ${DISPLAY_NAME_LIMIT} characters or fewer.`
    }

    if (draft.role.length > TEXT_FIELD_LIMIT) {
      errors.role = `Use ${TEXT_FIELD_LIMIT} characters or fewer.`
    }

    if (draft.team.length > TEXT_FIELD_LIMIT) {
      errors.team = `Use ${TEXT_FIELD_LIMIT} characters or fewer.`
    }

    if (draft.startDate.length > 0) {
      if (!isCalendarDate(draft.startDate)) {
        errors.startDate = 'Enter a valid date.'
      } else if (draft.startDate > this.now().slice(0, 10)) {
        errors.startDate = 'Start date cannot be in the future.'
      }
    }

    return errors
  }
}
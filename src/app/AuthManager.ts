import type {
  AuthProvider,
  AuthState,
  AuthenticatedUser,
} from '../types/auth'

type AuthFetchResponse = {
  readonly ok: boolean
  json(): Promise<unknown>
}

type AuthFetcher = (
  input: string,
  init?: { readonly headers: Readonly<Record<string, string>> },
) => Promise<AuthFetchResponse>

type ClientPrincipalPayload = {
  readonly clientPrincipal: unknown
}

function isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.identityProvider === 'string' &&
    candidate.identityProvider.trim().length > 0 &&
    typeof candidate.userId === 'string' &&
    candidate.userId.trim().length > 0 &&
    typeof candidate.userDetails === 'string' &&
    candidate.userDetails.trim().length > 0 &&
    Array.isArray(candidate.userRoles) &&
    candidate.userRoles.every((role) => typeof role === 'string')
  )
}

export class AuthManager {
  constructor(
    private readonly fetcher: AuthFetcher = window.fetch.bind(window),
    private readonly hostname: string = window.location.hostname,
    private readonly origin: string = window.location.origin,
  ) {}

  async load(): Promise<AuthState> {
    if (this.isLocalDevelopment()) {
      return {
        status: 'unavailable',
        managedAuthAvailable: false,
        user: null,
      }
    }

    try {
      const response = await this.fetcher('/.auth/me', {
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        return this.unavailableState()
      }

      const payload: unknown = await response.json()

      if (typeof payload !== 'object' || payload === null) {
        return this.unavailableState()
      }

      const { clientPrincipal } = payload as ClientPrincipalPayload

      if (clientPrincipal === null) {
        return {
          status: 'anonymous',
          managedAuthAvailable: true,
          user: null,
        }
      }

      if (!isAuthenticatedUser(clientPrincipal)) {
        return this.unavailableState()
      }

      return {
        status: 'authenticated',
        managedAuthAvailable: true,
        user: {
          identityProvider: clientPrincipal.identityProvider.trim(),
          userId: clientPrincipal.userId.trim(),
          userDetails: clientPrincipal.userDetails.trim(),
          userRoles: [...clientPrincipal.userRoles],
        },
      }
    } catch {
      return this.unavailableState()
    }
  }

  getLoginUrl(provider: AuthProvider, returnPath = '/'): string {
    const redirectUrl = this.createRedirectUrl(returnPath)
    return `/.auth/login/${provider}?post_login_redirect_uri=${encodeURIComponent(redirectUrl)}`
  }

  getLogoutUrl(returnPath = '/'): string {
    const redirectUrl = this.createRedirectUrl(returnPath)
    return `/.auth/logout?post_logout_redirect_uri=${encodeURIComponent(redirectUrl)}`
  }

  private isLocalDevelopment(): boolean {
    return this.hostname === 'localhost' || this.hostname === '127.0.0.1'
  }

  private createRedirectUrl(returnPath: string): string {
    const safePath =
      returnPath.startsWith('/') && !returnPath.startsWith('//')
        ? returnPath
        : '/'
    return new URL(safePath, this.origin).toString()
  }

  private unavailableState(): AuthState {
    return {
      status: 'unavailable',
      managedAuthAvailable: false,
      user: null,
    }
  }
}
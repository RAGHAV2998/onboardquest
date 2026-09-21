import { describe, expect, it, vi } from 'vitest'
import { AuthManager } from './AuthManager'

describe('AuthManager', () => {
  it('keeps local Vite anonymous play available without calling auth', async () => {
    const fetcher = vi.fn()
    const manager = new AuthManager(
      fetcher,
      '127.0.0.1',
      'http://127.0.0.1:5173',
    )

    await expect(manager.load()).resolves.toEqual({
      status: 'unavailable',
      managedAuthAvailable: false,
      user: null,
    })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('loads anonymous and authenticated Azure principals', async () => {
    const anonymous = new AuthManager(
      async () => ({
        ok: true,
        json: async () => ({ clientPrincipal: null }),
      }),
      'example.azurestaticapps.net',
      'https://example.azurestaticapps.net',
    )
    const authenticated = new AuthManager(
      async () => ({
        ok: true,
        json: async () => ({
          clientPrincipal: {
            identityProvider: 'aad',
            userId: 'local-app-user-id',
            userDetails: 'person@example.test',
            userRoles: ['anonymous', 'authenticated'],
          },
        }),
      }),
      'example.azurestaticapps.net',
      'https://example.azurestaticapps.net',
    )

    await expect(anonymous.load()).resolves.toEqual({
      status: 'anonymous',
      managedAuthAvailable: true,
      user: null,
    })
    await expect(authenticated.load()).resolves.toEqual({
      status: 'authenticated',
      managedAuthAvailable: true,
      user: {
        identityProvider: 'aad',
        userId: 'local-app-user-id',
        userDetails: 'person@example.test',
        userRoles: ['anonymous', 'authenticated'],
      },
    })
  })

  it('rejects malformed auth payloads and prevents redirect injection', async () => {
    const manager = new AuthManager(
      async () => ({
        ok: true,
        json: async () => ({ clientPrincipal: { userId: 42 } }),
      }),
      'example.azurestaticapps.net',
      'https://example.azurestaticapps.net',
    )

    await expect(manager.load()).resolves.toEqual({
      status: 'unavailable',
      managedAuthAvailable: false,
      user: null,
    })
    expect(manager.getLoginUrl('github', '//outside.example')).toBe(
      '/.auth/login/github?post_login_redirect_uri=https%3A%2F%2Fexample.azurestaticapps.net%2F',
    )
    expect(manager.getLogoutUrl('/insights')).toBe(
      '/.auth/logout?post_logout_redirect_uri=https%3A%2F%2Fexample.azurestaticapps.net%2Finsights',
    )
  })
})
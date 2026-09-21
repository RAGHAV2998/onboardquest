import {
  useEffect,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type { AchievementNotification } from '../types/progression'

export type QueuedAchievementNotification = AchievementNotification & {
  readonly id: number
}

type AchievementNotificationsProps = {
  readonly notifications: readonly QueuedAchievementNotification[]
  readonly setNotifications: Dispatch<
    SetStateAction<readonly QueuedAchievementNotification[]>
  >
}

export function AchievementNotifications({
  notifications,
  setNotifications,
}: AchievementNotificationsProps) {
  const activeNotification = notifications[0] ?? null

  useEffect(() => {
    if (!activeNotification) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setNotifications((currentNotifications) =>
        currentNotifications.slice(1),
      )
    }, 2800)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [activeNotification, setNotifications])

  if (!activeNotification) {
    return null
  }

  return (
    <div
      className="achievement-notification"
      data-kind={activeNotification.kind}
      role="status"
      aria-live="assertive"
    >
      <strong>{activeNotification.title}</strong>
      <span>{activeNotification.message}</span>
    </div>
  )
}
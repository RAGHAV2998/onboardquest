import type { BadgeDefinition } from '../../types/badge'
import type {
  CareerMilestoneId,
  CareerPathId,
  CareerState,
} from '../../types/career'
import type { DialogueEntry } from '../../types/dialogue'
import type { NpcInteractionEvent } from '../../types/npc'
import type { MissionBoardState, MissionId } from '../../types/mission'
import type { JourneyState } from '../../types/journey'
import type { InsightsSnapshot } from '../../types/insights'
import type { OracleState } from '../../types/oracle'
import type {
  AchievementNotification,
  PlayerProgress,
} from '../../types/progression'
import type { QuestState } from '../../types/quest'
import type {
  TerritoryId,
  TerritoryProgressState,
  TerritoryState,
} from '../../types/territory'

const NPC_INTERACTED_EVENT = 'npc-interacted'
const DIALOGUE_CHANGED_EVENT = 'dialogue-changed'
const QUEST_STATE_CHANGED_EVENT = 'quest-state-changed'
const QUEST_COMPLETED_EVENT = 'quest-completed'
const PLAYER_PROGRESS_CHANGED_EVENT = 'player-progress-changed'
const BADGES_CHANGED_EVENT = 'badges-changed'
const ACHIEVEMENT_NOTIFICATION_EVENT = 'achievement-notification'
const TERRITORIES_CHANGED_EVENT = 'territories-changed'
const TERRITORY_PROGRESS_CHANGED_EVENT = 'territory-progress-changed'
const ACTIVE_TERRITORY_CHANGED_EVENT = 'active-territory-changed'
const TERRITORY_ENTRY_REQUESTED_EVENT = 'territory-entry-requested'
const MISSION_BOARD_CHANGED_EVENT = 'mission-board-changed'
const MISSION_COMPLETION_REQUESTED_EVENT = 'mission-completion-requested'
const JOURNEY_CHANGED_EVENT = 'journey-changed'
const JOURNEY_FOUNDATION_COMPLETED_EVENT = 'journey-foundation-completed'
const CAREER_STATE_CHANGED_EVENT = 'career-state-changed'
const CAREER_PATH_SELECTION_REQUESTED_EVENT =
  'career-path-selection-requested'
const CAREER_MILESTONE_COMPLETION_REQUESTED_EVENT =
  'career-milestone-completion-requested'
const ORACLE_STATE_CHANGED_EVENT = 'oracle-state-changed'
const ORACLE_QUESTION_REQUESTED_EVENT = 'oracle-question-requested'
const ORACLE_CLOSE_REQUESTED_EVENT = 'oracle-close-requested'
const INSIGHTS_CHANGED_EVENT = 'insights-changed'
const PROGRESS_EXPORT_REQUESTED_EVENT = 'progress-export-requested'
const PROGRESS_RESET_REQUESTED_EVENT = 'progress-reset-requested'
const eventTarget = new EventTarget()

export function emitNpcInteracted(interaction: NpcInteractionEvent): void {
  eventTarget.dispatchEvent(
    new CustomEvent<NpcInteractionEvent>(NPC_INTERACTED_EVENT, {
      detail: interaction,
    }),
  )
}

export function onNpcInteracted(
  listener: (interaction: NpcInteractionEvent) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<NpcInteractionEvent>).detail)
  }

  eventTarget.addEventListener(NPC_INTERACTED_EVENT, eventListener)

  return () => {
    eventTarget.removeEventListener(NPC_INTERACTED_EVENT, eventListener)
  }
}

export function emitDialogueChanged(
  dialogue: DialogueEntry | null,
): void {
  eventTarget.dispatchEvent(
    new CustomEvent<DialogueEntry | null>(DIALOGUE_CHANGED_EVENT, {
      detail: dialogue,
    }),
  )
}

export function onDialogueChanged(
  listener: (dialogue: DialogueEntry | null) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<DialogueEntry | null>).detail)
  }

  eventTarget.addEventListener(DIALOGUE_CHANGED_EVENT, eventListener)

  return () => {
    eventTarget.removeEventListener(DIALOGUE_CHANGED_EVENT, eventListener)
  }
}

export function emitQuestStateChanged(quest: QuestState): void {
  eventTarget.dispatchEvent(
    new CustomEvent<QuestState>(QUEST_STATE_CHANGED_EVENT, {
      detail: quest,
    }),
  )
}

export function onQuestStateChanged(
  listener: (quest: QuestState) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<QuestState>).detail)
  }

  eventTarget.addEventListener(QUEST_STATE_CHANGED_EVENT, eventListener)

  return () => {
    eventTarget.removeEventListener(QUEST_STATE_CHANGED_EVENT, eventListener)
  }
}

export function emitQuestCompleted(quest: QuestState): void {
  eventTarget.dispatchEvent(
    new CustomEvent<QuestState>(QUEST_COMPLETED_EVENT, {
      detail: quest,
    }),
  )
}

export function onQuestCompleted(
  listener: (quest: QuestState) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<QuestState>).detail)
  }

  eventTarget.addEventListener(QUEST_COMPLETED_EVENT, eventListener)

  return () => {
    eventTarget.removeEventListener(QUEST_COMPLETED_EVENT, eventListener)
  }
}

export function emitPlayerProgressChanged(
  progress: PlayerProgress,
): void {
  eventTarget.dispatchEvent(
    new CustomEvent<PlayerProgress>(PLAYER_PROGRESS_CHANGED_EVENT, {
      detail: progress,
    }),
  )
}

export function onPlayerProgressChanged(
  listener: (progress: PlayerProgress) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<PlayerProgress>).detail)
  }

  eventTarget.addEventListener(PLAYER_PROGRESS_CHANGED_EVENT, eventListener)

  return () => {
    eventTarget.removeEventListener(PLAYER_PROGRESS_CHANGED_EVENT, eventListener)
  }
}

export function emitBadgesChanged(
  badges: readonly BadgeDefinition[],
): void {
  eventTarget.dispatchEvent(
    new CustomEvent<readonly BadgeDefinition[]>(BADGES_CHANGED_EVENT, {
      detail: badges,
    }),
  )
}

export function onBadgesChanged(
  listener: (badges: readonly BadgeDefinition[]) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<readonly BadgeDefinition[]>).detail)
  }

  eventTarget.addEventListener(BADGES_CHANGED_EVENT, eventListener)

  return () => {
    eventTarget.removeEventListener(BADGES_CHANGED_EVENT, eventListener)
  }
}

export function emitAchievementNotification(
  notification: AchievementNotification,
): void {
  eventTarget.dispatchEvent(
    new CustomEvent<AchievementNotification>(ACHIEVEMENT_NOTIFICATION_EVENT, {
      detail: notification,
    }),
  )
}

export function onAchievementNotification(
  listener: (notification: AchievementNotification) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<AchievementNotification>).detail)
  }

  eventTarget.addEventListener(ACHIEVEMENT_NOTIFICATION_EVENT, eventListener)

  return () => {
    eventTarget.removeEventListener(
      ACHIEVEMENT_NOTIFICATION_EVENT,
      eventListener,
    )
  }
}

export function emitTerritoriesChanged(
  territories: readonly TerritoryState[],
): void {
  eventTarget.dispatchEvent(
    new CustomEvent<readonly TerritoryState[]>(TERRITORIES_CHANGED_EVENT, {
      detail: territories,
    }),
  )
}

export function onTerritoriesChanged(
  listener: (territories: readonly TerritoryState[]) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<readonly TerritoryState[]>).detail)
  }

  eventTarget.addEventListener(TERRITORIES_CHANGED_EVENT, eventListener)

  return () => {
    eventTarget.removeEventListener(TERRITORIES_CHANGED_EVENT, eventListener)
  }
}

export function emitTerritoryProgressChanged(
  progress: TerritoryProgressState,
): void {
  eventTarget.dispatchEvent(
    new CustomEvent<TerritoryProgressState>(
      TERRITORY_PROGRESS_CHANGED_EVENT,
      { detail: progress },
    ),
  )
}

export function onTerritoryProgressChanged(
  listener: (progress: TerritoryProgressState) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<TerritoryProgressState>).detail)
  }

  eventTarget.addEventListener(
    TERRITORY_PROGRESS_CHANGED_EVENT,
    eventListener,
  )

  return () => {
    eventTarget.removeEventListener(
      TERRITORY_PROGRESS_CHANGED_EVENT,
      eventListener,
    )
  }
}

export function emitActiveTerritoryChanged(
  territoryId: TerritoryId,
): void {
  eventTarget.dispatchEvent(
    new CustomEvent<TerritoryId>(ACTIVE_TERRITORY_CHANGED_EVENT, {
      detail: territoryId,
    }),
  )
}

export function onActiveTerritoryChanged(
  listener: (territoryId: TerritoryId) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<TerritoryId>).detail)
  }

  eventTarget.addEventListener(ACTIVE_TERRITORY_CHANGED_EVENT, eventListener)

  return () => {
    eventTarget.removeEventListener(
      ACTIVE_TERRITORY_CHANGED_EVENT,
      eventListener,
    )
  }
}

export function requestTerritoryEntry(territoryId: TerritoryId): void {
  eventTarget.dispatchEvent(
    new CustomEvent<TerritoryId>(TERRITORY_ENTRY_REQUESTED_EVENT, {
      detail: territoryId,
    }),
  )
}

export function onTerritoryEntryRequested(
  listener: (territoryId: TerritoryId) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<TerritoryId>).detail)
  }

  eventTarget.addEventListener(TERRITORY_ENTRY_REQUESTED_EVENT, eventListener)

  return () => {
    eventTarget.removeEventListener(
      TERRITORY_ENTRY_REQUESTED_EVENT,
      eventListener,
    )
  }
}

export function emitMissionBoardChanged(board: MissionBoardState): void {
  eventTarget.dispatchEvent(
    new CustomEvent<MissionBoardState>(MISSION_BOARD_CHANGED_EVENT, {
      detail: board,
    }),
  )
}

export function onMissionBoardChanged(
  listener: (board: MissionBoardState) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<MissionBoardState>).detail)
  }

  eventTarget.addEventListener(MISSION_BOARD_CHANGED_EVENT, eventListener)

  return () => {
    eventTarget.removeEventListener(MISSION_BOARD_CHANGED_EVENT, eventListener)
  }
}

export function requestMissionCompletion(missionId: MissionId): void {
  eventTarget.dispatchEvent(
    new CustomEvent<MissionId>(MISSION_COMPLETION_REQUESTED_EVENT, {
      detail: missionId,
    }),
  )
}

export function onMissionCompletionRequested(
  listener: (missionId: MissionId) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<MissionId>).detail)
  }

  eventTarget.addEventListener(
    MISSION_COMPLETION_REQUESTED_EVENT,
    eventListener,
  )

  return () => {
    eventTarget.removeEventListener(
      MISSION_COMPLETION_REQUESTED_EVENT,
      eventListener,
    )
  }
}

export function emitJourneyChanged(journey: JourneyState): void {
  eventTarget.dispatchEvent(
    new CustomEvent<JourneyState>(JOURNEY_CHANGED_EVENT, {
      detail: journey,
    }),
  )
}

export function onJourneyChanged(
  listener: (journey: JourneyState) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<JourneyState>).detail)
  }

  eventTarget.addEventListener(JOURNEY_CHANGED_EVENT, eventListener)

  return () => {
    eventTarget.removeEventListener(JOURNEY_CHANGED_EVENT, eventListener)
  }
}

export function emitJourneyFoundationCompleted(
  journey: JourneyState,
): void {
  eventTarget.dispatchEvent(
    new CustomEvent<JourneyState>(JOURNEY_FOUNDATION_COMPLETED_EVENT, {
      detail: journey,
    }),
  )
}

export function onJourneyFoundationCompleted(
  listener: (journey: JourneyState) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<JourneyState>).detail)
  }

  eventTarget.addEventListener(
    JOURNEY_FOUNDATION_COMPLETED_EVENT,
    eventListener,
  )

  return () => {
    eventTarget.removeEventListener(
      JOURNEY_FOUNDATION_COMPLETED_EVENT,
      eventListener,
    )
  }
}

export function emitCareerStateChanged(state: CareerState): void {
  eventTarget.dispatchEvent(
    new CustomEvent<CareerState>(CAREER_STATE_CHANGED_EVENT, {
      detail: state,
    }),
  )
}

export function onCareerStateChanged(
  listener: (state: CareerState) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<CareerState>).detail)
  }

  eventTarget.addEventListener(CAREER_STATE_CHANGED_EVENT, eventListener)

  return () => {
    eventTarget.removeEventListener(CAREER_STATE_CHANGED_EVENT, eventListener)
  }
}

export function requestCareerPathSelection(pathId: CareerPathId): void {
  eventTarget.dispatchEvent(
    new CustomEvent<CareerPathId>(CAREER_PATH_SELECTION_REQUESTED_EVENT, {
      detail: pathId,
    }),
  )
}

export function onCareerPathSelectionRequested(
  listener: (pathId: CareerPathId) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<CareerPathId>).detail)
  }

  eventTarget.addEventListener(
    CAREER_PATH_SELECTION_REQUESTED_EVENT,
    eventListener,
  )

  return () => {
    eventTarget.removeEventListener(
      CAREER_PATH_SELECTION_REQUESTED_EVENT,
      eventListener,
    )
  }
}

export function requestCareerMilestoneCompletion(
  milestoneId: CareerMilestoneId,
): void {
  eventTarget.dispatchEvent(
    new CustomEvent<CareerMilestoneId>(
      CAREER_MILESTONE_COMPLETION_REQUESTED_EVENT,
      { detail: milestoneId },
    ),
  )
}

export function onCareerMilestoneCompletionRequested(
  listener: (milestoneId: CareerMilestoneId) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<CareerMilestoneId>).detail)
  }

  eventTarget.addEventListener(
    CAREER_MILESTONE_COMPLETION_REQUESTED_EVENT,
    eventListener,
  )

  return () => {
    eventTarget.removeEventListener(
      CAREER_MILESTONE_COMPLETION_REQUESTED_EVENT,
      eventListener,
    )
  }
}

export function emitOracleStateChanged(state: OracleState): void {
  eventTarget.dispatchEvent(
    new CustomEvent<OracleState>(ORACLE_STATE_CHANGED_EVENT, {
      detail: state,
    }),
  )
}

export function onOracleStateChanged(
  listener: (state: OracleState) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<OracleState>).detail)
  }

  eventTarget.addEventListener(ORACLE_STATE_CHANGED_EVENT, eventListener)

  return () => {
    eventTarget.removeEventListener(ORACLE_STATE_CHANGED_EVENT, eventListener)
  }
}

export function requestOracleQuestion(question: string): void {
  eventTarget.dispatchEvent(
    new CustomEvent<string>(ORACLE_QUESTION_REQUESTED_EVENT, {
      detail: question,
    }),
  )
}

export function onOracleQuestionRequested(
  listener: (question: string) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<string>).detail)
  }

  eventTarget.addEventListener(ORACLE_QUESTION_REQUESTED_EVENT, eventListener)

  return () => {
    eventTarget.removeEventListener(
      ORACLE_QUESTION_REQUESTED_EVENT,
      eventListener,
    )
  }
}

export function requestOracleClose(): void {
  eventTarget.dispatchEvent(new Event(ORACLE_CLOSE_REQUESTED_EVENT))
}

export function onOracleCloseRequested(listener: () => void): () => void {
  eventTarget.addEventListener(ORACLE_CLOSE_REQUESTED_EVENT, listener)

  return () => {
    eventTarget.removeEventListener(ORACLE_CLOSE_REQUESTED_EVENT, listener)
  }
}

export function emitInsightsChanged(insights: InsightsSnapshot): void {
  eventTarget.dispatchEvent(
    new CustomEvent<InsightsSnapshot>(INSIGHTS_CHANGED_EVENT, {
      detail: insights,
    }),
  )
}

export function onInsightsChanged(
  listener: (insights: InsightsSnapshot) => void,
): () => void {
  const eventListener = (event: Event) => {
    listener((event as CustomEvent<InsightsSnapshot>).detail)
  }

  eventTarget.addEventListener(INSIGHTS_CHANGED_EVENT, eventListener)

  return () => {
    eventTarget.removeEventListener(INSIGHTS_CHANGED_EVENT, eventListener)
  }
}

export function requestProgressExport(): void {
  eventTarget.dispatchEvent(new Event(PROGRESS_EXPORT_REQUESTED_EVENT))
}

export function onProgressExportRequested(listener: () => void): () => void {
  eventTarget.addEventListener(PROGRESS_EXPORT_REQUESTED_EVENT, listener)

  return () => {
    eventTarget.removeEventListener(PROGRESS_EXPORT_REQUESTED_EVENT, listener)
  }
}

export function requestProgressReset(): void {
  eventTarget.dispatchEvent(new Event(PROGRESS_RESET_REQUESTED_EVENT))
}

export function onProgressResetRequested(listener: () => void): () => void {
  eventTarget.addEventListener(PROGRESS_RESET_REQUESTED_EVENT, listener)

  return () => {
    eventTarget.removeEventListener(PROGRESS_RESET_REQUESTED_EVENT, listener)
  }
}
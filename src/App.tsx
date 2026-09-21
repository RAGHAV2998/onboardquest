import { useEffect, useRef, useState } from 'react'
import type Phaser from 'phaser'
import {
  AchievementNotifications,
  type QueuedAchievementNotification,
} from './components/AchievementNotifications'
import { AccountPanel } from './components/AccountPanel'
import { CareerPaths } from './components/CareerPaths'
import { ContentStudio } from './components/ContentStudio'
import { DialoguePanel } from './components/DialoguePanel'
import { DashboardSummary } from './components/DashboardSummary'
import { ExecutiveInsightsDashboard } from './components/ExecutiveInsightsDashboard'
import { JourneyCompletionScreen } from './components/JourneyCompletionScreen'
import { JourneyMap } from './components/JourneyMap'
import { MentorProfilePanel } from './components/MentorProfilePanel'
import { MissionBoard } from './components/MissionBoard'
import { OraclePanel } from './components/OraclePanel'
import { PlayerProfile } from './components/PlayerProfile'
import { RecommendationPanel } from './components/RecommendationPanel'
import { QuestPanel } from './components/QuestPanel'
import { TerritoryMap } from './components/TerritoryMap'
import { TerritoryProgressPanel } from './components/TerritoryProgressPanel'
import { contentRegistry } from './content/ContentRegistry'
import { AuthManager } from './app/AuthManager'
import { ProfileStore } from './app/ProfileStore'
import { createGame } from './game/createGame'
import {
  onAchievementNotification,
  onActiveTerritoryChanged,
  onBadgesChanged,
  onCareerStateChanged,
  onDialogueChanged,
  onInsightsChanged,
  onJourneyChanged,
  onJourneyFoundationCompleted,
  onMissionBoardChanged,
  onOracleStateChanged,
  onPlayerProgressChanged,
  onQuestStateChanged,
  onTerritoriesChanged,
  onTerritoryProgressChanged,
  requestCareerMilestoneCompletion,
  requestCareerPathSelection,
  requestMissionCompletion,
  requestOracleClose,
  requestOracleQuestion,
  requestProgressExport,
  requestProgressReset,
  requestTerritoryEntry,
} from './game/events/gameEvents'
import type { BadgeDefinition } from './types/badge'
import type {
  AuthState,
  OnboardingProfile,
  OnboardingProfileDraft,
  ProfileSaveResult,
} from './types/auth'
import type { CareerState } from './types/career'
import type { DialogueEntry } from './types/dialogue'
import type { JourneyState } from './types/journey'
import type { InsightsSnapshot } from './types/insights'
import type { MissionBoardState } from './types/mission'
import type { OracleState } from './types/oracle'
import type { PlayerProgress } from './types/progression'
import type { QuestState } from './types/quest'
import type {
  TerritoryId,
  TerritoryProgressState,
  TerritoryState,
} from './types/territory'

type AppView =
  | 'world'
  | 'journey'
  | 'territories'
  | 'missions'
  | 'career'
  | 'insights'
  | 'studio'

function App() {
  const [authManager] = useState(() => new AuthManager())
  const [profileStore] = useState(
    () => new ProfileStore(window.localStorage),
  )
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const [appView, setAppView] = useState<AppView>('world')
  const [activeTerritoryId, setActiveTerritoryId] =
    useState<TerritoryId>('team')
  const [territoryStates, setTerritoryStates] = useState<
    readonly TerritoryState[]
  >([])
  const [territoryProgress, setTerritoryProgress] = useState<
    readonly TerritoryProgressState[]
  >([])
  const [activeDialogue, setActiveDialogue] =
    useState<DialogueEntry | null>(null)
  const [questStates, setQuestStates] = useState<readonly QuestState[]>([])
  const [missionBoard, setMissionBoard] =
    useState<MissionBoardState | null>(null)
  const [journeyState, setJourneyState] = useState<JourneyState | null>(null)
  const [journeyCompletion, setJourneyCompletion] =
    useState<JourneyState | null>(null)
  const [careerState, setCareerState] = useState<CareerState | null>(null)
  const [oracleState, setOracleState] = useState<OracleState | null>(null)
  const [insights, setInsights] = useState<InsightsSnapshot | null>(null)
  const [authState, setAuthState] = useState<AuthState>({
    status: 'loading',
    managedAuthAvailable: false,
    user: null,
  })
  const [onboardingProfile, setOnboardingProfile] =
    useState<OnboardingProfile | null>(() => profileStore.getProfile())
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress | null>(
    null,
  )
  const [unlockedBadges, setUnlockedBadges] = useState<
    readonly BadgeDefinition[]
  >([])
  const [achievementNotifications, setAchievementNotifications] = useState<
    readonly QueuedAchievementNotification[]
  >([])
  const nextNotificationIdRef = useRef(1)

  useEffect(() => {
    let active = true

    void authManager.load().then((state) => {
      if (active) {
        setAuthState(state)
      }
    })

    return () => {
      active = false
    }
  }, [authManager])

  useEffect(() => {
    const gameContainer = gameContainerRef.current

    if (!gameContainer) {
      return
    }

    const unsubscribeDialogue = onDialogueChanged(setActiveDialogue)
    const unsubscribeQuestState = onQuestStateChanged((quest) => {
      setQuestStates((currentQuests) => {
        const existingQuest = currentQuests.some(
          ({ questId }) => questId === quest.questId,
        )

        if (!existingQuest) {
          return [...currentQuests, quest]
        }

        return currentQuests.map((currentQuest) =>
          currentQuest.questId === quest.questId ? quest : currentQuest,
        )
      })
    })
    const unsubscribePlayerProgress = onPlayerProgressChanged(setPlayerProgress)
    const unsubscribeBadges = onBadgesChanged(setUnlockedBadges)
    const unsubscribeAchievements = onAchievementNotification(
      (notification) => {
        const queuedNotification = {
          ...notification,
          id: nextNotificationIdRef.current,
        }
        nextNotificationIdRef.current += 1
        setAchievementNotifications((currentNotifications) => [
          ...currentNotifications,
          queuedNotification,
        ])
      },
    )
    const unsubscribeTerritories = onTerritoriesChanged(setTerritoryStates)
    const unsubscribeTerritoryProgress = onTerritoryProgressChanged(
      (progress) => {
        setTerritoryProgress((currentProgress) => {
          const exists = currentProgress.some(
            ({ territoryId }) => territoryId === progress.territoryId,
          )

          if (!exists) {
            return [...currentProgress, progress]
          }

          return currentProgress.map((current) =>
            current.territoryId === progress.territoryId ? progress : current,
          )
        })
      },
    )
    const unsubscribeActiveTerritory = onActiveTerritoryChanged(
      setActiveTerritoryId,
    )
    const unsubscribeMissionBoard = onMissionBoardChanged(setMissionBoard)
    const unsubscribeJourney = onJourneyChanged(setJourneyState)
    const unsubscribeJourneyCompletion = onJourneyFoundationCompleted(
      setJourneyCompletion,
    )
    const unsubscribeCareerState = onCareerStateChanged(setCareerState)
    const unsubscribeOracleState = onOracleStateChanged(setOracleState)
    const unsubscribeInsights = onInsightsChanged(setInsights)
    const game = createGame(gameContainer)
    gameRef.current = game

    return () => {
      unsubscribeDialogue()
      unsubscribeQuestState()
      unsubscribePlayerProgress()
      unsubscribeBadges()
      unsubscribeAchievements()
      unsubscribeTerritories()
      unsubscribeTerritoryProgress()
      unsubscribeActiveTerritory()
      unsubscribeMissionBoard()
      unsubscribeJourney()
      unsubscribeJourneyCompletion()
      unsubscribeCareerState()
      unsubscribeOracleState()
      unsubscribeInsights()
      game.destroy(true)
      gameRef.current = null
    }
  }, [])

  useEffect(() => {
    if (appView !== 'world') {
      return
    }

    const frameId = window.requestAnimationFrame(() => {
      gameRef.current?.scale.refresh()
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [appView])

  const activeTerritory = territoryStates.find(
    ({ territoryId }) => territoryId === activeTerritoryId,
  )
  const activeTerritoryProgress =
    territoryProgress.find(
      ({ territoryId }) => territoryId === activeTerritoryId,
    ) ?? null
  const visibleQuests = questStates.filter((quest) =>
    activeTerritory?.quests.includes(quest.questId),
  )
  const pageTitle =
    appView === 'territories'
      ? 'Territory Map'
      : appView === 'journey'
        ? 'Onboarding Journey'
        : appView === 'missions'
          ? 'First Week Missions'
          : appView === 'career'
            ? 'Career Paths'
            : appView === 'insights'
              ? 'Executive Insights'
              : appView === 'studio'
                ? 'Content Studio'
            : activeTerritoryId === 'documentation'
              ? 'Documentation Area'
              : activeTerritoryId === 'mentor-tower'
                ? 'Mentor Tower'
                : 'Team Village'

  const selectTerritory = (territoryId: TerritoryId) => {
    const territory = territoryStates.find(
      (candidate) => candidate.territoryId === territoryId,
    )

    if (!territory?.unlocked || !territory.sceneKey) {
      return
    }

    requestTerritoryEntry(territoryId)
    setAppView('world')
  }

  const saveOnboardingProfile = (
    draft: OnboardingProfileDraft,
  ): ProfileSaveResult => {
    const result = profileStore.save(draft)

    if (result.ok) {
      setOnboardingProfile(result.profile)
    }

    return result
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-mark" aria-hidden="true">
          OQ
        </div>
        <div>
          <p className="product-name">OnboardQuest</p>
          <h1 id="scene-title">{pageTitle}</h1>
        </div>
        <div className="header-actions">
          <div className="view-tabs" role="tablist" aria-label="Views">
            <button
              type="button"
              role="tab"
              aria-selected={appView === 'world'}
              onClick={() => setAppView('world')}
            >
              World
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={appView === 'journey'}
              onClick={() => setAppView('journey')}
            >
              Journey
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={appView === 'territories'}
              onClick={() => setAppView('territories')}
            >
              Territories
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={appView === 'missions'}
              onClick={() => setAppView('missions')}
            >
              Missions
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={appView === 'career'}
              onClick={() => setAppView('career')}
            >
              Career
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={appView === 'insights'}
              onClick={() => setAppView('insights')}
            >
              Insights
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={appView === 'studio'}
              onClick={() => setAppView('studio')}
            >
              Studio
            </button>
          </div>
          <span className="prototype-label">Local prototype</span>
          <AccountPanel
            auth={authState}
            profile={onboardingProfile}
            microsoftLoginUrl={authManager.getLoginUrl('aad')}
            githubLoginUrl={authManager.getLoginUrl('github')}
            logoutUrl={authManager.getLogoutUrl()}
            onSaveProfile={saveOnboardingProfile}
          />
        </div>
      </header>

      <div
        className={`play-layout${
          appView === 'world' ? '' : ' play-layout-inactive'
        }`}
        aria-hidden={appView !== 'world'}
      >
        <section className="game-frame" aria-labelledby="scene-title">
          <p id="game-controls" className="sr-only">
            Use the arrow keys or W, A, S, and D to move the player. Press E
            when the talk indicator appears near a team member.
          </p>
          <div
            ref={gameContainerRef}
            className="game-container"
            aria-describedby="game-controls"
          />
          <DialoguePanel dialogue={activeDialogue} />
          <OraclePanel
            state={oracleState}
            onAsk={requestOracleQuestion}
            onClose={requestOracleClose}
          />
        </section>

        <div className="side-panels">
          <AchievementNotifications
            notifications={achievementNotifications}
            setNotifications={setAchievementNotifications}
          />
          <PlayerProfile
            progress={playerProgress}
            badges={unlockedBadges}
          />
          <DashboardSummary
            quests={questStates}
            territories={territoryStates}
            missions={missionBoard}
            journey={journeyState}
            career={careerState}
          />
          <RecommendationPanel journey={journeyState} career={careerState} />
          {activeTerritoryId === 'mentor-tower' && (
            <MentorProfilePanel profile={contentRegistry.mentorProfile} />
          )}
          <TerritoryProgressPanel progress={activeTerritoryProgress} />
          <QuestPanel quests={visibleQuests} />
        </div>
      </div>

      {appView === 'territories' && (
        <TerritoryMap
          territories={territoryStates}
          onSelect={selectTerritory}
        />
      )}

      {appView === 'journey' && (
        <div className="journey-view">
          <div className="journey-view-main">
            <JourneyMap journey={journeyState} />
          </div>
          <div className="journey-view-side">
            <RecommendationPanel journey={journeyState} career={careerState} />
            <DashboardSummary
              quests={questStates}
              territories={territoryStates}
              missions={missionBoard}
              journey={journeyState}
              career={careerState}
            />
          </div>
        </div>
      )}

      {appView === 'missions' && (
        <div className="mission-view">
          <DashboardSummary
            quests={questStates}
            territories={territoryStates}
            missions={missionBoard}
            journey={journeyState}
            career={careerState}
          />
          <MissionBoard
            board={missionBoard}
            onComplete={requestMissionCompletion}
          />
        </div>
      )}

      {appView === 'career' && (
        <div className="career-view">
          <RecommendationPanel journey={journeyState} career={careerState} />
          <CareerPaths
            career={careerState}
            onSelectPath={requestCareerPathSelection}
            onCompleteMilestone={requestCareerMilestoneCompletion}
          />
        </div>
      )}

      {appView === 'studio' && (
        <ContentStudio registry={contentRegistry} />
      )}

      {appView === 'insights' && (
        <ExecutiveInsightsDashboard
          insights={insights}
          onExport={requestProgressExport}
          onReset={requestProgressReset}
        />
      )}

      <JourneyCompletionScreen
        journey={journeyCompletion}
        progress={playerProgress}
        badges={unlockedBadges}
        onDismiss={() => setJourneyCompletion(null)}
      />
    </main>
  )
}

export default App
import type { CareerState } from '../types/career'
import type { MissionBoardState } from '../types/mission'
import type { JourneyState } from '../types/journey'
import type { QuestState } from '../types/quest'
import type { TerritoryState } from '../types/territory'

type DashboardSummaryProps = {
  readonly quests: readonly QuestState[]
  readonly territories: readonly TerritoryState[]
  readonly missions: MissionBoardState | null
  readonly journey: JourneyState | null
  readonly career: CareerState | null
}

export function DashboardSummary({
  quests,
  territories,
  missions,
  journey,
  career,
}: DashboardSummaryProps) {
  const completedQuests = quests.filter(({ completed }) => completed).length
  const completedTerritories = territories.filter(
    ({ completed }) => completed,
  ).length
  const recommendation =
    journey?.activeStageId === 'become-productive' && career
      ? career.recommendation
      : journey?.recommendation?.text

  return (
    <section className="dashboard-summary" aria-label="Player dashboard">
      <p className="dashboard-label">Overall Onboarding Progress</p>
      <div className="dashboard-metrics">
        <div>
          <span>Stage Progress</span>
          <strong>
            {journey?.completedCount ?? 0} / {journey?.totalCount ?? 0}
          </strong>
        </div>
        <div>
          <span>Quest Progress</span>
          <strong>
            {completedQuests} / {quests.length}
          </strong>
        </div>
        <div>
          <span>Mission Progress</span>
          <strong>
            {missions?.completedCount ?? 0} / {missions?.totalCount ?? 0}
          </strong>
        </div>
        <div>
          <span>Territory Progress</span>
          <strong>
            {completedTerritories} / {territories.length}
          </strong>
        </div>
      </div>
      <div className="dashboard-career-summary">
        <div>
          <span>Current Career Path</span>
          <strong>{career?.currentPath?.title ?? 'Not selected'}</strong>
        </div>
        <div>
          <span>Current Milestone</span>
          <strong>{career?.currentMilestone?.title ?? 'Not selected'}</strong>
        </div>
        <div>
          <span>Next Recommended Step</span>
          <strong>{recommendation ?? 'Continue onboarding.'}</strong>
        </div>
      </div>
    </section>
  )
}
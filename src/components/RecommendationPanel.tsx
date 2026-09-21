import type { CareerState } from '../types/career'
import type { JourneyState } from '../types/journey'

type RecommendationPanelProps = {
  readonly journey: JourneyState | null
  readonly career: CareerState | null
}

export function RecommendationPanel({
  journey,
  career,
}: RecommendationPanelProps) {
  if (!journey?.recommendation) {
    return null
  }

  const currentNode = journey.nodes.find(
    ({ stageId }) => stageId === journey.recommendation?.stageId,
  )
  const recommendation =
    journey.activeStageId === 'become-productive' && career
      ? career.recommendation
      : journey.recommendation.text

  return (
    <aside className="recommendation-panel" aria-label="Current recommendation">
      <p>Current Recommendation</p>
      <strong>{recommendation}</strong>
      {currentNode && <span>Stage {currentNode.order}: {currentNode.title}</span>}
    </aside>
  )
}
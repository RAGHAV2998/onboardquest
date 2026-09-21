import type { JourneyNodeStatus, JourneyState } from '../types/journey'

type JourneyMapProps = {
  readonly journey: JourneyState | null
}

const statusLabels: Record<JourneyNodeStatus, string> = {
  locked: 'Locked',
  available: 'Available',
  inProgress: 'In Progress',
  completed: 'Completed',
}

const statusIcons: Record<JourneyNodeStatus, string> = {
  locked: '\uD83D\uDD12',
  available: '\u25CB',
  inProgress: '\u2B50',
  completed: '\u2705',
}

export function JourneyMap({ journey }: JourneyMapProps) {
  if (!journey) {
    return null
  }

  return (
    <section className="journey-map" aria-labelledby="journey-map-title">
      <header className="journey-map-header">
        <div>
          <p>Onboarding path</p>
          <h2 id="journey-map-title">Journey Map</h2>
        </div>
        <strong>
          {journey.completedCount} / {journey.totalCount} stages
        </strong>
      </header>

      <ol className="journey-nodes">
        {journey.nodes.map((node, index) => (
          <li key={node.stageId}>
            <article
              className="journey-node"
              data-status={node.status}
              aria-current={node.status === 'inProgress' ? 'step' : undefined}
            >
              <span className="journey-node-icon" aria-hidden="true">
                {statusIcons[node.status]}
              </span>
              <span className="journey-node-order">Stage {node.order}</span>
              <span className="journey-node-copy">
                <strong>{node.title}</strong>
                <small>{node.description}</small>
              </span>
              <span className="journey-node-status">
                {statusLabels[node.status]}
              </span>
            </article>
            {index < journey.nodes.length - 1 && (
              <span className="journey-connector" aria-hidden="true">
                {'\u2193'}
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
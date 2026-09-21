import type { TerritoryProgressState } from '../types/territory'

type TerritoryProgressPanelProps = {
  readonly progress: TerritoryProgressState | null
}

export function TerritoryProgressPanel({
  progress,
}: TerritoryProgressPanelProps) {
  if (!progress || progress.objects.length === 0) {
    return null
  }

  return (
    <aside className="territory-progress-panel" aria-label="Territory progress">
      <p className="territory-progress-label">Territory progress</p>
      <h2>{progress.title}</h2>
      <ul className="territory-progress-list">
        {progress.objects.map((object) => (
          <li key={object.objectId}>
            <span
              className={`objective-box${
                object.discovered ? ' objective-box-complete' : ''
              }`}
              aria-hidden="true"
            />
            <span>{object.title}</span>
            <span className="sr-only">
              {object.discovered ? ' discovered' : ' not discovered'}
            </span>
          </li>
        ))}
      </ul>
      <div className="territory-progress-summary">
        <span>Progress</span>
        <strong>
          {progress.discoveredCount} / {progress.totalCount}
        </strong>
      </div>
    </aside>
  )
}
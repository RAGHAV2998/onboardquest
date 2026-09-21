import type { TerritoryId, TerritoryState } from '../types/territory'

type TerritoryMapProps = {
  readonly territories: readonly TerritoryState[]
  readonly onSelect: (territoryId: TerritoryId) => void
}

export function TerritoryMap({
  territories,
  onSelect,
}: TerritoryMapProps) {
  return (
    <section className="territory-map" aria-labelledby="territory-map-title">
      <header className="territory-map-header">
        <p>Organization</p>
        <h2 id="territory-map-title">Territory Map</h2>
      </header>

      <div className="territory-grid">
        {territories.map((territory) => {
          const playable = territory.unlocked && territory.sceneKey !== null
          const stateLabel = !territory.unlocked
            ? 'Locked'
            : territory.completed
              ? 'Complete'
              : territory.sceneKey
                ? 'In progress'
                : 'Unlocked'

          return (
            <button
              key={territory.territoryId}
              className="territory-card"
              type="button"
              disabled={!playable}
              onClick={() => onSelect(territory.territoryId)}
            >
              <span className="territory-icon" aria-hidden="true">
                {territory.icon}
              </span>
              <span className="territory-card-copy">
                <strong>{territory.title}</strong>
                <span>{territory.description}</span>
              </span>
              <span
                className={`territory-card-state territory-card-state-${
                  territory.unlocked ? 'open' : 'locked'
                }`}
              >
                {!territory.unlocked && (
                  <span aria-hidden="true">{'\uD83D\uDD12 '}</span>
                )}
                {stateLabel}
              </span>
              {!territory.unlocked && (
                <span className="territory-level">
                  Requires Level {territory.requiredLevel}
                  {territory.unlockHint
                    ? ` and ${territory.unlockHint}`
                    : ''}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
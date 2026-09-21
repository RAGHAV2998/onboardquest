import { useState } from 'react'
import type { ContentRegistry } from '../content/ContentRegistry'
import type { CareerPath } from '../types/career'
import type {
  ContentCategory,
  ContentDependency,
  ContentPreview,
  ContentReference,
} from '../types/content'
import type { DialogueEntry } from '../types/dialogue'
import type { MissionDefinition } from '../types/mission'
import type { NpcDefinition } from '../types/npc'
import type { QuestDefinition } from '../types/quest'
import type { TerritoryDefinition } from '../types/territory'

const categoryLabels: Record<ContentCategory, string> = {
  npcs: 'NPCs',
  dialogues: 'Dialogue',
  quests: 'Quests',
  territories: 'Territories',
  missions: 'Missions',
  careerPaths: 'Career paths',
}

type ContentStudioProps = {
  readonly registry: ContentRegistry
}

type ContentDetailsProps = {
  readonly preview: ContentPreview
  readonly registry: ContentRegistry
}

function sameReference(
  left: ContentReference,
  right: ContentReference,
): boolean {
  return left.category === right.category && left.id === right.id
}

function formatToken(value: string): string {
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function ContentDetails({ preview, registry }: ContentDetailsProps) {
  switch (preview.reference.category) {
    case 'npcs': {
      const npc = preview.value as NpcDefinition
      const profile = npc.id === 'mentor' ? registry.mentorProfile : null

      return (
        <>
          <dl className="studio-field-grid">
            <div>
              <dt>World</dt>
              <dd>{formatToken(npc.mapId)}</dd>
            </div>
            <div>
              <dt>Position</dt>
              <dd>
                {npc.position.x}, {npc.position.y}
              </dd>
            </div>
            <div>
              <dt>Interaction radius</dt>
              <dd>{npc.interactionRadius}px</dd>
            </div>
            <div>
              <dt>Appearance</dt>
              <dd>{formatToken(npc.appearance ?? 'standard')}</dd>
            </div>
          </dl>
          {profile && (
            <dl className="studio-profile-fields">
              <div>
                <dt>Role</dt>
                <dd>{profile.role}</dd>
              </div>
              <div>
                <dt>Profile</dt>
                <dd>{profile.summary}</dd>
              </div>
              <div>
                <dt>How they can help</dt>
                <dd>{profile.howTheyCanHelp}</dd>
              </div>
            </dl>
          )}
        </>
      )
    }
    case 'dialogues': {
      const dialogue = preview.value as DialogueEntry
      const nextDialogue = dialogue.nextDialogueId
        ? registry.getDialogue(dialogue.nextDialogueId)
        : null

      return (
        <>
          <blockquote className="studio-dialogue-preview">
            <strong>{dialogue.npcName}</strong>
            <p>{dialogue.text}</p>
          </blockquote>
          <dl className="studio-field-grid">
            <div>
              <dt>Sequence</dt>
              <dd>{nextDialogue ? `Continues to ${nextDialogue.text}` : 'End'}</dd>
            </div>
          </dl>
        </>
      )
    }
    case 'quests': {
      const quest = preview.value as QuestDefinition

      return (
        <>
          <dl className="studio-field-grid">
            <div>
              <dt>Reward</dt>
              <dd>{quest.rewardXp} XP</dd>
            </div>
            <div>
              <dt>Objectives</dt>
              <dd>{quest.objectives.length}</dd>
            </div>
          </dl>
          <ol className="studio-step-list">
            {quest.objectives.map((objective) => (
              <li key={objective.objectiveId}>
                <strong>{objective.label}</strong>
                <span>
                  {objective.completionRule.type === 'completeDialogue'
                    ? 'Complete dialogue'
                    : 'Discover object'}
                </span>
              </li>
            ))}
          </ol>
        </>
      )
    }
    case 'territories': {
      const territory = preview.value as TerritoryDefinition

      return (
        <dl className="studio-field-grid">
          <div>
            <dt>Required level</dt>
            <dd>{territory.requiredLevel}</dd>
          </div>
          <div>
            <dt>Playable scene</dt>
            <dd>{territory.sceneKey ? formatToken(territory.sceneKey) : 'Not available'}</dd>
          </div>
          <div>
            <dt>Quests</dt>
            <dd>
              {territory.quests.length > 0
                ? territory.quests
                    .map((questId) => registry.getQuest(questId)?.title ?? questId)
                    .join(', ')
                : 'None'}
            </dd>
          </div>
          <div>
            <dt>Unlock</dt>
            <dd>{territory.unlockHint ?? 'Available by level'}</dd>
          </div>
        </dl>
      )
    }
    case 'missions': {
      const mission = preview.value as MissionDefinition

      return (
        <dl className="studio-field-grid">
          <div>
            <dt>Category</dt>
            <dd>{formatToken(mission.category)}</dd>
          </div>
          <div>
            <dt>Reward</dt>
            <dd>{mission.rewardXp} XP</dd>
          </div>
          <div>
            <dt>Completion</dt>
            <dd>Manual confirmation</dd>
          </div>
          <div>
            <dt>Initial state</dt>
            <dd>{formatToken(mission.initialStatus)}</dd>
          </div>
        </dl>
      )
    }
    case 'careerPaths': {
      const path = preview.value as CareerPath

      return (
        <>
          <dl className="studio-field-grid">
            <div>
              <dt>Milestones</dt>
              <dd>{path.track.milestones.length}</dd>
            </div>
            <div>
              <dt>Unlock</dt>
              <dd>
                {registry.getDialogue(path.unlockRule.dialogueId)?.text ??
                  'Dialogue unavailable'}
              </dd>
            </div>
          </dl>
          <ol className="studio-step-list">
            {path.track.milestones.map((milestone) => (
              <li key={milestone.milestoneId}>
                <strong>
                  {milestone.order}. {milestone.title}
                </strong>
                <span>{milestone.description}</span>
              </li>
            ))}
          </ol>
        </>
      )
    }
  }
}

function DependencyRow({
  dependency,
  selected,
  registry,
  developerMode,
  onNavigate,
}: {
  readonly dependency: ContentDependency
  readonly selected: ContentReference
  readonly registry: ContentRegistry
  readonly developerMode: boolean
  readonly onNavigate: (reference: ContentReference) => void
}) {
  const related = sameReference(dependency.from, selected)
    ? dependency.to
    : dependency.from
  const fromTitle = registry.getPreview(dependency.from)?.title ?? dependency.from.id
  const toTitle = registry.getPreview(dependency.to)?.title ?? dependency.to.id

  return (
    <button
      type="button"
      className="studio-dependency-row"
      onClick={() => onNavigate(related)}
    >
      <span data-current={sameReference(dependency.from, selected)}>
        {fromTitle}
        {developerMode && <small>{dependency.from.id}</small>}
      </span>
      <strong>{dependency.relationship}</strong>
      <span data-current={sameReference(dependency.to, selected)}>
        {toTitle}
        {developerMode && <small>{dependency.to.id}</small>}
      </span>
    </button>
  )
}

export function ContentStudio({ registry }: ContentStudioProps) {
  const firstPreview = registry.getPreviews('npcs')[0]
  const [selectedCategory, setSelectedCategory] =
    useState<ContentCategory>('npcs')
  const [selectedReference, setSelectedReference] = useState<ContentReference>(
    firstPreview?.reference ?? { category: 'npcs', id: '' },
  )
  const [developerMode, setDeveloperMode] = useState(false)
  const previews = registry.getPreviews(selectedCategory)
  const selectedPreview = registry.getPreview(selectedReference) ?? previews[0]
  const dependencies = selectedPreview
    ? registry.getDependencies(selectedPreview.reference)
    : []
  const report = registry.validationReport

  const navigateTo = (reference: ContentReference) => {
    setSelectedCategory(reference.category)
    setSelectedReference(reference)
  }

  const selectCategory = (category: ContentCategory) => {
    setSelectedCategory(category)
    const firstCategoryPreview = registry.getPreviews(category)[0]

    if (firstCategoryPreview) {
      setSelectedReference(firstCategoryPreview.reference)
    }
  }

  return (
    <section className="content-studio" aria-label="Onboarding Content Studio">
      <header className="studio-toolbar">
        <div>
          <p>Content Registry</p>
          <h2>Onboarding Content Studio</h2>
        </div>
        <div className="studio-toolbar-actions">
          <span
            className="studio-validation-status"
            data-valid={report.isValid}
          >
            {report.isValid
              ? 'Content valid'
              : `${report.errorCount} validation errors`}
          </span>
          <label className="studio-mode-toggle">
            <input
              type="checkbox"
              checked={developerMode}
              onChange={(event) => setDeveloperMode(event.target.checked)}
            />
            <span aria-hidden="true" />
            Developer Mode
          </label>
        </div>
      </header>

      {report.issues.length > 0 && (
        <section className="studio-validation-panel" aria-label="Validation report">
          <div>
            <strong>Validation report</strong>
            <span>
              {report.errorCount} errors, {report.warningCount} warnings
            </span>
          </div>
          <ul>
            {report.issues.map((issue, index) => (
              <li key={`${issue.code}-${index}`} data-severity={issue.severity}>
                {issue.reference && registry.getPreview(issue.reference) ? (
                  <button type="button" onClick={() => navigateTo(issue.reference!)}>
                    {issue.message}
                  </button>
                ) : (
                  <span>{issue.message}</span>
                )}
                {developerMode && <code>{issue.code}</code>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="studio-workspace">
        <nav className="studio-category-nav" aria-label="Content categories">
          {registry.getPreviews().length === 0 && <p>No content loaded.</p>}
          {Object.entries(categoryLabels).map(([category, label]) => {
            const typedCategory = category as ContentCategory
            const count = registry.getPreviews(typedCategory).length

            return (
              <button
                type="button"
                key={category}
                aria-pressed={selectedCategory === category}
                onClick={() => selectCategory(typedCategory)}
              >
                <span>{label}</span>
                <strong>{count}</strong>
              </button>
            )
          })}
        </nav>

        <section className="studio-record-browser" aria-label={`${categoryLabels[selectedCategory]} content`}>
          <header>
            <p>{categoryLabels[selectedCategory]}</p>
            <strong>{previews.length} records</strong>
          </header>
          <div className="studio-record-list">
            {previews.map((preview) => (
              <button
                type="button"
                key={preview.reference.id}
                data-selected={
                  selectedPreview
                    ? sameReference(preview.reference, selectedPreview.reference)
                    : false
                }
                onClick={() => setSelectedReference(preview.reference)}
              >
                <strong>{preview.title}</strong>
                <span>{preview.summary}</span>
                {developerMode && <code>{preview.reference.id}</code>}
              </button>
            ))}
          </div>
        </section>

        <section className="studio-inspector" aria-live="polite">
          {selectedPreview ? (
            <>
              <header className="studio-inspector-header">
                <p>{categoryLabels[selectedPreview.reference.category]}</p>
                <h3>{selectedPreview.title}</h3>
                <span>{selectedPreview.summary}</span>
                {developerMode && <code>{selectedPreview.reference.id}</code>}
              </header>

              <div className="studio-inspector-section">
                <h4>Preview</h4>
                <ContentDetails preview={selectedPreview} registry={registry} />
              </div>

              <div className="studio-inspector-section">
                <h4>Source</h4>
                {selectedPreview.source ? (
                  <dl className="studio-source-fields">
                    {selectedPreview.source.sourceTitle && (
                      <div>
                        <dt>Title</dt>
                        <dd>{selectedPreview.source.sourceTitle}</dd>
                      </div>
                    )}
                    {selectedPreview.source.sourceUrl && (
                      <div>
                        <dt>URL</dt>
                        <dd>
                          <a
                            href={selectedPreview.source.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open source
                          </a>
                        </dd>
                      </div>
                    )}
                    {selectedPreview.source.lastReviewed && (
                      <div>
                        <dt>Last reviewed</dt>
                        <dd>{selectedPreview.source.lastReviewed}</dd>
                      </div>
                    )}
                    {selectedPreview.source.approvedForDemo !== undefined && (
                      <div>
                        <dt>Demo approval</dt>
                        <dd>
                          {selectedPreview.source.approvedForDemo
                            ? 'Approved'
                            : 'Not approved'}
                        </dd>
                      </div>
                    )}
                  </dl>
                ) : (
                  <p className="studio-empty-value">Not provided</p>
                )}
              </div>

              <div className="studio-inspector-section">
                <h4>Dependencies</h4>
                {dependencies.length > 0 ? (
                  <div className="studio-dependency-list">
                    {dependencies.map((dependency, index) => (
                      <DependencyRow
                        key={`${dependency.from.category}-${dependency.from.id}-${dependency.to.category}-${dependency.to.id}-${index}`}
                        dependency={dependency}
                        selected={selectedPreview.reference}
                        registry={registry}
                        developerMode={developerMode}
                        onNavigate={navigateTo}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="studio-empty-value">No registered dependencies</p>
                )}
              </div>

              {developerMode && (
                <div className="studio-inspector-section studio-raw-preview">
                  <h4>Raw record</h4>
                  <pre>{JSON.stringify(selectedPreview.value, null, 2)}</pre>
                </div>
              )}
            </>
          ) : (
            <p className="studio-empty-value">No content available</p>
          )}
        </section>
      </div>
    </section>
  )
}
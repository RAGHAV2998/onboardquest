import { useState } from 'react'
import type {
  CompletionMetric,
  InsightsSnapshot,
} from '../types/insights'
import { ResetProgressDialog } from './ResetProgressDialog'

type InsightsMode = 'employee' | 'manager'

type ExecutiveInsightsDashboardProps = {
  readonly insights: InsightsSnapshot | null
  readonly onExport: () => void
  readonly onReset: () => void
}

function formatTimestamp(timestamp: string | null): string {
  if (!timestamp) {
    return 'Not completed'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp))
}

function CompletionCard({
  label,
  metric,
}: {
  readonly label: string
  readonly metric: CompletionMetric
}) {
  return (
    <article className="insights-completion-card">
      <span>{label}</span>
      <strong>
        {metric.completed} / {metric.total}
      </strong>
      <div
        className="insights-progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={metric.percentage}
      >
        <span style={{ width: `${metric.percentage}%` }} />
      </div>
      <small>{metric.percentage}% complete</small>
    </article>
  )
}

export function ExecutiveInsightsDashboard({
  insights,
  onExport,
  onReset,
}: ExecutiveInsightsDashboardProps) {
  const [mode, setMode] = useState<InsightsMode>('employee')
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  if (!insights) {
    return (
      <section className="insights-loading" aria-live="polite">
        Loading local insights...
      </section>
    )
  }

  return (
    <section className="executive-insights" aria-label="Executive insights">
      <header className="insights-toolbar">
        <div className="insights-mode-tabs" role="tablist" aria-label="Insights mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'employee'}
            onClick={() => setMode('employee')}
          >
            Employee
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'manager'}
            onClick={() => setMode('manager')}
          >
            Manager View
          </button>
        </div>
        <div className="insights-actions">
          <button type="button" onClick={onExport}>
            Download Progress Summary
          </button>
          <button type="button" onClick={() => setResetDialogOpen(true)}>
            Reset Progress
          </button>
        </div>
      </header>

      {mode === 'employee' ? (
        <section className="employee-insights" aria-labelledby="employee-insights-title">
          <header className="insights-section-heading">
            <p>Employee Dashboard</p>
            <h2 id="employee-insights-title">Onboarding Progress</h2>
          </header>
          <div className="insights-completion-grid">
            <CompletionCard
              label="Stage Completion"
              metric={insights.completion.stages}
            />
            <CompletionCard
              label="Territories"
              metric={insights.completion.territories}
            />
            <CompletionCard
              label="Quests"
              metric={insights.completion.quests}
            />
            <CompletionCard
              label="Missions"
              metric={insights.completion.missions}
            />
          </div>
          <dl className="insights-profile-strip">
            <div>
              <dt>Career Path</dt>
              <dd>{insights.progress.careerPath ?? 'Not selected'}</dd>
            </div>
            <div>
              <dt>Current Milestone</dt>
              <dd>{insights.progress.currentMilestone ?? 'Not selected'}</dd>
            </div>
            <div>
              <dt>Level</dt>
              <dd>{insights.progress.level}</dd>
            </div>
            <div>
              <dt>XP</dt>
              <dd>{insights.progress.totalXp}</dd>
            </div>
            <div>
              <dt>Badges</dt>
              <dd>{insights.progress.badgeCount}</dd>
            </div>
          </dl>
          <aside className="insights-recommendation" aria-label="Top recommendation">
            <span>Top Recommendation</span>
            <strong>{insights.recommendation.topRecommendation}</strong>
            <small>
              {insights.recommendation.activeStage ?? 'Journey complete'}
            </small>
          </aside>
        </section>
      ) : (
        <section className="manager-insights" aria-labelledby="manager-insights-title">
          <header className="insights-section-heading">
            <p>Manager View</p>
            <h2 id="manager-insights-title">Team Completion Summary</h2>
          </header>
          <dl className="manager-summary-grid">
            <div>
              <dt>Employees</dt>
              <dd>{insights.managerSummary.employees}</dd>
            </div>
            <div>
              <dt>Stage Completion</dt>
              <dd>{insights.managerSummary.stageCompletion}%</dd>
            </div>
            <div>
              <dt>Mission Completion</dt>
              <dd>{insights.managerSummary.missionCompletion}%</dd>
            </div>
            <div>
              <dt>Quest Completion</dt>
              <dd>{insights.managerSummary.questCompletion}%</dd>
            </div>
            <div>
              <dt>Territory Completion</dt>
              <dd>{insights.managerSummary.territoryCompletion}%</dd>
            </div>
          </dl>
          <aside className="manager-recommendation">
            <span>Top Recommendation</span>
            <strong>{insights.managerSummary.topRecommendation}</strong>
          </aside>
          <p className="manager-local-note">
            Local demo summary for one employee profile.
          </p>
        </section>
      )}

      <section className="journey-analytics" aria-labelledby="journey-analytics-title">
        <header className="insights-section-heading">
          <p>Journey Analytics</p>
          <h2 id="journey-analytics-title">Completion Timing</h2>
        </header>
        <div className="analytics-card-grid">
          {insights.durations.map((metric) => (
            <article key={metric.id} className="analytics-card">
              <span>{metric.label}</span>
              <strong>{metric.displayValue}</strong>
              <small>{formatTimestamp(metric.completedAt)}</small>
            </article>
          ))}
        </div>
      </section>

      <div className="insights-lower-grid">
        <section className="progress-timeline" aria-labelledby="progress-timeline-title">
          <header className="insights-section-heading">
            <p>Progress Timeline</p>
            <h2 id="progress-timeline-title">Onboarding Journey</h2>
          </header>
          <ol>
            {insights.timeline.map((entry) => (
              <li key={entry.id} data-status={entry.status}>
                <span className="timeline-marker" aria-hidden="true" />
                <div>
                  <strong>{entry.label}</strong>
                  <small>
                    {entry.status === 'completed'
                      ? formatTimestamp(entry.completedAt)
                      : entry.status === 'current'
                        ? 'Current focus'
                        : 'Pending'}
                  </small>
                </div>
                <em>{entry.status}</em>
              </li>
            ))}
          </ol>
        </section>

        <section className="achievement-showcase" aria-labelledby="achievement-showcase-title">
          <header className="insights-section-heading">
            <p>Achievement Showcase</p>
            <h2 id="achievement-showcase-title">Badges</h2>
          </header>
          <div className="achievement-showcase-list">
            {insights.achievements.map((achievement) => (
              <article
                key={achievement.badgeId}
                data-unlocked={achievement.unlocked}
              >
                <span className="achievement-seal" aria-hidden="true">
                  OQ
                </span>
                <div>
                  <strong>{achievement.name}</strong>
                  <p>{achievement.description}</p>
                  <small>
                    {achievement.unlocked
                      ? achievement.unlockedAt
                        ? `Unlocked ${formatTimestamp(achievement.unlockedAt)}`
                        : 'Unlock time unavailable'
                      : 'Locked'}
                  </small>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <ResetProgressDialog
        open={resetDialogOpen}
        onCancel={() => setResetDialogOpen(false)}
        onConfirm={onReset}
      />
    </section>
  )
}
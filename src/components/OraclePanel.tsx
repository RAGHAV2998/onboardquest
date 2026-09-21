import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { OracleState } from '../types/oracle'

type OraclePanelProps = {
  readonly state: OracleState | null
  readonly onAsk: (question: string) => void
  readonly onClose: () => void
}

export function OraclePanel({ state, onAsk, onClose }: OraclePanelProps) {
  const [question, setQuestion] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const historyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state?.isOpen) {
      inputRef.current?.focus()
    }
  }, [state?.isOpen])

  useEffect(() => {
    historyRef.current?.scrollTo({
      top: historyRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [state?.history])

  if (!state?.isOpen || !state.context) {
    return null
  }

  const submitQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedQuestion = question.trim()

    if (!normalizedQuestion || state.isResponding) {
      return
    }

    onAsk(normalizedQuestion)
    setQuestion('')
  }

  const completedTitles = [
    ...state.context.completedQuestTitles,
    ...state.context.completedTerritoryTitles,
    ...state.context.completedMissionTitles,
  ]

  return (
    <section
      className="oracle-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="oracle-panel-title"
    >
      <header className="oracle-panel-header">
        <div>
          <p>Mentor Tower</p>
          <h2 id="oracle-panel-title">Mentor Oracle</h2>
        </div>
        <div className="oracle-panel-actions">
          <span>{state.providerName}</span>
          <button
            type="button"
            aria-label="Close Mentor Oracle"
            title="Close"
            onClick={onClose}
          >
            {'\u00D7'}
          </button>
        </div>
      </header>

      <div className="oracle-panel-layout">
        <aside className="oracle-context" aria-label="Player context summary">
          <h3>Player Context Summary</h3>
          <dl>
            <div>
              <dt>Level</dt>
              <dd>{state.context.level}</dd>
            </div>
            <div>
              <dt>Stage</dt>
              <dd>{state.context.currentStage}</dd>
            </div>
            <div>
              <dt>Territory</dt>
              <dd>{state.context.currentTerritory}</dd>
            </div>
            <div>
              <dt>Career Path</dt>
              <dd>{state.context.currentCareerPath?.title ?? 'Not selected'}</dd>
            </div>
            <div>
              <dt>Current Milestone</dt>
              <dd>{state.context.currentMilestone ?? 'Not selected'}</dd>
            </div>
            <div>
              <dt>Onboarding Stages</dt>
              <dd>
                {state.context.completedOnboardingGoals} /{' '}
                {state.context.totalOnboardingGoals}
              </dd>
            </div>
            <div>
              <dt>Recommendation</dt>
              <dd>{state.context.currentRecommendation}</dd>
            </div>
          </dl>

          <h4>Completed</h4>
          {completedTitles.length > 0 ? (
            <ul>
              {completedTitles.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          ) : (
            <p className="oracle-context-empty">No completed activities yet.</p>
          )}
        </aside>

        <div className="oracle-conversation">
          <div
            ref={historyRef}
            className="oracle-history"
            aria-label="Conversation history"
            aria-live="polite"
          >
            {state.history.length === 0 ? (
              <p className="oracle-empty-history">
                Ask about your approved onboarding progress or career path.
              </p>
            ) : (
              state.history.map((message) => (
                <article
                  key={message.messageId}
                  className="oracle-message"
                  data-role={message.role}
                >
                  <strong>
                    {message.role === 'player' ? 'You' : 'Oracle'}
                  </strong>
                  <p>{message.text}</p>
                </article>
              ))
            )}
            {state.isResponding && (
              <p className="oracle-responding">Oracle is responding...</p>
            )}
          </div>

          <div className="oracle-suggestions">
            <span>Suggested Questions</span>
            <div>
              {state.suggestedQuestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={state.isResponding}
                  onClick={() => onAsk(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <form className="oracle-question-form" onSubmit={submitQuestion}>
            <label htmlFor="oracle-question">Question</label>
            <div>
              <input
                ref={inputRef}
                id="oracle-question"
                type="text"
                value={question}
                disabled={state.isResponding}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask the Mentor Oracle"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={state.isResponding || question.trim().length === 0}
              >
                Ask
              </button>
            </div>
          </form>
          {state.error && <p className="oracle-error">{state.error}</p>}
        </div>
      </div>
    </section>
  )
}
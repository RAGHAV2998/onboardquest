import {
  oracleSuggestedQuestions,
  oracleUnavailableResponse,
} from '../../data/oracleContent'
import type { OracleProvider } from '../oracle/OracleProvider'
import type {
  OracleContext,
  OracleMessage,
  OracleState,
} from '../../types/oracle'
import type { TerritoryId } from '../../types/territory'
import { OracleContextBuilder } from './OracleContextBuilder'
import { OraclePromptBuilder } from './OraclePromptBuilder'

type OracleManagerCallbacks = {
  readonly onStateChanged: (state: OracleState) => void
}

export class OracleManager {
  private isOpen = false
  private isResponding = false
  private currentTerritoryId: TerritoryId = 'mentor-tower'
  private context: OracleContext | null = null
  private history: OracleMessage[] = []
  private error: string | null = null
  private nextMessageId = 1

  constructor(
    private readonly provider: OracleProvider,
    private readonly contextBuilder: OracleContextBuilder,
    private readonly promptBuilder: OraclePromptBuilder,
    private readonly callbacks: OracleManagerCallbacks,
  ) {
    this.publishState()
  }

  get opened(): boolean {
    return this.isOpen
  }

  open(territoryId: TerritoryId): void {
    this.currentTerritoryId = territoryId
    this.context = this.contextBuilder.build(territoryId)
    this.isOpen = true
    this.error = null
    this.publishState()
  }

  close(): void {
    this.isOpen = false
    this.error = null
    this.publishState()
  }

  async ask(question: string): Promise<boolean> {
    const normalizedQuestion = question.trim()

    if (!this.isOpen || this.isResponding || normalizedQuestion.length === 0) {
      return false
    }

    this.context = this.contextBuilder.build(this.currentTerritoryId)
    const playerMessage = this.createMessage('player', normalizedQuestion)
    this.history = [...this.history, playerMessage]
    this.isResponding = true
    this.error = null
    this.publishState()

    try {
      const response = await this.provider.respond({
        question: normalizedQuestion,
        context: this.context,
        systemPrompt: this.promptBuilder.build(this.context),
        history: this.history,
      })
      const responseText = response.text.trim() || oracleUnavailableResponse

      this.history = [
        ...this.history,
        this.createMessage('oracle', responseText),
      ]
    } catch {
      this.history = [
        ...this.history,
        this.createMessage('oracle', oracleUnavailableResponse),
      ]
      this.error = 'The Oracle could not complete that response.'
    } finally {
      this.context = this.contextBuilder.build(this.currentTerritoryId)
      this.isResponding = false
      this.publishState()
    }

    return true
  }

  private createMessage(
    role: OracleMessage['role'],
    text: string,
  ): OracleMessage {
    const message = {
      messageId: this.nextMessageId,
      role,
      text,
    }
    this.nextMessageId += 1
    return message
  }

  private publishState(): void {
    this.callbacks.onStateChanged({
      isOpen: this.isOpen,
      isResponding: this.isResponding,
      providerName: this.provider.name,
      context: this.context,
      history: [...this.history],
      suggestedQuestions: [...oracleSuggestedQuestions],
      error: this.error,
    })
  }
}
import { oracleUnavailableResponse } from '../../data/oracleContent'
import type { OracleContext } from '../../types/oracle'

export class OraclePromptBuilder {
  build(context: OracleContext): string {
    const approvedContext = JSON.stringify(context, null, 2)

    return [
      'You are the Mentor Oracle in the local OnboardQuest game.',
      'Answer only from the approved player context below.',
      'Do not invent internal documentation, employees, team structures, architecture details, links, systems, or procedures.',
      `If the approved context cannot answer the question, reply exactly: "${oracleUnavailableResponse}"`,
      'Keep the answer concise and align recommendations with the supplied currentRecommendation and currentMilestone.',
      'Approved player context:',
      approvedContext,
    ].join('\n')
  }
}
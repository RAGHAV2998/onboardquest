import { oracleUnavailableResponse } from '../../data/oracleContent'
import type {
  OracleProviderRequest,
  OracleProviderResponse,
} from '../../types/oracle'
import type { OracleProvider } from './OracleProvider'

export class MockOracleProvider implements OracleProvider {
  readonly name = 'Mock Oracle'

  async respond(
    request: OracleProviderRequest,
  ): Promise<OracleProviderResponse> {
    const question = request.question.trim().toLowerCase()
    const { context } = request

    if (this.isNextStepQuestion(question)) {
      return {
        text: context.currentCareerPath && context.currentMilestone
          ? `You are following the ${context.currentCareerPath.title} path. Your next milestone is ${context.currentMilestone}.`
          : context.currentRecommendation,
      }
    }

    if (question.includes('skill') && question.includes('focus')) {
      return {
        text: context.currentCareerPath
          ? `Focus on the ${context.currentCareerPath.title} milestones: ${context.currentCareerPath.milestoneTitles.join(', ')}.`
          : 'Choose an approved career path before focusing on path-specific skills.',
      }
    }

    if (
      question.includes('current path') ||
      question.includes('career path')
    ) {
      return {
        text: context.currentCareerPath
          ? `${context.currentCareerPath.title}: ${context.currentCareerPath.description} Milestones: ${context.currentCareerPath.milestoneTitles.join(', ')}.`
          : 'No career path is selected. Visit Mentor Tower and choose a path.',
      }
    }

    if (
      question.includes('task') &&
      (question.includes('remain') || question.includes('left'))
    ) {
      return {
        text:
          context.remainingMissionTitles.length > 0
            ? `Remaining first-week missions: ${context.remainingMissionTitles.join(', ')}.`
            : 'All approved first-week missions are complete.',
      }
    }

    if (question.includes('progress') || question.includes('completed')) {
      return {
        text: `You have completed ${context.completedOnboardingGoals} of ${context.totalOnboardingGoals} onboarding stages. Your current stage is ${context.currentStage}.`,
      }
    }

    return { text: oracleUnavailableResponse }
  }

  private isNextStepQuestion(question: string): boolean {
    return (
      question.includes('what should i do next') ||
      question.includes('next step') ||
      question === 'what next?'
    )
  }
}
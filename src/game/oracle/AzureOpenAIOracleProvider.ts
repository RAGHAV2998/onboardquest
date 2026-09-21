import { oracleUnavailableResponse } from '../../data/oracleContent'
import type {
  OracleProviderRequest,
  OracleProviderResponse,
} from '../../types/oracle'
import type { OracleProvider } from './OracleProvider'

export type AzureOpenAIOracleTransport = (
  request: OracleProviderRequest & {
    readonly deploymentName: string
  },
) => Promise<OracleProviderResponse>

export type AzureOpenAIOracleProviderOptions = {
  readonly deploymentName: string
  readonly transport?: AzureOpenAIOracleTransport
}

export class AzureOpenAIOracleProvider implements OracleProvider {
  readonly name = 'Azure OpenAI Oracle'

  constructor(private readonly options: AzureOpenAIOracleProviderOptions) {}

  async respond(
    request: OracleProviderRequest,
  ): Promise<OracleProviderResponse> {
    if (!this.options.transport) {
      return { text: oracleUnavailableResponse }
    }

    const response = await this.options.transport({
      ...request,
      deploymentName: this.options.deploymentName,
    })

    return response.text.trim().length > 0
      ? response
      : { text: oracleUnavailableResponse }
  }
}
import type {
  OracleProviderRequest,
  OracleProviderResponse,
} from '../../types/oracle'

export interface OracleProvider {
  readonly name: string
  respond(request: OracleProviderRequest): Promise<OracleProviderResponse>
}
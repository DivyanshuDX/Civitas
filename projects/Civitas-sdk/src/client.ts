import { createHttpClient, type HttpClient } from './http'
import { VenomSigningError } from './errors'
import { NO_SIGNER } from './signer'
import type {
  VenomClientConfig,
  TransactionSigner,
  RegisterParams,
  RegisterResponse,
  ConsentRequestParams,
  ConsentBuildResponse,
  ConsentSubmitParams,
  ConsentSubmitResponse,
  ParsedConsentRequest,
  ConsentListResponse,
  ConsentValidResponse,
  IdentityListResponse,
  IdentityDetailResponse,
  OrgProfile,
  OrgUsageResponse,
  OrgAnalytics,
  RequestAndSubmitConsentParams,
  RequestAndSubmitConsentResponse,
} from './types'

/**
 * Client for the Venom/Civitas identity verification API.
 */
export class VenomClient {
  private readonly http: HttpClient
  private readonly signer: TransactionSigner

  constructor(config: VenomClientConfig) {
    this.http = createHttpClient(
      config.baseUrl,
      config.apiKey,
      config.fetch ?? globalThis.fetch,
    )
    this.signer = config.signer ?? NO_SIGNER
  }

  // ── Auth ──

  /** Register a new organization and receive an API key. */
  async register(params: RegisterParams): Promise<RegisterResponse> {
    return this.http.post<RegisterResponse>('/auth/register', params)
  }

  // ── Consent ──

  /** Build unsigned consent request transactions. */
  async buildConsentRequest(params: ConsentRequestParams): Promise<ConsentBuildResponse> {
    return this.http.post<ConsentBuildResponse>('/consent/request', params)
  }

  /** Submit signed consent transactions. */
  async submitConsent(params: ConsentSubmitParams): Promise<ConsentSubmitResponse> {
    return this.http.post<ConsentSubmitResponse>('/consent/submit', params)
  }

  /**
   * Convenience method: build consent request → sign transactions → submit.
   * Requires a signer to be configured.
   */
  async requestAndSubmitConsent(
    params: RequestAndSubmitConsentParams,
  ): Promise<RequestAndSubmitConsentResponse> {
    // 1. Build unsigned transactions
    const buildResult = await this.buildConsentRequest(params)

    // 2. Decode base64 transactions to Uint8Array
    const unsignedTxns = buildResult.transactions.map((b64) =>
      Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)),
    )

    // 3. Sign
    let signedTxns: Uint8Array[]
    try {
      signedTxns = await this.signer(unsignedTxns)
    } catch (err) {
      if (err instanceof VenomSigningError) throw err
      throw new VenomSigningError(
        err instanceof Error ? err.message : 'Signing failed',
      )
    }

    // 4. Encode signed transactions to base64
    const signedB64 = signedTxns.map((txn) =>
      btoa(String.fromCharCode(...txn)),
    )

    // 5. Submit
    const submitResult = await this.submitConsent({
      signedTransactions: signedB64,
    })

    return {
      txId: submitResult.txId,
      status: submitResult.status,
      requestId: buildResult.requestId,
    }
  }

  /** List all consent requests for the authenticated organization. */
  async listConsentRequests(): Promise<ParsedConsentRequest[]> {
    const result = await this.http.get<ConsentListResponse>('/consent')
    return result.requests
  }

  /** Get a specific consent request by ID. */
  async getConsentRequest(id: number): Promise<ParsedConsentRequest> {
    return this.http.get<ParsedConsentRequest>(`/consent/${id}`)
  }

  /** Check if a consent request is currently valid. */
  async checkConsentValid(id: number): Promise<ConsentValidResponse> {
    return this.http.get<ConsentValidResponse>(`/consent/${id}/valid`)
  }

  // ── Identity ──

  /** List all identity assets for an Algorand address. */
  async listIdentities(address: string): Promise<IdentityListResponse> {
    return this.http.get<IdentityListResponse>(`/identity/${address}`)
  }

  /** Get a specific identity document type for an address. */
  async getIdentity(address: string, docType: number): Promise<IdentityDetailResponse> {
    return this.http.get<IdentityDetailResponse>(`/identity/${address}/${docType}`)
  }

  // ── Organization ──

  /** Get the authenticated organization's profile. */
  async getOrgProfile(): Promise<OrgProfile> {
    return this.http.get<OrgProfile>('/org/profile')
  }

  /** Get the authenticated organization's API usage logs. */
  async getOrgUsage(): Promise<OrgUsageResponse> {
    return this.http.get<OrgUsageResponse>('/org/usage')
  }

  /** Get analytics for the authenticated organization's consent requests. */
  async getAnalytics(): Promise<OrgAnalytics> {
    return this.http.get<OrgAnalytics>('/org/analytics')
  }
}

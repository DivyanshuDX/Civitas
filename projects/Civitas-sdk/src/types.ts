/**
 * Function that signs an array of unsigned transactions and returns the signed bytes.
 * Accepts raw msgpack-encoded unsigned transactions and returns signed transaction bytes.
 */
export type TransactionSigner = (unsignedTxns: Uint8Array[]) => Promise<Uint8Array[]>

// ── Granular Field Definitions (bitmasks) ──

export const DOC_FIELDS = {
  aadhaar: {
    name:           0b0000_0001,
    dob:            0b0000_0010,
    gender:         0b0000_0100,
    address:        0b0000_1000,
    photo:          0b0001_0000,
    maskedNumber:   0b0010_0000,
  },
  pan: {
    name:           0b0000_0001,
    dob:            0b0000_0010,
    panNumber:      0b0000_0100,
    fatherName:     0b0000_1000,
  },
  voterId: {
    name:           0b0000_0001,
    dob:            0b0000_0010,
    gender:         0b0000_0100,
    address:        0b0000_1000,
    voterIdNumber:  0b0001_0000,
    constituency:   0b0010_0000,
  },
} as const

export const DOC_FIELD_LABELS: Record<number, { bit: number; label: string }[]> = {
  0: [
    { bit: DOC_FIELDS.aadhaar.name, label: 'Full Name' },
    { bit: DOC_FIELDS.aadhaar.dob, label: 'Date of Birth' },
    { bit: DOC_FIELDS.aadhaar.gender, label: 'Gender' },
    { bit: DOC_FIELDS.aadhaar.address, label: 'Address' },
    { bit: DOC_FIELDS.aadhaar.photo, label: 'Photo' },
    { bit: DOC_FIELDS.aadhaar.maskedNumber, label: 'Masked Aadhaar Number' },
  ],
  1: [
    { bit: DOC_FIELDS.pan.name, label: 'Full Name' },
    { bit: DOC_FIELDS.pan.dob, label: 'Date of Birth' },
    { bit: DOC_FIELDS.pan.panNumber, label: 'PAN Number' },
    { bit: DOC_FIELDS.pan.fatherName, label: "Father's Name" },
  ],
  2: [
    { bit: DOC_FIELDS.voterId.name, label: 'Full Name' },
    { bit: DOC_FIELDS.voterId.dob, label: 'Date of Birth' },
    { bit: DOC_FIELDS.voterId.gender, label: 'Gender' },
    { bit: DOC_FIELDS.voterId.address, label: 'Address' },
    { bit: DOC_FIELDS.voterId.voterIdNumber, label: 'Voter ID Number' },
    { bit: DOC_FIELDS.voterId.constituency, label: 'Constituency' },
  ],
}

export function bitmaskToFieldNames(docType: number, bitmask: number): string[] {
  const fields = DOC_FIELD_LABELS[docType] ?? []
  return fields.filter((f) => (bitmask & f.bit) !== 0).map((f) => f.label)
}

/**
 * Configuration for the VenomClient.
 */
export interface VenomClientConfig {
  /** Base URL of the Venom API, including version prefix (e.g. "https://api.civitas.dev/v1") */
  baseUrl: string
  /** API key for authentication. Omit for unauthenticated endpoints (e.g. register). */
  apiKey?: string
  /** Transaction signer function. Required for requestAndSubmitConsent(). */
  signer?: TransactionSigner
  /** Custom fetch implementation. Defaults to global fetch. */
  fetch?: typeof globalThis.fetch
}

// ── Register ──

export interface RegisterParams {
  name: string
  email: string
  algorandAddress: string
}

export interface RegisterResponse {
  apiKey: string
  algorandAddress: string
  message: string
}

// ── Consent Request ──

export interface ConsentRequestParams {
  userAddress: string
  docType: number
  reason: string
  requestedFields: number
  durationHours: number
}

export interface ConsentBuildResponse {
  transactions: string[]
  groupId: string
  requestId: number
  message: string
}

export interface ConsentSubmitParams {
  signedTransactions: string[]
}

export interface ConsentSubmitResponse {
  txId: string
  status: string
}

// ── Consent Queries ──

export interface ParsedConsentRequest {
  requestId: number
  org: string
  user: string
  docType: number
  reason: string
  idDetails: string
  requestedFields: number
  sharedFields: number
  expiry: number
  duration: number
  createdAt: number
  status: number
  isExpired: boolean
}

export interface ConsentListResponse {
  requests: ParsedConsentRequest[]
}

export interface ConsentValidResponse {
  valid: boolean
  reason?: string
}

// ── Identity ──

export interface UserAsset {
  assetId: bigint
  docType: number
  createdAt: number
}

export interface IdentityListResponse {
  address: string
  identities: UserAsset[]
}

export interface IdentityDetailResponse {
  address: string
  identity: UserAsset
}

// ── Organization ──

export interface OrgProfile {
  name: string
  email: string
  algorandAddress: string
  apiKeyPrefix: string
  isWhitelisted: boolean
  createdAt: string
}

export interface OrgUsageLog {
  endpoint: string
  method: string
  created_at: string
}

export interface OrgUsageResponse {
  logs: OrgUsageLog[]
}

// ── Analytics ──

export interface OrgAnalytics {
  totalRequests: number
  approvalRate: number
  statusBreakdown: { pending: number; approved: number; rejected: number; expired: number }
  docTypeBreakdown: { aadhaar: number; pan: number; voterId: number }
  recentRequests: ParsedConsentRequest[]
  topUsers: { address: string; requestCount: number }[]
  avgDuration: number
}

// ── Convenience ──

export interface RequestAndSubmitConsentParams {
  userAddress: string
  docType: number
  reason: string
  requestedFields: number
  durationHours: number
}

export interface RequestAndSubmitConsentResponse {
  txId: string
  status: string
  requestId: number
}

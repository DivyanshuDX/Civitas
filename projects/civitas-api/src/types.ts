export interface Env {
  ALGOD_SERVER: string
  ALGOD_PORT: string
  ALGOD_TOKEN: string
  ORG_CONSENT_APP_ID: string
  USER_IDENTITY_APP_ID: string
  DX_APP_ID: string
  SUPABASE_URL: string
  SUPABASE_KEY: string
  RESEND_API_KEY: string
  ADMIN_ADDRESS: string
  FACILITATOR_URL: string
  CHATBASE_IDENTITY_SECRET: string
}

// ── Granular Field Definitions ──

// Bitmask positions for each document type's fields
export const DOC_FIELDS = {
  aadhaar: {
    name:           0b0000_0001,  // bit 0
    dob:            0b0000_0010,  // bit 1
    gender:         0b0000_0100,  // bit 2
    address:        0b0000_1000,  // bit 3
    photo:          0b0001_0000,  // bit 4
    maskedNumber:   0b0010_0000,  // bit 5
  },
  pan: {
    name:           0b0000_0001,  // bit 0
    dob:            0b0000_0010,  // bit 1
    panNumber:      0b0000_0100,  // bit 2
    fatherName:     0b0000_1000,  // bit 3
  },
  voterId: {
    name:           0b0000_0001,  // bit 0
    dob:            0b0000_0010,  // bit 1
    gender:         0b0000_0100,  // bit 2
    address:        0b0000_1000,  // bit 3
    voterIdNumber:  0b0001_0000,  // bit 4
    constituency:   0b0010_0000,  // bit 5
  },
} as const

export const DOC_FIELD_LABELS: Record<number, { bit: number; label: string }[]> = {
  0: [ // Aadhaar
    { bit: DOC_FIELDS.aadhaar.name, label: 'Full Name' },
    { bit: DOC_FIELDS.aadhaar.dob, label: 'Date of Birth' },
    { bit: DOC_FIELDS.aadhaar.gender, label: 'Gender' },
    { bit: DOC_FIELDS.aadhaar.address, label: 'Address' },
    { bit: DOC_FIELDS.aadhaar.photo, label: 'Photo' },
    { bit: DOC_FIELDS.aadhaar.maskedNumber, label: 'Masked Aadhaar Number' },
  ],
  1: [ // PAN
    { bit: DOC_FIELDS.pan.name, label: 'Full Name' },
    { bit: DOC_FIELDS.pan.dob, label: 'Date of Birth' },
    { bit: DOC_FIELDS.pan.panNumber, label: 'PAN Number' },
    { bit: DOC_FIELDS.pan.fatherName, label: "Father's Name" },
  ],
  2: [ // Voter ID
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

export interface Tenant {
  id: string
  name: string
  email: string
  api_key_hash: string
  api_key_prefix: string
  algorand_address: string
  is_whitelisted: boolean
  created_at: string
}

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

export interface UserAsset {
  assetId: bigint
  docType: number
  createdAt: number
}

export interface OrgAnalytics {
  totalRequests: number
  approvalRate: number
  statusBreakdown: { pending: number; approved: number; rejected: number; revoked: number; expired: number }
  docTypeBreakdown: { aadhaar: number; pan: number; voterId: number }
  recentRequests: ParsedConsentRequest[]
  topUsers: { address: string; requestCount: number }[]
  avgDuration: number
}

export type Variables = {
  tenant: Tenant
}

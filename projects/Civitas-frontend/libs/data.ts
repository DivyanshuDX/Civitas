// Mock data for the application

// Types
export type User = {
  address: string
  name: string
  documents: UserDocument[]
}

export type UserDocument = {
  id: string
  type: DocumentType
  verified: boolean
  verifiedAt?: string
  fields: Record<string, boolean> // Which fields are available to share
}

export type DocumentType = "aadhaar" | "pan" | "passport" | "driving_license" | "voter_id"

export type DocumentField = {
  id: string
  name: string
  description: string
  documentType: DocumentType
}

export type Organization = {
  id: string
  name: string
  contact: string
  description: string
}

export type AccessRequestStatus = "pending" | "approved" | "rejected" | "expired"

export type AccessRequest = {
  id: string
  organizationId: string
  userAddress: string
  documentTypes: DocumentType[]
  requiredFields: Record<DocumentType, string[]> // Map of document type to field IDs
  purpose: string
  status: AccessRequestStatus
  createdAt: string
  expiryDate: string
  respondedAt?: string
  transactionHash: string
}

export type AccessGrant = {
  id: string
  requestId: string
  userAddress: string
  organizationId: string
  documentType: DocumentType
  grantedFields: string[] // Field IDs that were granted
  createdAt: string
  expiryDate: string
  revokedAt?: string
  transactionHash: string
}

export type AccessHistory = {
  id: string
  accessGrantId?: string
  accessRequestId?: string
  action: "request" | "grant" | "revoke" | "reject" | "expire"
  timestamp: string
  transactionHash: string
}

export type ConsentPurpose = {
  id: string
  name: string
  description: string
}

export type Consent = {
  id: string
  userAddress: string
  organizationId: string
  purposeId: string
  status: "active" | "revoked" | "expired"
  createdAt: string
  expiryDate: string
  revokedAt?: string
  transactionHash: string
}

// Mock data
export const users: User[] = [
  {
    address: "0x1234567890123456789012345678901234567890",
    name: "Demo User",
    documents: [
      {
        id: "doc1",
        type: "aadhaar",
        verified: true,
        verifiedAt: "2023-01-15T10:30:00Z",
        fields: {
          name: true,
          dob: true,
          gender: true,
          address: true,
          aadhaar_number: true,
          photo: true,
          phone: true,
          email: true,
          father_name: true,
        },
      },
      {
        id: "doc2",
        type: "pan",
        verified: true,
        verifiedAt: "2023-02-20T14:45:00Z",
        fields: {
          name: true,
          pan_number: true,
          dob: true,
          father_name: true,
        },
      },
      {
        id: "doc3",
        type: "passport",
        verified: true,
        verifiedAt: "2023-03-10T09:15:00Z",
        fields: {
          name: true,
          passport_number: true,
          nationality: true,
          dob: true,
          place_of_birth: true,
          issue_date: true,
          expiry_date: true,
          address: true,
          photo: true,
        },
      },
    ],
  },
]

export const documentFields: DocumentField[] = [
  // Aadhaar fields
  { id: "aadhaar_name", name: "Name", description: "Full name as per Aadhaar", documentType: "aadhaar" },
  { id: "aadhaar_dob", name: "Date of Birth", description: "Date of birth as per Aadhaar", documentType: "aadhaar" },
  { id: "aadhaar_gender", name: "Gender", description: "Gender as per Aadhaar", documentType: "aadhaar" },
  {
    id: "aadhaar_address",
    name: "Address",
    description: "Residential address as per Aadhaar",
    documentType: "aadhaar",
  },
  { id: "aadhaar_number", name: "Aadhaar Number", description: "12-digit Aadhaar number", documentType: "aadhaar" },
  { id: "aadhaar_photo", name: "Photograph", description: "Biometric photograph", documentType: "aadhaar" },
  { id: "aadhaar_phone", name: "Phone Number", description: "Linked phone number", documentType: "aadhaar" },
  { id: "aadhaar_email", name: "Email", description: "Linked email address", documentType: "aadhaar" },
  {
    id: "aadhaar_father_name",
    name: "Father's Name",
    description: "Father's name as per Aadhaar",
    documentType: "aadhaar",
  },

  // PAN fields
  { id: "pan_name", name: "Name", description: "Full name as per PAN", documentType: "pan" },
  { id: "pan_number", name: "PAN Number", description: "10-character PAN number", documentType: "pan" },
  { id: "pan_dob", name: "Date of Birth", description: "Date of birth as per PAN", documentType: "pan" },
  { id: "pan_father_name", name: "Father's Name", description: "Father's name as per PAN", documentType: "pan" },

  // Passport fields
  { id: "passport_name", name: "Name", description: "Full name as per Passport", documentType: "passport" },
  { id: "passport_number", name: "Passport Number", description: "Passport number", documentType: "passport" },
  {
    id: "passport_nationality",
    name: "Nationality",
    description: "Nationality as per Passport",
    documentType: "passport",
  },
  { id: "passport_dob", name: "Date of Birth", description: "Date of birth as per Passport", documentType: "passport" },
  {
    id: "passport_place_of_birth",
    name: "Place of Birth",
    description: "Place of birth as per Passport",
    documentType: "passport",
  },
  { id: "passport_issue_date", name: "Issue Date", description: "Passport issue date", documentType: "passport" },
  { id: "passport_expiry_date", name: "Expiry Date", description: "Passport expiry date", documentType: "passport" },
  { id: "passport_address", name: "Address", description: "Address as per Passport", documentType: "passport" },
  { id: "passport_photo", name: "Photograph", description: "Passport photograph", documentType: "passport" },
]

export const organizations: Organization[] = [
  {
    id: "org1",
    name: "Acme Corporation",
    contact: "contact@acme.com",
    description: "A global conglomerate with diverse business interests",
  },
  {
    id: "org2",
    name: "TechNova",
    contact: "info@technova.com",
    description: "Leading technology solutions provider",
  },
  {
    id: "org3",
    name: "FinSecure",
    contact: "support@finsecure.com",
    description: "Financial services and security solutions",
  },
  {
    id: "org4",
    name: "HealthPlus",
    contact: "care@healthplus.com",
    description: "Healthcare and wellness services",
  },
]

export const accessRequests: AccessRequest[] = [
  {
    id: "req1",
    organizationId: "org1",
    userAddress: "0x1234567890123456789012345678901234567890",
    documentTypes: ["aadhaar", "pan"],
    requiredFields: {
      aadhaar: ["aadhaar_name", "aadhaar_address", "aadhaar_dob"],
      pan: ["pan_name", "pan_number"],
      passport: [],
      driving_license: [],
      voter_id: [],
    },
    purpose: "KYC verification for account opening",
    status: "pending",
    createdAt: "2023-12-01T10:30:00Z",
    expiryDate: "2023-12-08T10:30:00Z",
    transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
  {
    id: "req2",
    organizationId: "org2",
    userAddress: "0x1234567890123456789012345678901234567890",
    documentTypes: ["passport"],
    requiredFields: {
      aadhaar: [],
      pan: [],
      passport: ["passport_name", "passport_number", "passport_nationality", "passport_expiry_date"],
      driving_license: [],
      voter_id: [],
    },
    purpose: "Travel booking verification",
    status: "approved",
    createdAt: "2023-11-15T14:20:00Z",
    expiryDate: "2023-11-22T14:20:00Z",
    respondedAt: "2023-11-16T09:45:00Z",
    transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  },
  {
    id: "req3",
    organizationId: "org3",
    userAddress: "0x1234567890123456789012345678901234567890",
    documentTypes: ["aadhaar", "pan"],
    requiredFields: {
      aadhaar: ["aadhaar_name", "aadhaar_number", "aadhaar_dob"],
      pan: ["pan_name", "pan_number"],
      passport: [],
      driving_license: [],
      voter_id: [],
    },
    purpose: "Loan application verification",
    status: "rejected",
    createdAt: "2023-10-05T09:15:00Z",
    expiryDate: "2023-10-12T09:15:00Z",
    respondedAt: "2023-10-06T16:45:00Z",
    transactionHash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  },
]

export const accessGrants: AccessGrant[] = [
  {
    id: "grant1",
    requestId: "req2",
    userAddress: "0x1234567890123456789012345678901234567890",
    organizationId: "org2",
    documentType: "passport",
    grantedFields: ["passport_name", "passport_nationality", "passport_expiry_date"],
    createdAt: "2023-11-16T09:45:00Z",
    expiryDate: "2024-11-16T09:45:00Z",
    transactionHash: "0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
  },
]

export const accessHistory: AccessHistory[] = [
  {
    id: "history1",
    accessRequestId: "req1",
    action: "request",
    timestamp: "2023-12-01T10:30:00Z",
    transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
  {
    id: "history2",
    accessRequestId: "req2",
    action: "request",
    timestamp: "2023-11-15T14:20:00Z",
    transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  },
  {
    id: "history3",
    accessGrantId: "grant1",
    accessRequestId: "req2",
    action: "grant",
    timestamp: "2023-11-16T09:45:00Z",
    transactionHash: "0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
  },
  {
    id: "history4",
    accessRequestId: "req3",
    action: "request",
    timestamp: "2023-10-05T09:15:00Z",
    transactionHash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
  },
  {
    id: "history5",
    accessRequestId: "req3",
    action: "reject",
    timestamp: "2023-10-06T16:45:00Z",
    transactionHash: "0x234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
  },
]

export const purposes: ConsentPurpose[] = [
  {
    id: "purpose1",
    name: "Marketing",
    description: "To send you promotional offers and updates",
  },
  {
    id: "purpose2",
    name: "Analytics",
    description: "To analyze your usage of our services",
  },
  {
    id: "purpose3",
    name: "KYC",
    description: "To verify your identity",
  },
  {
    id: "purpose4",
    name: "Service Delivery",
    description: "To provide you with the services you have requested",
  },
]

export const consents: Consent[] = [
  {
    id: "consent1",
    userAddress: "0x1234567890123456789012345678901234567890",
    organizationId: "org1",
    purposeId: "purpose1",
    status: "active",
    createdAt: "2023-12-01T10:30:00Z",
    expiryDate: "2024-12-01T10:30:00Z",
    transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
  {
    id: "consent2",
    userAddress: "0x1234567890123456789012345678901234567890",
    organizationId: "org2",
    purposeId: "purpose2",
    status: "revoked",
    createdAt: "2023-11-15T14:20:00Z",
    expiryDate: "2023-11-22T14:20:00Z",
    revokedAt: "2023-11-20T14:20:00Z",
    transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  },
]

export const consentHistory: AccessHistory[] = [
  {
    id: "history6",
    accessRequestId: "req1",
    action: "request",
    timestamp: "2023-12-01T10:30:00Z",
    transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
  {
    id: "history7",
    accessRequestId: "req2",
    action: "request",
    timestamp: "2023-11-15T14:20:00Z",
    transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  },
  {
    id: "history8",
    accessGrantId: "grant1",
    accessRequestId: "req2",
    action: "grant",
    timestamp: "2023-11-16T09:45:00Z",
    transactionHash: "0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
  },
  {
    id: "history9",
    accessRequestId: "req3",
    action: "request",
    timestamp: "2023-10-05T09:15:00Z",
    transactionHash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
  },
  {
    id: "history10",
    accessRequestId: "req3",
    action: "reject",
    timestamp: "2023-10-06T16:45:00Z",
    transactionHash: "0x234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
  },
]

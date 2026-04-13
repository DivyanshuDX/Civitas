import { Env } from '../types'
import { getAlgorandClient } from './algorand'
import { buildUaBoxName, parseUserAsset } from './boxParser'

const DOC_TYPES = ['Aadhaar', 'PAN', 'Voter ID'] as const

export interface IdentityRecord {
  docType: number
  docTypeName: string
  assetId: string
  createdAt: string
  exists: boolean
}

export async function getIdentities(env: Env, address: string): Promise<IdentityRecord[]> {
  const algorand = getAlgorandClient(env)
  const appId = Number(env.USER_IDENTITY_APP_ID)
  const results: IdentityRecord[] = []

  for (let docType = 0; docType < DOC_TYPES.length; docType++) {
    const boxName = buildUaBoxName(address, docType)

    try {
      const boxResult = await algorand.client.algod
        .getApplicationBoxByName(appId, boxName)
        .do()

      const value = new Uint8Array(boxResult.value ?? boxResult['value'])
      const parsed = parseUserAsset(value)

      if (parsed) {
        results.push({
          docType,
          docTypeName: DOC_TYPES[docType],
          assetId: parsed.assetId.toString(),
          createdAt: new Date(parsed.createdAt * 1000).toISOString(),
          exists: true,
        })
      }
    } catch {
      results.push({
        docType,
        docTypeName: DOC_TYPES[docType],
        assetId: '',
        createdAt: '',
        exists: false,
      })
    }
  }

  return results
}

export async function getIdentityByDocType(
  env: Env,
  address: string,
  docType: number
): Promise<IdentityRecord | null> {
  if (docType < 0 || docType >= DOC_TYPES.length) return null

  const algorand = getAlgorandClient(env)
  const appId = Number(env.USER_IDENTITY_APP_ID)
  const boxName = buildUaBoxName(address, docType)

  try {
    const boxResult = await algorand.client.algod
      .getApplicationBoxByName(appId, boxName)
      .do()

    const value = new Uint8Array(boxResult.value ?? boxResult['value'])
    const parsed = parseUserAsset(value)

    if (parsed) {
      return {
        docType,
        docTypeName: DOC_TYPES[docType],
        assetId: parsed.assetId.toString(),
        createdAt: new Date(parsed.createdAt * 1000).toISOString(),
        exists: true,
      }
    }
  } catch {
    // Box doesn't exist
  }

  return {
    docType,
    docTypeName: DOC_TYPES[docType],
    assetId: '',
    createdAt: '',
    exists: false,
  }
}

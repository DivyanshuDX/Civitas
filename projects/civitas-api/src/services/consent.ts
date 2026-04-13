import algosdk from 'algosdk'
import { Env, Tenant, ParsedConsentRequest } from '../types'
import { getAlgorandClient, getOrgConsentClient } from './algorand'
import { buildCrBoxName, parseConsentRequest } from './boxParser'

interface CreateConsentRequestParams {
  userAddress: string
  docType: number
  reason: string
  requestedFields: number
  durationHours: number
}

const USDC_ASSET_ID = 10458941 // Algorand testnet USDC
const CONSENT_FEE_USDC = 100_000 // $0.10 in microUSDC (6 decimals)

export async function buildConsentRequestTxns(
  env: Env,
  tenant: Tenant,
  params: CreateConsentRequestParams
): Promise<{ transactions: string[]; groupId: string; requestId: number }> {
  const algorand = getAlgorandClient(env)
  const orgClient = getOrgConsentClient(env, algorand, tenant.algorand_address)

  // Get current request count via typed client
  const currentCount = (await orgClient.state.global.requestCount()) ?? BigInt(0)
  const nextId = currentCount + BigInt(1)
  const durationSeconds = BigInt(params.durationHours * 3600)

  // Build box names
  const idBytes = new Uint8Array(8)
  new DataView(idBytes.buffer).setBigUint64(0, nextId)
  const crBoxName = new Uint8Array([...new TextEncoder().encode('cr_'), ...idBytes])

  const senderPk = algosdk.decodeAddress(tenant.algorand_address).publicKey
  const dxBoxName = new Uint8Array([...new TextEncoder().encode('wl_'), ...senderPk])

  const orgAppId = BigInt(env.ORG_CONSENT_APP_ID)
  const dxAppId = BigInt(env.DX_APP_ID)

  // Build the atomic group: USDC fee + ALGO box payment + consent app call
  const group = algorand.newGroup()
    .addAssetTransfer({
      sender: tenant.algorand_address,
      receiver: env.ADMIN_ADDRESS,
      assetId: BigInt(USDC_ASSET_ID),
      amount: BigInt(CONSENT_FEE_USDC),
    })
    .addPayment({
      sender: tenant.algorand_address,
      receiver: orgClient.appAddress,
      amount: (300_000).microAlgo(),
    })
    .addAppCallMethodCall(await orgClient.params.requestConsent({
      args: {
        user: params.userAddress,
        docType: params.docType,
        reason: params.reason,
        idDetails: '',
        requestedFields: params.requestedFields,
        duration: durationSeconds,
      },
      boxReferences: [
        { appId: dxAppId, name: dxBoxName },
        { appId: orgAppId, name: crBoxName },
      ],
      appReferences: [dxAppId],
      extraFee: (1_000).microAlgo(),
    }))

  // Build transactions without signing
  const builtTxns = await group.buildTransactions()
  const txns = builtTxns.transactions

  // Assign group ID if multiple transactions
  if (txns.length > 1) {
    const groupId = algosdk.computeGroupID(txns)
    for (const txn of txns) {
      txn.group = groupId
    }
  }

  // Encode each transaction as base64 msgpack
  const transactions = txns.map((txn: algosdk.Transaction) => {
    const encoded = algosdk.encodeUnsignedTransaction(txn)
    return Buffer.from(encoded).toString('base64')
  })

  const groupId = txns[0].group
    ? Buffer.from(txns[0].group).toString('base64')
    : ''

  return {
    transactions,
    groupId,
    requestId: Number(nextId),
  }
}

export async function submitSignedTransactions(
  env: Env,
  signedTxns: string[]
): Promise<{ txId: string }> {
  const algorand = getAlgorandClient(env)

  // Decode base64 signed transactions
  const decoded = signedTxns.map((txn) => new Uint8Array(Buffer.from(txn, 'base64')))

  // Submit to network
  const response = await algorand.client.algod.sendRawTransaction(decoded).do()
  const txId = response.txid

  // Wait for confirmation
  await algosdk.waitForConfirmation(algorand.client.algod, txId, 4)

  return { txId }
}

export async function getConsentRequest(
  env: Env,
  requestId: number
): Promise<ParsedConsentRequest | null> {
  const algorand = getAlgorandClient(env)
  const boxName = buildCrBoxName(requestId)

  try {
    const boxResult = await algorand.client.algod
      .getApplicationBoxByName(Number(env.ORG_CONSENT_APP_ID), boxName)
      .do()

    const value = new Uint8Array(boxResult.value ?? boxResult['value'])
    return parseConsentRequest(value, requestId)
  } catch {
    return null
  }
}

export async function listConsentRequests(
  env: Env,
  orgAddress: string
): Promise<ParsedConsentRequest[]> {
  const algorand = getAlgorandClient(env)
  const appId = Number(env.ORG_CONSENT_APP_ID)

  try {
    const boxesResult = await algorand.client.algod.getApplicationBoxes(appId).do()
    const boxes = boxesResult.boxes ?? boxesResult['boxes'] ?? []

    const requests: ParsedConsentRequest[] = []

    for (const box of boxes) {
      const name = new Uint8Array(box.name)
      const prefix = new TextDecoder().decode(name.slice(0, 3))
      if (prefix !== 'cr_') continue

      const idBytes = name.slice(3)
      const requestId = Number(new DataView(idBytes.buffer, idBytes.byteOffset).getBigUint64(0))

      try {
        const boxResult = await algorand.client.algod
          .getApplicationBoxByName(appId, name)
          .do()

        const value = new Uint8Array(boxResult.value ?? boxResult['value'])
        const parsed = parseConsentRequest(value, requestId)

        if (parsed && parsed.org === orgAddress) {
          requests.push(parsed)
        }
      } catch {
        continue
      }
    }

    return requests
  } catch {
    return []
  }
}

export async function checkConsentValid(
  env: Env,
  requestId: number
): Promise<{ valid: boolean; reason?: string }> {
  const request = await getConsentRequest(env, requestId)

  if (!request) {
    return { valid: false, reason: 'Request not found' }
  }

  if (request.status !== 1) {
    const statusNames = ['pending', 'approved', 'rejected', 'revoked']
    return { valid: false, reason: `Request is ${statusNames[request.status] ?? 'unknown'}` }
  }

  if (request.isExpired) {
    return { valid: false, reason: 'Consent has expired' }
  }

  return { valid: true }
}

import { Hono } from 'hono'
import { z } from 'zod'
import algosdk from 'algosdk'
import { Env, Variables } from '../types'
import {
  buildConsentRequestTxns,
  submitSignedTransactions,
  getConsentRequest,
  listConsentRequests,
  checkConsentValid,
} from '../services/consent'
import { getAlgorandClient } from '../services/algorand'
import { buildWlBoxName } from '../services/boxParser'
import { notifyUserConsentRequested } from '../services/email'

const consent = new Hono<{ Bindings: Env; Variables: Variables }>()

const publicCreateSchema = z.object({
  orgAddress: z.string().refine((addr) => algosdk.isValidAddress(addr), {
    message: 'Invalid org Algorand address',
  }),
  userAddress: z.string().refine((addr) => algosdk.isValidAddress(addr), {
    message: 'Invalid user Algorand address',
  }),
  docType: z.number().int().min(0).max(2),
  reason: z.string().min(1).max(500),
  requestedFields: z.number().int().min(1).max(65535),
  durationHours: z.number().int().min(1).max(8760),
})

// Public endpoint - x402 payment-gated (no API key required)
consent.post('/create', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400)

  const parsed = publicCreateSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400)
  }

  const { orgAddress, userAddress, docType, reason, requestedFields, durationHours } = parsed.data

  // Check on-chain whitelist status
  let isWhitelisted = false
  try {
    const algorand = getAlgorandClient(c.env)
    const boxName = buildWlBoxName(orgAddress)
    await algorand.client.algod
      .getApplicationBoxByName(Number(c.env.DX_APP_ID), boxName)
      .do()
    isWhitelisted = true
  } catch {
    // Box doesn't exist = not whitelisted
  }

  if (!isWhitelisted) {
    return c.json({ error: 'Organization not whitelisted. Contact admin.' }, 403)
  }

  try {
    // Create a mock tenant from the org address
    const mockTenant = {
      id: '',
      name: '',
      email: '',
      api_key_hash: '',
      api_key_prefix: '',
      algorand_address: orgAddress,
      is_whitelisted: true,
      created_at: '',
    }
    const result = await buildConsentRequestTxns(c.env, mockTenant, {
      userAddress,
      docType,
      reason,
      requestedFields,
      durationHours,
    })
    return c.json({
      ...result,
      message: 'Sign these transactions with your wallet and submit to the Algorand network',
    }, 200)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to build transactions'
    return c.json({ error: message }, 500)
  }
})

const createRequestSchema = z.object({
  userAddress: z.string().refine((addr) => algosdk.isValidAddress(addr), {
    message: 'Invalid Algorand address',
  }),
  docType: z.number().int().min(0).max(2),
  reason: z.string().min(1).max(500),
  requestedFields: z.number().int().min(1).max(65535),
  durationHours: z.number().int().min(1).max(8760),
})

const submitSchema = z.object({
  signedTransactions: z.array(z.string().min(1)).min(1),
  // Optional metadata for email notification
  userAddress: z.string().optional(),
  docType: z.number().int().min(0).max(2).optional(),
  reason: z.string().optional(),
  durationHours: z.number().int().optional(),
})

// Build unsigned transactions for a consent request
consent.post('/request', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400)

  const parsed = createRequestSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400)
  }

  const tenant = c.get('tenant')

  // Check on-chain whitelist status
  let isWhitelisted = false
  try {
    const algorand = getAlgorandClient(c.env)
    const boxName = buildWlBoxName(tenant.algorand_address)
    await algorand.client.algod
      .getApplicationBoxByName(Number(c.env.DX_APP_ID), boxName)
      .do()
    isWhitelisted = true
  } catch {
    // Box doesn't exist = not whitelisted
  }

  if (!isWhitelisted) {
    return c.json({ error: 'Organization not whitelisted. Contact admin.' }, 403)
  }

  try {
    const result = await buildConsentRequestTxns(c.env, tenant, parsed.data)
    return c.json({
      ...result,
      message: 'Sign these transactions with your wallet and POST to /v1/consent/submit',
    }, 200)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to build transactions'
    return c.json({ error: message }, 500)
  }
})

// Submit signed transactions
consent.post('/submit', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400)

  const parsed = submitSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400)
  }

  try {
    const result = await submitSignedTransactions(c.env, parsed.data.signedTransactions)

    // Fire email notification (non-blocking)
    const { userAddress, docType, reason, durationHours } = parsed.data
    if (userAddress && docType !== undefined && reason && durationHours) {
      const tenant = c.get('tenant')
      notifyUserConsentRequested(
        c.env, userAddress, tenant.name, tenant.algorand_address,
        docType, reason, durationHours,
      ).catch(() => {}) // silent fail — email is best-effort
    }

    return c.json({
      ...result,
      status: 'submitted',
    }, 201)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Transaction submission failed'
    return c.json({ error: message }, 500)
  }
})

consent.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id) || id < 1) {
    return c.json({ error: 'Invalid request ID' }, 400)
  }

  const request = await getConsentRequest(c.env, id)
  if (!request) {
    return c.json({ error: 'Consent request not found' }, 404)
  }

  return c.json(request)
})

consent.get('/', async (c) => {
  const tenant = c.get('tenant')
  const requests = await listConsentRequests(c.env, tenant.algorand_address)
  return c.json({ requests })
})

consent.get('/:id/valid', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id) || id < 1) {
    return c.json({ error: 'Invalid request ID' }, 400)
  }

  const result = await checkConsentValid(c.env, id)
  return c.json(result)
})

export default consent

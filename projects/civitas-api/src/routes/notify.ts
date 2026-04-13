import { Hono } from 'hono'
import { z } from 'zod'
import algosdk from 'algosdk'
import { Env, Variables } from '../types'
import { notifyUserConsentRequested, notifyOrgConsentResponse } from '../services/email'
import { getSupabase } from '../db/supabase'

const notify = new Hono<{ Bindings: Env; Variables: Variables }>()

const consentRequestSchema = z.object({
  userAddress: z.string().refine((addr) => algosdk.isValidAddress(addr), {
    message: 'Invalid user Algorand address',
  }),
  orgAddress: z.string().refine((addr) => algosdk.isValidAddress(addr), {
    message: 'Invalid org Algorand address',
  }),
  docType: z.number().int().min(0).max(2),
  reason: z.string().min(1),
  durationHours: z.number().int().min(1),
})

// Public endpoint — called by org frontend after consent request is created on-chain
notify.post('/consent-request', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400)

  const parsed = consentRequestSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400)
  }

  const { userAddress, orgAddress, docType, reason, durationHours } = parsed.data

  // Look up org name from tenants table
  const supabase = getSupabase(c.env)
  const { data: tenant } = await supabase
    .from('tenants')
    .select('name')
    .eq('algorand_address', orgAddress)
    .single()
  const orgName = tenant?.name ?? 'Unknown Organisation'

  const sent = await notifyUserConsentRequested(
    c.env, userAddress, orgName, orgAddress, docType, reason, durationHours,
  )

  return c.json({ sent }, sent ? 200 : 202)
})

const consentResponseSchema = z.object({
  orgAddress: z.string().refine((addr) => algosdk.isValidAddress(addr), {
    message: 'Invalid org Algorand address',
  }),
  userAddress: z.string().refine((addr) => algosdk.isValidAddress(addr), {
    message: 'Invalid user Algorand address',
  }),
  docType: z.number().int().min(0).max(2),
  requestId: z.number().int().min(1),
  action: z.enum(['approved', 'rejected']),
})

// Public endpoint — called by frontend after user approves/rejects on-chain
notify.post('/consent-response', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400)

  const parsed = consentResponseSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400)
  }

  const { orgAddress, userAddress, docType, requestId, action } = parsed.data

  const sent = await notifyOrgConsentResponse(
    c.env, orgAddress, userAddress, docType, requestId, action,
  )

  return c.json({ sent }, sent ? 200 : 202)
})

export default notify

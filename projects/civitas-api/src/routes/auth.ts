import { Hono } from 'hono'
import { z } from 'zod'
import algosdk from 'algosdk'
import { Env } from '../types'
import { getSupabase } from '../db/supabase'
import { hashApiKey } from '../middleware/apiKey'

const auth = new Hono<{ Bindings: Env }>()

const registerSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  algorandAddress: z.string().refine((addr) => algosdk.isValidAddress(addr), {
    message: 'Invalid Algorand address',
  }),
})

auth.post('/register', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400)

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400)
  }

  const { name, email, algorandAddress } = parsed.data
  const supabase = getSupabase(c.env)

  // Check for existing tenant
  const { data: existing } = await supabase
    .from('tenants')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    return c.json({ error: 'Email already registered' }, 409)
  }

  // Generate API key
  const randomBytes = crypto.getRandomValues(new Uint8Array(32))
  const keyBody = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  const apiKey = `cv_live_${keyBody}`
  const apiKeyHash = await hashApiKey(apiKey)
  const apiKeyPrefix = `cv_${keyBody.slice(0, 4)}`

  // Store tenant
  const { error } = await supabase.from('tenants').insert({
    name,
    email,
    api_key_hash: apiKeyHash,
    api_key_prefix: apiKeyPrefix,
    algorand_address: algorandAddress,
  })

  if (error) {
    return c.json({ error: 'Failed to create tenant' }, 500)
  }

  return c.json({
    apiKey,
    algorandAddress,
    message: 'Save your API key securely. Use /v1/consent/request to build transactions, then sign and submit via /v1/consent/submit.',
  }, 201)
})

export default auth

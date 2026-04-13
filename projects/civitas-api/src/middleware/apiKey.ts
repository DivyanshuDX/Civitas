import { Context, Next } from 'hono'
import { Env, Variables } from '../types'
import { getSupabase } from '../db/supabase'

async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function apiKeyAuth(c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401)
  }

  const apiKey = authHeader.slice(7)

  if (!apiKey.startsWith('cv_')) {
    return c.json({ error: 'Invalid API key format' }, 401)
  }

  const keyHash = await hashApiKey(apiKey)
  const supabase = getSupabase(c.env)

  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('api_key_hash', keyHash)
    .single()

  if (error || !tenant) {
    return c.json({ error: 'Invalid API key' }, 401)
  }

  c.set('tenant', tenant)

  // Log usage
  await supabase.from('usage_logs').insert({
    tenant_id: tenant.id,
    endpoint: c.req.path,
    method: c.req.method,
  })

  await next()
}

export { hashApiKey }

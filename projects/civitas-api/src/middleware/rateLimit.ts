import { Context, Next } from 'hono'
import { Env, Variables } from '../types'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS = 60 // 60 requests per minute

export async function rateLimit(c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) {
  const tenant = c.get('tenant')
  const key = tenant?.id ?? c.req.header('CF-Connecting-IP') ?? 'unknown'
  const now = Date.now()

  let entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS }
    rateLimitMap.set(key, entry)
  }

  entry.count++

  if (entry.count > MAX_REQUESTS) {
    return c.json(
      { error: 'Rate limit exceeded. Try again later.' },
      429
    )
  }

  c.header('X-RateLimit-Limit', MAX_REQUESTS.toString())
  c.header('X-RateLimit-Remaining', (MAX_REQUESTS - entry.count).toString())

  await next()
}

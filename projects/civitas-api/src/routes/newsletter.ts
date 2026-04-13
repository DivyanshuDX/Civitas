import { Hono } from 'hono'
import { Env, Variables } from '../types'
import { getSupabase } from '../db/supabase'

const newsletter = new Hono<{ Bindings: Env; Variables: Variables }>()

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

newsletter.post('/subscribe', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.email !== 'string') {
    return c.json({ error: 'Email is required' }, 400)
  }

  const email = body.email.trim().toLowerCase()
  if (!EMAIL_REGEX.test(email)) {
    return c.json({ error: 'Invalid email address' }, 400)
  }

  const supabase = getSupabase(c.env)

  // Check if already subscribed
  const { data: existing } = await supabase
    .from('newsletter_subscribers')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    return c.json({ message: 'Already subscribed' }, 200)
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email })

  if (error) {
    return c.json({ error: 'Failed to subscribe. Please try again.' }, 500)
  }

  return c.json({ message: 'Subscribed successfully' }, 201)
})

export default newsletter

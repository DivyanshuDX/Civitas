import { Hono } from 'hono'
import { z } from 'zod'
import algosdk from 'algosdk'
import { Env } from '../types'
import { getSupabase } from '../db/supabase'

const wallet = new Hono<{ Bindings: Env }>()

const addressSchema = z.object({
  walletAddress: z.string().refine((addr) => algosdk.isValidAddress(addr), {
    message: 'Invalid Algorand address',
  }),
})

const sendOtpSchema = z.object({
  walletAddress: z.string().refine((addr) => algosdk.isValidAddress(addr), {
    message: 'Invalid Algorand address',
  }),
  email: z.string().email(),
})

const verifyOtpSchema = z.object({
  walletAddress: z.string().refine((addr) => algosdk.isValidAddress(addr), {
    message: 'Invalid Algorand address',
  }),
  otp: z.string().length(6),
})

function generateOtp(): string {
  const array = crypto.getRandomValues(new Uint32Array(1))
  return String(array[0] % 1000000).padStart(6, '0')
}

// Track wallet connection
wallet.post('/track-connect', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400)

  const parsed = addressSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation failed' }, 400)
  }

  const supabase = getSupabase(c.env)
  const { walletAddress } = parsed.data
  const now = new Date().toISOString()

  // Upsert: insert new wallet or update last_seen + increment connect_count
  const { data: existing } = await supabase
    .from('wallet_connections')
    .select('id, connect_count')
    .eq('wallet_address', walletAddress)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('wallet_connections')
      .update({
        last_seen_at: now,
        connect_count: existing.connect_count + 1,
      })
      .eq('wallet_address', walletAddress)

    if (error) return c.json({ error: 'Update failed', details: error.message }, 500)
  } else {
    const { error } = await supabase.from('wallet_connections').insert({
      wallet_address: walletAddress,
      first_seen_at: now,
      last_seen_at: now,
      connect_count: 1,
    })

    if (error) return c.json({ error: 'Insert failed', details: error.message }, 500)
  }

  return c.json({ tracked: true })
})

// Generate Chatbase identity token for a connected wallet
wallet.post('/chatbase-token', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400)

  const parsed = addressSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Validation failed' }, 400)

  const { walletAddress } = parsed.data
  const secret = c.env.CHATBASE_IDENTITY_SECRET
  if (!secret) return c.json({ error: 'Chatbase not configured' }, 500)

  // Build JWT with HMAC-SHA256 (Web Crypto API)
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    user_id: walletAddress,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  }

  const enc = new TextEncoder()
  const b64url = (buf: ArrayBuffer | Uint8Array) =>
    btoa(String.fromCharCode(...new Uint8Array(buf)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const headerB64 = b64url(enc.encode(JSON.stringify(header)))
  const payloadB64 = b64url(enc.encode(JSON.stringify(payload)))
  const data = `${headerB64}.${payloadB64}`

  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  const token = `${data}.${b64url(sig)}`

  return c.json({ token })
})

// List all wallet connections (admin)
wallet.get('/connections', async (c) => {
  const supabase = getSupabase(c.env)
  const { data, error } = await supabase
    .from('wallet_connections')
    .select('wallet_address, first_seen_at, last_seen_at, connect_count')
    .order('last_seen_at', { ascending: false })

  if (error) return c.json({ error: 'Failed to fetch connections', details: error.message }, 500)
  return c.json({ connections: data ?? [] })
})

// Check if wallet has a linked email
wallet.post('/check-email', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400)

  const parsed = addressSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400)
  }

  const supabase = getSupabase(c.env)
  const { data } = await supabase
    .from('wallet_emails')
    .select('email, is_verified')
    .eq('wallet_address', parsed.data.walletAddress)
    .single()

  if (!data || !data.is_verified) {
    return c.json({ linked: false })
  }

  return c.json({ linked: true, email: data.email })
})

// Check if an email is already linked to another wallet
wallet.post('/email-available', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400)

  const parsed = sendOtpSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation failed' }, 400)
  }

  const { walletAddress, email } = parsed.data
  const supabase = getSupabase(c.env)

  const { data } = await supabase
    .from('wallet_emails')
    .select('wallet_address')
    .eq('email', email)
    .eq('is_verified', true)
    .single()

  if (data && data.wallet_address !== walletAddress) {
    return c.json({ available: false })
  }

  return c.json({ available: true })
})

// Send OTP to email
wallet.post('/send-otp', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400)

  const parsed = sendOtpSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400)
  }

  const { walletAddress, email } = parsed.data
  const supabase = getSupabase(c.env)

  const otp = generateOtp()
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min

  // Upsert wallet_emails row
  const { data: existing } = await supabase
    .from('wallet_emails')
    .select('id')
    .eq('wallet_address', walletAddress)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('wallet_emails')
      .update({
        email,
        otp_code: otp,
        otp_expires_at: otpExpiresAt,
        is_verified: false,
        updated_at: new Date().toISOString(),
      })
      .eq('wallet_address', walletAddress)

    if (error) return c.json({ error: 'Failed to update OTP' }, 500)
  } else {
    const { error } = await supabase.from('wallet_emails').insert({
      wallet_address: walletAddress,
      email,
      otp_code: otp,
      otp_expires_at: otpExpiresAt,
      is_verified: false,
    })

    if (error) return c.json({ error: 'Failed to store OTP' }, 500)
  }

  // Send email via Resend
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Civitas <noreply@dcivitas.online>',
      to: [email],
      subject: 'Your Civitas Verification Code',
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1925aa; margin-bottom: 8px;">Civitas</h2>
          <p style="color: #666; margin-bottom: 24px;">Verify your email to link it with your wallet.</p>
          <div style="background: #f5f5f5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="color: #888; font-size: 14px; margin-bottom: 8px;">Your verification code</p>
            <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1925aa;">${otp}</div>
          </div>
          <p style="color: #999; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
    }),
  })

  if (!emailRes.ok) {
    return c.json({ error: 'Failed to send verification email' }, 500)
  }

  return c.json({ message: 'Verification code sent', expiresInMinutes: 10 })
})

// Verify OTP and link wallet to email
wallet.post('/verify-otp', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400)

  const parsed = verifyOtpSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400)
  }

  const { walletAddress, otp } = parsed.data
  const supabase = getSupabase(c.env)

  const { data } = await supabase
    .from('wallet_emails')
    .select('otp_code, otp_expires_at, email')
    .eq('wallet_address', walletAddress)
    .single()

  if (!data) {
    return c.json({ error: 'No verification pending for this wallet' }, 404)
  }

  if (new Date(data.otp_expires_at) < new Date()) {
    return c.json({ error: 'Verification code expired. Request a new one.' }, 410)
  }

  if (data.otp_code !== otp) {
    return c.json({ error: 'Invalid verification code' }, 400)
  }

  // Mark as verified, clear OTP
  const { error } = await supabase
    .from('wallet_emails')
    .update({
      is_verified: true,
      otp_code: null,
      otp_expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('wallet_address', walletAddress)

  if (error) {
    return c.json({ error: 'Failed to verify' }, 500)
  }

  return c.json({ verified: true, email: data.email })
})

export default wallet

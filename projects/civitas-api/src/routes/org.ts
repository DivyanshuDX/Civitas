import { Hono } from 'hono'
import { Env, Variables, OrgAnalytics, ParsedConsentRequest } from '../types'
import { getSupabase } from '../db/supabase'
import { getAlgorandClient } from '../services/algorand'
import { buildWlBoxName, parseConsentRequest } from '../services/boxParser'
import algosdk from 'algosdk'

const org = new Hono<{ Bindings: Env; Variables: Variables }>()

org.get('/profile', async (c) => {
  const tenant = c.get('tenant')

  // Check whitelist status on-chain
  let isWhitelisted = false
  try {
    const algorand = getAlgorandClient(c.env)
    const boxName = buildWlBoxName(tenant.algorand_address)
    await algorand.client.algod
      .getApplicationBoxByName(Number(c.env.DX_APP_ID), boxName)
      .do()
    isWhitelisted = true
  } catch {
    isWhitelisted = false
  }

  return c.json({
    name: tenant.name,
    email: tenant.email,
    algorandAddress: tenant.algorand_address,
    apiKeyPrefix: tenant.api_key_prefix,
    isWhitelisted,
    createdAt: tenant.created_at,
  })
})

org.get('/usage', async (c) => {
  const tenant = c.get('tenant')
  const supabase = getSupabase(c.env)

  const page = Math.max(1, Number(c.req.query('page') ?? 1))
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') ?? 50)))
  const from = c.req.query('from')
  const to = c.req.query('to')

  let query = supabase
    .from('usage_logs')
    .select('endpoint, method, created_at', { count: 'exact' })
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })

  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)

  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data: logs, error, count } = await query

  if (error) {
    return c.json({ error: 'Failed to fetch usage logs' }, 500)
  }

  return c.json({ data: logs, total: count ?? 0, page, limit })
})

org.get('/analytics', async (c) => {
  const tenant = c.get('tenant')
  const algorand = getAlgorandClient(c.env)
  const orgAppId = Number(c.env.ORG_CONSENT_APP_ID)
  const orgPk = algosdk.decodeAddress(tenant.algorand_address).publicKey

  const requests: ParsedConsentRequest[] = []

  try {
    const boxesRes = await algorand.client.algod.getApplicationBoxes(orgAppId).do()
    const boxList = boxesRes.boxes ?? []

    for (const box of boxList) {
      const nameBytes = new Uint8Array(box.name)
      if (nameBytes.length !== 11) continue
      if (new TextDecoder().decode(nameBytes.slice(0, 3)) !== 'cr_') continue

      try {
        const boxData = await algorand.client.algod.getApplicationBoxByName(orgAppId, nameBytes).do()
        const value = new Uint8Array(boxData.value)
        // Check if this request belongs to this org
        const boxOrgPk = value.slice(0, 32)
        if (boxOrgPk.length !== 32) continue
        let match = true
        for (let i = 0; i < 32; i++) {
          if (boxOrgPk[i] !== orgPk[i]) { match = false; break }
        }
        if (!match) continue

        const nameBuf = new Uint8Array(nameBytes).buffer
        const requestId = Number(new DataView(nameBuf, 3, 8).getBigUint64(0))
        const parsed = parseConsentRequest(value, requestId)
        if (parsed) requests.push(parsed)
      } catch {
        /* skip unreadable boxes */
      }
    }
  } catch {
    return c.json({ error: 'Failed to read on-chain data' }, 500)
  }

  const now = Math.floor(Date.now() / 1000)
  const pending = requests.filter((r) => r.status === 0 && !r.isExpired).length
  const approved = requests.filter((r) => r.status === 1).length
  const rejected = requests.filter((r) => r.status === 2).length
  const revoked = requests.filter((r) => r.status === 3).length
  const expired = requests.filter((r) => r.isExpired && r.status === 0).length
  const total = requests.length

  const avgDuration = total > 0 ? Math.round(requests.reduce((s, r) => s + r.duration, 0) / total) : 0

  // Top users by request count
  const userCounts = new Map<string, number>()
  for (const r of requests) {
    userCounts.set(r.user, (userCounts.get(r.user) ?? 0) + 1)
  }
  const topUsers = [...userCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([address, requestCount]) => ({ address, requestCount }))

  // Recent requests (last 10)
  const recentRequests = [...requests].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10)

  const analytics: OrgAnalytics = {
    totalRequests: total,
    approvalRate: total > 0 ? Math.round((approved / total) * 1000) / 10 : 0,
    statusBreakdown: { pending, approved, rejected, revoked, expired },
    docTypeBreakdown: {
      aadhaar: requests.filter((r) => r.docType === 0).length,
      pan: requests.filter((r) => r.docType === 1).length,
      voterId: requests.filter((r) => r.docType === 2).length,
    },
    recentRequests,
    topUsers,
    avgDuration,
  }

  return c.json(analytics)
})

export default org

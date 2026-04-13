import { Hono } from 'hono'
import algosdk from 'algosdk'
import { Env, Variables } from '../types'
import { getIdentities, getIdentityByDocType } from '../services/identity'

const identity = new Hono<{ Bindings: Env; Variables: Variables }>()

identity.get('/:address', async (c) => {
  const address = c.req.param('address')

  if (!algosdk.isValidAddress(address)) {
    return c.json({ error: 'Invalid Algorand address' }, 400)
  }

  const identities = await getIdentities(c.env, address)
  return c.json({ address, identities })
})

identity.get('/:address/:docType', async (c) => {
  const address = c.req.param('address')
  const docType = parseInt(c.req.param('docType'), 10)

  if (!algosdk.isValidAddress(address)) {
    return c.json({ error: 'Invalid Algorand address' }, 400)
  }

  if (isNaN(docType) || docType < 0 || docType > 2) {
    return c.json({ error: 'Invalid doc type. Must be 0 (Aadhaar), 1 (PAN), or 2 (Voter ID)' }, 400)
  }

  const result = await getIdentityByDocType(c.env, address, docType)
  if (!result) {
    return c.json({ error: 'Invalid doc type' }, 400)
  }

  return c.json({ address, identity: result })
})

export default identity

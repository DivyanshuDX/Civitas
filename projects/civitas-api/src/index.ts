import { Buffer } from 'node:buffer'
globalThis.Buffer = Buffer as unknown as typeof globalThis.Buffer

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Env, Variables } from './types'
import { apiKeyAuth } from './middleware/apiKey'
import { rateLimit } from './middleware/rateLimit'
import auth from './routes/auth'
import wallet from './routes/wallet'
import consent from './routes/consent'
import identity from './routes/identity'
import org from './routes/org'
import notify from './routes/notify'
import newsletter from './routes/newsletter'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// Global middleware
app.use('*', cors({
  origin: '*',
  exposeHeaders: ['Payment-Required', 'Payment-Response', 'X-Payment', 'X-Payment-Response'],
}))

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Civitas Consent Manager API',
    version: '1.0.0',
    docs: '/v1',
  })
})

// API docs page
app.get('/v1', (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Civitas API</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 2rem; max-width: 860px; margin: 0 auto; }
    h1 { font-size: 1.8rem; margin-bottom: 0.25rem; color: #fff; }
    .subtitle { color: #888; margin-bottom: 2rem; }
    .section { margin-bottom: 2rem; }
    .section h2 { font-size: 1.1rem; color: #a78bfa; margin-bottom: 0.75rem; border-bottom: 1px solid #222; padding-bottom: 0.5rem; }
    .endpoint { background: #141414; border: 1px solid #222; border-radius: 8px; padding: 1rem; margin-bottom: 0.5rem; display: flex; align-items: flex-start; gap: 0.75rem; }
    .method { font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; min-width: 52px; text-align: center; flex-shrink: 0; }
    .get { background: #064e3b; color: #6ee7b7; }
    .post { background: #1e3a5f; color: #7dd3fc; }
    .path { font-family: 'SF Mono', monospace; font-size: 0.9rem; color: #fff; }
    .desc { color: #888; font-size: 0.85rem; margin-top: 0.2rem; }
    .badge { display: inline-block; font-size: 0.7rem; padding: 0.1rem 0.4rem; border-radius: 3px; margin-left: 0.5rem; }
    .public { background: #1a2e1a; color: #86efac; }
    .auth { background: #2e1a1a; color: #fca5a5; }
    .info { background: #1a1a2e; border: 1px solid #333; border-radius: 8px; padding: 1rem; margin-bottom: 2rem; font-size: 0.85rem; color: #aaa; line-height: 1.6; }
    code { background: #222; padding: 0.15rem 0.4rem; border-radius: 3px; font-size: 0.85rem; }
    .steps { display: flex; flex-direction: column; gap: 1rem; }
    .step { display: flex; gap: 1rem; background: #141414; border: 1px solid #222; border-radius: 8px; padding: 1.25rem; }
    .step-num { background: #a78bfa; color: #0a0a0a; font-weight: 700; font-size: 0.85rem; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .step-content { flex: 1; min-width: 0; }
    .step-title { font-weight: 600; color: #fff; margin-bottom: 0.35rem; }
    .step-desc { color: #888; font-size: 0.85rem; margin-bottom: 0.5rem; line-height: 1.5; }
    pre { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 6px; padding: 0.75rem 1rem; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.8rem; color: #c4b5fd; overflow-x: auto; margin-bottom: 0.5rem; white-space: pre-wrap; word-break: break-all; }
    a { color: #a78bfa; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Civitas Consent Manager API</h1>
  <p class="subtitle">v1.0.0 &mdash; Algorand-powered consent management</p>

  <div class="section">
    <h2>Quick Start</h2>
    <div class="steps">
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-content">
          <div class="step-title">Register with your Algorand wallet</div>
          <div class="step-desc">Provide your organization name, email, and your existing Algorand wallet address. You keep full control of your private keys.</div>
          <pre>curl -X POST ${c.req.url.replace(/\/v1$/, '')}/v1/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Your Org",
    "email": "dev@yourorg.com",
    "algorandAddress": "YOUR_ALGORAND_ADDRESS..."
  }'</pre>
          <div class="step-desc">Response:</div>
          <pre>{
  "apiKey": "cv_live_abc123...",
  "algorandAddress": "YOUR_ALGORAND_ADDRESS...",
  "message": "Save your API key securely..."
}</pre>
        </div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-content">
          <div class="step-title">Save your API key</div>
          <div class="step-desc">Your API key starts with <code>cv_live_</code> and is only shown once. Store it securely. If lost, you'll need to register a new account.</div>
        </div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-content">
          <div class="step-title">Get whitelisted</div>
          <div class="step-desc">Contact the Civitas admin to whitelist your Algorand address. This is required before you can create consent requests.</div>
        </div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-content">
          <div class="step-title">Build transactions</div>
          <div class="step-desc">Call <code>/v1/consent/request</code> to build unsigned transactions. The API returns base64-encoded transactions for you to sign.</div>
          <pre>curl -X POST ${c.req.url.replace(/\/v1$/, '')}/v1/consent/request \\
  -H "Authorization: Bearer cv_live_abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "userAddress": "ALGO_USER_ADDRESS...",
    "docType": 0,
    "reason": "KYC verification",
    "durationHours": 24
  }'</pre>
          <div class="step-desc">Response:</div>
          <pre>{
  "transactions": ["base64_txn_1...", "base64_txn_2..."],
  "groupId": "base64_group_id...",
  "requestId": 1,
  "message": "Sign these transactions..."
}</pre>
        </div>
      </div>
      <div class="step">
        <div class="step-num">5</div>
        <div class="step-content">
          <div class="step-title">Sign &amp; submit</div>
          <div class="step-desc">Sign the transactions with your wallet (using algosdk, Pera, Defly, etc.) and submit the signed transactions back:</div>
          <pre>curl -X POST ${c.req.url.replace(/\/v1$/, '')}/v1/consent/submit \\
  -H "Authorization: Bearer cv_live_abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "signedTransactions": ["base64_signed_txn_1...", "base64_signed_txn_2..."]
  }'</pre>
          <div class="step-desc">Response:</div>
          <pre>{
  "txId": "ALGO_TX_ID...",
  "status": "submitted"
}</pre>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Signing Example (JavaScript)</h2>
    <div class="step" style="display:block;">
      <div class="step-desc">Use <code>algosdk</code> to decode, sign, and re-encode the transactions:</div>
      <pre>import algosdk from 'algosdk';

// 1. Get unsigned transactions from the API
const res = await fetch('/v1/consent/request', { ... });
const { transactions } = await res.json();

// 2. Decode and sign each transaction
const account = algosdk.mnemonicToSecretKey('your mnemonic...');
const signedTxns = transactions.map(txnB64 => {
  const txnBytes = Buffer.from(txnB64, 'base64');
  const txn = algosdk.decodeUnsignedTransaction(txnBytes);
  const signed = txn.signTxn(account.sk);
  return Buffer.from(signed).toString('base64');
});

// 3. Submit signed transactions
await fetch('/v1/consent/submit', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer cv_live_...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ signedTransactions: signedTxns })
});</pre>
    </div>
  </div>

  <div class="info">
    <strong>Non-custodial:</strong> Your private keys never leave your wallet. The API only builds unsigned transactions.<br>
    <strong>Authentication:</strong> All endpoints marked <span class="badge auth" style="margin-left:0">Auth</span> require the header <code>Authorization: Bearer cv_live_...</code><br>
    <strong>Rate Limit:</strong> 60 requests per minute per API key.<br>
    <strong>Base URL:</strong> <code>${c.req.url.replace(/\/v1$/, '')}</code><br>
    <strong>Content-Type:</strong> <code>application/json</code> for all POST requests.
  </div>

  <div class="section">
    <h2>Registration</h2>
    <div class="endpoint">
      <span class="method post">POST</span>
      <div>
        <div class="path">/v1/register <span class="badge public">Public</span></div>
        <div class="desc">Register with your Algorand address. Body: <code>name</code>, <code>email</code>, <code>algorandAddress</code>. Returns API key (shown once).</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Consent Management</h2>
    <div class="endpoint">
      <span class="method post">POST</span>
      <div>
        <div class="path">/v1/consent/request <span class="badge auth">Auth</span></div>
        <div class="desc">Build unsigned transactions for a consent request. Returns base64-encoded transactions to sign. Body: <code>userAddress</code>, <code>docType</code>, <code>reason</code>, <code>durationHours</code>.</div>
      </div>
    </div>
    <div class="endpoint">
      <span class="method post">POST</span>
      <div>
        <div class="path">/v1/consent/submit <span class="badge auth">Auth</span></div>
        <div class="desc">Submit signed transactions to the Algorand network. Body: <code>signedTransactions</code> (array of base64 signed txns).</div>
      </div>
    </div>
    <div class="endpoint">
      <span class="method get">GET</span>
      <div>
        <div class="path">/v1/consent <span class="badge auth">Auth</span></div>
        <div class="desc">List all consent requests submitted by your organization.</div>
      </div>
    </div>
    <div class="endpoint">
      <span class="method get">GET</span>
      <div>
        <div class="path">/v1/consent/:id <span class="badge auth">Auth</span></div>
        <div class="desc">Get details of a specific consent request by ID.</div>
      </div>
    </div>
    <div class="endpoint">
      <span class="method get">GET</span>
      <div>
        <div class="path">/v1/consent/:id/valid <span class="badge auth">Auth</span></div>
        <div class="desc">Check if a consent request is currently active and valid.</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Identity</h2>
    <div class="endpoint">
      <span class="method get">GET</span>
      <div>
        <div class="path">/v1/identity/:address <span class="badge auth">Auth</span></div>
        <div class="desc">List all identity documents (Aadhaar, PAN, Voter ID) for a wallet address.</div>
      </div>
    </div>
    <div class="endpoint">
      <span class="method get">GET</span>
      <div>
        <div class="path">/v1/identity/:address/:docType <span class="badge auth">Auth</span></div>
        <div class="desc">Check a specific identity document. docType: 0=Aadhaar, 1=PAN, 2=Voter ID.</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Organization</h2>
    <div class="endpoint">
      <span class="method get">GET</span>
      <div>
        <div class="path">/v1/org/profile <span class="badge auth">Auth</span></div>
        <div class="desc">Get your organization profile and whitelist status.</div>
      </div>
    </div>
    <div class="endpoint">
      <span class="method get">GET</span>
      <div>
        <div class="path">/v1/org/usage <span class="badge auth">Auth</span></div>
        <div class="desc">View your recent API usage logs.</div>
      </div>
    </div>
  </div>
</body>
</html>`
  return c.html(html)
})

// Public routes (no auth)
app.route('/v1', auth)
app.route('/v1/wallet', wallet)
app.route('/v1/notify', notify)
app.route('/v1/newsletter', newsletter)

// /v1/consent/create is public — USDC fee is included in the atomic transaction group

// Protected routes (API key required)
// Skip /v1/consent/create (public, USDC fee is in the atomic txn group)
app.use('/v1/consent/*', async (c, next) => {
  if (c.req.path === '/v1/consent/create') return next()
  return apiKeyAuth(c, next)
})
app.use('/v1/consent/*', async (c, next) => {
  if (c.req.path === '/v1/consent/create') return next()
  return rateLimit(c, next)
})
app.use('/v1/identity/*', apiKeyAuth)
app.use('/v1/identity/*', rateLimit)
app.use('/v1/org/*', apiKeyAuth)
app.use('/v1/org/*', rateLimit)
app.route('/v1/consent', consent)
app.route('/v1/identity', identity)
app.route('/v1/org', org)

export default app

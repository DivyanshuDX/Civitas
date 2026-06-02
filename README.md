<div align="center">

```
 ██████╗██╗██╗   ██╗██╗████████╗ █████╗ ███████╗
██╔════╝██║██║   ██║██║╚══██╔══╝██╔══██╗██╔════╝
██║     ██║██║   ██║██║   ██║   ███████║███████╗
██║     ██║╚██╗ ██╔╝██║   ██║   ██╔══██║╚════██║
╚██████╗██║ ╚████╔╝ ██║   ██║   ██║  ██║███████║
 ╚═════╝╚═╝  ╚═══╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝
```

**Privacy-First Consent Management on Blockchain**

[![Built on Algorand](https://img.shields.io/badge/Built%20on-Algorand-00D2FF?style=for-the-badge&logo=algorand&logoColor=white)](https://algorand.com)
[![Live on TestNet](https://img.shields.io/badge/TestNet-LIVE-22C55E?style=for-the-badge)](https://dcivitas.online)
[![AlgoKit](https://img.shields.io/badge/AlgoKit-v4.0%20Ready-0D9488?style=for-the-badge)](https://github.com/algorandfoundation/algokit-cli)
[![x402 Protocol](https://img.shields.io/badge/x402-$0.10%20USDC-F59E0B?style=for-the-badge)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-6366F1?style=for-the-badge)](LICENSE)

[**🌐 Live App**](https://dcivitas.online) · [**📡 API Docs**](https://civitas-api.civitasv.workers.dev/v1) · [**📋 Contracts**](https://dcivitas.online/contracts) · [**🗺️ Roadmap**](https://dcivitas.online/roadmap)

</div>

---


**Universal Consent Layer — Privacy-First Identity Verification on Blockchain**

[![Built on Algorand](https://img.shields.io/badge/Built%20on-Algorand-00D2FF?style=for-the-badge&logo=algorand&logoColor=white)](https://algorand.com)
[![Live on TestNet](https://img.shields.io/badge/TestNet-LIVE-22C55E?style=for-the-badge)](https://dcivitas.online)
[![AlgoKit](https://img.shields.io/badge/AlgoKit-v4.0%20Ready-0D9488?style=for-the-badge)](https://github.com/algorandfoundation/algokit-cli)
[![x402 Protocol](https://img.shields.io/badge/x402-$0.10%20USDC-F59E0B?style=for-the-badge)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-6366F1?style=for-the-badge)](LICENSE)
[![DPDP Ready](https://img.shields.io/badge/DPDP-Ready-8B5CF6?style=for-the-badge)](https://dcivitas.online/compliance)
[![GDPR Ready](https://img.shields.io/badge/GDPR-Ready-3B82F6?style=for-the-badge)](https://dcivitas.online/compliance)

[**🌐 Live App**](https://dcivitas.online) · [**📡 API Docs**](https://civitas-api.civitasv.workers.dev/v1) · [**📋 Contracts**](https://dcivitas.online/contracts) · [**🗺️ Roadmap**](https://dcivitas.online/roadmap) · [**🤖 Finsy AI Agent**](https://dcivitas.online/usecases/finsy) · [**🏦 NeoBank Demo**](https://dcivitas.online/usecases/neobank)

</div>

---

## What is Civitas?

> **Civitas** is a **universal consent layer for personal data**. It lets users control exactly what identity data they share, with whom, for how long, and for what purpose — with cryptographic guarantees, not policy promises. Every consent action is recorded immutably on Algorand.

Traditional KYC is broken: organisations collect everything, store it forever, and give users zero visibility. **81.5 crore Indians had their data leaked in 2023 alone.** Civitas fixes this at the architecture level.

| Traditional KYC | Civitas |
|---|---|
| Share your entire Aadhaar | Share only Name + DOB — field-level granularity |
| Data stored on company servers forever | **Zero server-side data storage** — not even on our servers |
| No audit trail | Every action recorded on-chain, permanent and verifiable |
| Orgs hold data indefinitely | Time-bound consent with automatic expiry |
| You can't revoke it | One-click revocation — access dies in under 3 seconds |
| Black-box process | Tamper-proof smart contract enforcement |

---

## 🆕 Use Cases — One Protocol, Every Industry

Civitas is not a product for one industry. It's a universal consent layer that serves any sector where personal data is shared.

| Industry | Use Case | Live Demo |
|----------|----------|-----------|
| 🏦 **Finance** | NeoBank — KYC & account opening with field-level consent, instant revocation | [Try Demo](https://dcivitas.online/usecases/neobank) |
| 🤖 **AI Agents** | Finsy — Consent-aware AI financial agent with programmable capabilities | [Try Demo](https://dcivitas.online/usecases/finsy) |
| 🏥 **Healthcare** | Apollo Hospitals — Patient-controlled medical record sharing (coming soon) | In Progress |
| 💼 **Hiring** | VerifyKart — Background checks with candidate-controlled consent (coming soon) | In Progress |
| 🏠 **Rentals** | Aapka Ghar — Tenant verification with time-bound access (coming soon) | In Progress |
| 🎓 **Education** | Campus Edu — Credential verification reusable across institutions (coming soon) | In Progress |

---

## 🆕 Finsy — Consent-Aware AI Agent

Finsy is an AI financial agent that starts with **zero abilities**. Each capability — Tax Planning, Investment Advice, Fraud Monitoring, Loan Negotiation, Insurance Shopping — is gated by a Civitas consent. The agent literally cannot read data until the user grants consent.

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────┐
│                    CIVITAS PLATFORM                      │
│                                                          │
│  ┌──────────┐    ┌─────────────┐    ┌──────────────┐   │
│  │    Dx    │───▶│  OrgConsent │───▶│ UserIdentity │   │
│  │          │    │             │    │              │   │
│  │ Whitelist│    │  Request    │    │ Identity NFT │   │
│  │ Registry │    │  Approve    │    │ ASA Registry │   │
│  │          │    │  Reject     │    │              │   │
│  │ App ID:  │    │  Revoke     │    │ App ID:      │   │
│  │757728842 │    │ App ID:     │    │ 757173385    │   │
│  └──────────┘    │ 757863505   │    └──────────────┘   │
│                  └─────────────┘                        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              SECURITY LAYER                       │   │
│  │  X25519 + XSalsa20-Poly1305 (tweetnacl)          │   │
│  │  Ephemeral keypairs · Forward secrecy            │   │
│  │  version(1) ‖ pubKey(32) ‖ nonce(24) ‖ cipher   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              PAYMENT LAYER                        │   │
│  │  x402 HTTP-native · $0.10 USDC per consent       │   │
│  │  + 0.3 ALGO on-chain box storage (MBR)           │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Smart Contracts

Three Algorand smart contracts written in **Algorand Python (PuyaPy)** — deployed on TestNet and fully decoupled from the TypeScript SDK layer.

### 🏛️ Dx (Data eXchange) — App ID: `757728842`
> Governance and whitelist layer. Controls which organisations can participate.

```python
# ABI Methods
whitelist_organisation(address: Account) → None   # Admin only
remove_organisation(address: Account) → None       # Admin only  
is_whitelisted(address: Account) → bool            # Public
get_org_count() → uint64                           # Public
```

### 🔄 OrgConsent — App ID: `757863505`
> The consent workflow engine. Manages the full lifecycle: request → approve → expire/revoke.

```python
# ABI Methods
request_consent(user, doc_type, reason, id_details, requested_fields, duration)
approve_consent(request_id, id_details, shared_fields)   # User only
reject_consent(request_id)                               # User only
get_request(request_id) → ConsentRequest                 # Public
is_consent_valid(request_id) → bool                      # Public
```

**Consent Lifecycle:**
```
Requested ──▶ Approved ──▶ Active ──▶ Expired
     │                        │
     └───▶ Rejected           └──▶ Revoked (user can revoke anytime)
```

### 🪪 UserIdentity — App ID: `757173385`
> Creates and manages identity NFTs (ASAs) for each verified document.

```python
# ABI Methods
create_identity_asa(doc_type: uint64) → uint64     # User only — mints NFT
get_identity_asa(user, doc_type) → uint64          # Public
has_identity(user, doc_type) → bool                # Public
```

---

## Document Support & Field Bitmask

Civitas uses a `UInt8` document type (256 possible types) and `UInt16` bitmask for field selection (16 fields per doc):

| Range | Source | Documents |
|---|---|---|
| **0–9** | DigiLocker (🟢 Live) | Aadhaar, PAN, Voter ID, DL, Passport |
| **10–19** | ABDM Health (🔜) | ABHA ID, Health Records, Lab Reports |
| **20–29** | Account Aggregator (🔜) | Bank Statements, ITR, GST |
| **30–39** | EPFO (🔜) | UAN, EPF Passbook, Salary Slips |
| **40–49** | Education ABC (🔜) | Marksheets, Degrees, Certifications |
| **50+** | Custom | Org-defined schemas |

**Example field bitmask for Aadhaar:**
```
Bit 0 → Name          Bit 1 → Date of Birth    Bit 2 → Gender
Bit 3 → Address       Bit 4 → Photo            Bit 5 → Masked Number

Request bits 0+1 → org receives only Name + DOB. Nothing else.
```

---

## Encryption

Zero knowledge by design. Data never leaves the user's browser unencrypted.

```typescript
// Per-consent ephemeral keypair (forward secrecy)
const ephemeralKeypair = nacl.box.keyPair();

// Encrypt with org's on-chain public key
const encrypted = nacl.box(
  payload,
  nonce,
  orgPublicKey,        // fetched from Algorand
  ephemeralKeypair.secretKey
);

// Binary format stored on-chain:
// version(1 byte) || ephemeralPubKey(32 bytes) || nonce(24 bytes) || ciphertext
```

> **No server, no node operator, no block explorer ever sees raw identity data.**

---

## Payment Flow

```
Organisation ──[POST /consent]──▶ Civitas API
                                      │
                          ◀── 402 Payment Required
                              x-payment-address: <wallet>
                              x-payment-amount: 0.10 USDC
                                      │
Organisation ──[pays USDC]──▶ Algorand Network
Organisation ──[POST /consent + tx proof]──▶ Civitas API
                                      │
                          ◀── 200 OK (consent created on-chain)
```

**Cost per request:** `$0.10 USDC` (x402 fee) `+ 0.3 ALGO` (MBR) `+ 0.002 ALGO` (tx fee)

---

## Tech Stack

```
Frontend          Next.js 14 + TypeScript + Tailwind CSS
Wallets           Pera · Defly · Lute · Exodus (non-custodial)
                  Intermezzo (custodial — email OTP → HashiCorp Vault)
Contracts         Algorand Python (PuyaPy) — deployed on TestNet
SDK               AlgoKit Utils (73% migrated to v10)
API               Cloudflare Workers (Edge, global)
Payments          x402 Protocol — USDC on Algorand
Encryption        tweetnacl (X25519 + XSalsa20-Poly1305) + crypto.subtle
Identity          DigiLocker API (Aadhaar, PAN, Voter ID)
KMS               HashiCorp Vault Transit (Ed25519, Render free tier)
```

---

## Intermezzo — Custodial Wallet Layer

For users without crypto wallets, Civitas provides **Intermezzo**: email OTP → Algorand wallet, powered by HashiCorp Vault.

```
User enters email
      │
      ▼
6-digit OTP via Resend
      │
      ▼
Vault Transit generates Ed25519 key
      │
      ▼
Algorand address derived → 7-day session
      │
      ▼
App calls civitas-api proxy → Intermezzo signs → TestNet
```

| Endpoint | Description |
|---|---|
| `POST /v1/auth/sign-in` | Email OTP → JWT |
| `POST /v1/wallet/user` | Create custodial wallet |
| `GET /v1/wallet/users/:id` | Get address + balance |
| `POST /v1/wallet/transactions/app-call` | Sign + submit ABI call |
| `POST /v1/wallet/transactions/group-transaction` | Atomic group tx |

> ⚠️ **Known issue:** Group transaction signature bug (signing before group ID assignment). Individual transactions work fine.

---

## AlgoKit v10 Migration Status

```
Overall Readiness: ████████████████████░░░  73%

✅ Already Ready (11 areas):
   AlgorandClient.fromConfig() · algorand.newGroup() · .setDefaultSigner()
   AlgoAmount.Algos() · fixture.newScope · OnApplicationComplete enums
   assetId / appId / txId naming · Typed app clients · Indexer search

⚠️  Action Required (4 areas):
   [BREAKING] algosdk direct imports → algokit-utils subpaths   (20 files)
   [BREAKING] .do() suffix on algod calls → remove all          (22 instances)
   [MINOR]    Type import paths → root/subpath imports          (27 instances)
   [MINOR]    Contract clients → regenerate with algokit v4 CLI (6 files)
```

---

## Pricing (Organisations)

| Plan | Price | Requests/mo |
|---|---|---|
| Basic | ₹999 | 10 |
| Growth | ₹7,999/mo | 1,000 |
| Scale | ₹49,999/mo | 10,000 |
| Enterprise | Custom | Unlimited |
| Pay-per-use | $0.10 USDC | On-demand |

---

## Running Locally

```bash
# Clone
git clone https://github.com/DivyanshuDX/Civitas
cd Civitas

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Fill in: ALGORAND_NETWORK, DIGILOCKER_CLIENT_ID, etc.

# Run
npm run dev
```

**Smart contract deployment:**
```bash
# Requires AlgoKit CLI
algokit bootstrap all
algokit deploy --network testnet
```

---

## API Reference

Base URL: `https://civitas-api.civitasv.workers.dev/v1`

```
GET  /health                 Platform health check
POST /consent/request        Create consent request (x402 payment required)
GET  /consent/:id            Get consent details
POST /consent/:id/approve    Approve consent (user)
POST /consent/:id/reject     Reject consent (user)
GET  /identity/:address      Get user's identity NFTs
GET  /orgs/whitelisted       List whitelisted organisations
GET  /intermezzo             Custodial wallet service info
```

---

## Roadmap

- [x] DigiLocker integration (Aadhaar, PAN, Voter ID)
- [x] On-chain consent lifecycle (request, approve, reject, revoke, expiry)
- [x] X25519 end-to-end encryption
- [x] x402 HTTP-native payments (USDC)
- [x] Intermezzo custodial wallets
- [x] Analytics & usage dashboard for organisations
- [ ] AlgoKit v10 full migration
- [ ] ABDM Health data (ABHA ID, health records)
- [ ] Account Aggregator (bank statements, ITR)
- [ ] Intermezzo group transaction bug fix
- [ ] Algorand Mainnet deployment
- [ ] EPFO employment data
- [ ] Education (ABC) marksheets & degrees

---

## Project Structure

```
civitas/
├── app/                    # Next.js app directory
│   ├── user/               # User dashboard (consent requests, identity, history)
│   ├── organisation/       # Org dashboard (new request, analytics, usage)
│   └── admin/              # Admin dashboard (whitelist management)
├── components/             # Reusable UI components
├── contracts/              # Algorand Python smart contracts
│   ├── dx/                 # Dx whitelist contract
│   ├── orgconsent/         # OrgConsent workflow contract
│   └── useridentity/       # UserIdentity NFT contract
├── lib/
│   ├── algorand/           # AlgoKit utils, client setup
│   ├── encryption/         # X25519 + XSalsa20 encryption
│   └── x402/               # HTTP payment protocol
└── api/                    # Cloudflare Workers API
```

---

## Contributing

PRs and issues welcome. Please open an issue before large changes.

```bash
git checkout -b feat/your-feature
# make changes
git commit -m "feat: your feature description"
git push origin feat/your-feature
# open PR
```

---

<div align="center">

**Built with ♥ on Algorand · Privacy by Design**

[dcivitas.online](https://dcivitas.online) · [API](https://civitas-api.civitasv.workers.dev/v1) · [@DivyanshuDX](https://github.com/DivyanshuDX)

*© 2026 Civitas — Powered by Algorand*

</div>

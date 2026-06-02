# Civitas — Tests

This folder documents *every test* in the Venom monorepo. The tests themselves live
next to the code they cover (inside each sub-project); this is the single place that
explains *what each test verifies, where it lives, and how to run it.*

> ⚠️ This is a documentation index, not a test runner. The actual test files stay in
> their sub-projects so each package's test framework can discover them.

## At a glance

| Sub-project | Folder | Framework | Files | Test cases |
|---|---|---|---|---|
| venom-api | projects/venom-api/test/ | Vitest (Cloudflare Workers pool) | 5 | 20 |
| civitas-mcp | projects/civitas-mcp/test/ | Vitest | 4 | 17 |
| venom-frontend | projects/venom-frontend/tests/ | Playwright (E2E) | 1 | 3 |
| venom-contracts | projects/venom-contracts/tests/ | pytest (algopy testing) | 2 | 3 |
| *Total* | | | *12* | *43* |

---

## How to run everything

bash
# venom-api  (Vitest on the Cloudflare Workers pool)
cd projects/venom-api && npm test

# civitas-mcp  (Vitest, unit-level with mocks)
cd projects/civitas-mcp && npm test

# venom-frontend  (Playwright E2E — needs LocalNet + dev server on :5173)
cd projects/venom-frontend && npm run playwright:test

# venom-contracts  (pytest — needs LocalNet running for the client test)
cd projects/venom-contracts && poetry run pytest


---

## 1. venom-api — Consent Manager API (Cloudflare Worker)

*Location:* projects/venom-api/test/ · *Framework:* Vitest with cloudflare:test
(SELF.fetch exercises real route handlers; env exposes bindings).
*Run:* cd projects/venom-api && npm test (watch: npm run test:watch)

### smoke.spec.ts — health endpoint (1 test)
| Test | What it verifies |
|---|---|
| health → returns API metadata at / | GET / returns 200 and a body matching { name: 'Civitas Consent Manager API' }. |

### agent.spec.ts — agent-facing HTTP routes (8 tests)
All requests use a Bearer cv_test_only_DO_NOT_USE_IN_PROD API key via the authed() helper.

| Test | What it verifies |
|---|---|
| GET grants → 401 without API key | Unauthenticated GET /v1/agent/grants/:user is rejected with 401. |
| GET grants → 200 + empty array with API key | Authed grants listing returns 200 with grants: [] (or 403 if the route short-circuits on ownership). Allows 30s because it scans consent boxes on-chain. |
| GET read → 404 when request does not exist | Reading a field for a non-existent request id returns 404. |
| GET read → 400 when field unknown for docType | Reading an unknown field tolerates 400/403/404 (no on-chain fixture seeded). |
| agent memory → writes then reads a memory fact | POST a fact to /v1/agent/memory/:user then GET returns it back (200, fact present). |
| step-up → creates a pending step-up and polls it | POST /v1/agent/step-up/request returns 201 + stepUpId; polling shows status awaiting. |
| step-up decide → approve then reject second decision (409) | Approving a pending step-up returns 200/approved, poll confirms, and a second decision is refused with 409 (idempotency). |
| step-up decide → 400 when status is invalid | Deciding with status: 'maybe' returns 400. |

### accessLog.spec.ts — accessLog service (3 tests)
Calls recordAccess / listAccess directly against the test env.

| Test | What it verifies |
|---|---|
| records and lists accesses for a request | A recorded access gets an id and shows up in listAccess. |
| keeps both entries when same requestId logged twice | Two records under one requestId both persist (≥2 entries). |
| isolates logs across requestIds | Listing an unrelated requestId returns [] (no cross-leak). |

### mockPii.spec.ts — mockPii service (5 tests)
Pure-function tests on the canned-PII helpers (readMockField, listMockFields).

| Test | What it verifies |
|---|---|
| canned PAN for docType=1 field "pan" | Returns ABCDE1234F. |
| canned Aadhaar for docType=0 field "aadhaar" | Returns 1234-5678-9012. |
| null for unknown field | Unknown field → null. |
| null when docType is unknown | Unknown docType → null. |
| listMockFields returns fields / [] for unknown | docType 1 contains pan + salary_band; unknown docType → []. |

### memory.spec.ts — memory service (3 tests)
Exercises writeMemoryFact / readMemoryFacts against the test env.

| Test | What it verifies |
|---|---|
| round-trips a fact | Written fact is returned verbatim by readMemoryFacts. |
| isolates facts per agent/user pair | Facts for AGENT_A are not visible to AGENT_B. |
| replaces fact with same capabilityId + label | Re-writing the same key dedups to one entry with the *new* value. |

---

## 2. civitas-mcp — MCP server / SDK (Node)

*Location:* projects/civitas-mcp/test/ · *Framework:* Vitest (unit-level, mocked deps).
*Run:* cd projects/civitas-mcp && npm test (watch: npm run test:watch)

### tools.spec.ts — MCP tool handlers (11 tests)
Each handler is tested with a mocked api / signer to assert wiring & return shape.

| Test | What it verifies |
|---|---|
| handleRequestConsent | Builds → signs → submits; returns { requestId, status: 'awaiting', txId } and calls api/signer in order. |
| handlePollRequest → maps status + forwards isExpired | Numeric status 1 → 'approved', isExpired forwarded. |
| handlePollRequest → defaults isExpired false | Missing isExpired defaults to false; status 3 → 'revoked'. |
| handleRevoke | Returns a guidance note (pointing to dashboard) without calling the API. |
| handleReadField | Forwards (requestId, field) to api.readField and returns its result. |
| handleListGrants | Forwards userAddress to api.listGrants. |
| handleRequestStepUp | Forwards the full input object to api.requestStepUp. |
| handlePollStepUp | Forwards stepUpId to api.pollStepUp. |
| handleWriteMemory | Forwards (user, fact) to api.writeMemory. |
| handleReadMemory | Forwards userAddress to api.readMemory. |
| handleGetAgentInfo | Returns { agentAddress, verified: false, note: /Phase 2/ }. |

### signer.spec.ts — AgentSigner (2 tests)
Uses a freshly generated algosdk account + mnemonic.

| Test | What it verifies |
|---|---|
| exposes the agent address | signer.address matches the account address. |
| signs base64-encoded unsigned transactions | Signing a base64 payment txn returns one base64 string. |

### config.spec.ts — loadConfig (2 tests)
| Test | What it verifies |
|---|---|
| returns parsed config when all env vars set | Maps CIVITAS_API_URL/KEY + AGENT_MNEMONIC into the config object. |
| throws when CIVITAS_API_KEY missing | Missing key throws an error mentioning CIVITAS_API_KEY. |

### api.spec.ts — CivitasApi HTTP client (2 tests)
fetch is stubbed globally per test.

| Test | What it verifies |
|---|---|
| requestConsent posts with bearer auth | POST /v1/consent/request with Authorization: Bearer …; returns requestId. |
| readField hits /v1/agent/read/:id/:field | GET /v1/agent/read/7/pan; returns the field value. |

---

## 3. venom-frontend — dApp UI (React + Vite)

*Location:* projects/venom-frontend/tests/ · *Framework:* Playwright (E2E).
*Run:* cd projects/venom-frontend && npm run playwright:test
*Prereqs:* LocalNet running and the dev server on http://localhost:5173.
(npm test runs Jest with --passWithNoTests — there are currently no Jest unit tests.)

### example.spec.ts — scaffolded E2E smoke tests (3 tests)
> These are the default AlgoKit React template tests, not Venom-specific coverage yet.

| Test | What it verifies |
|---|---|
| has title | Page title is AlgoKit React Template. |
| get started link | getting-started element reads "Getting started". |
| authentication and dummy payment transaction | Connects a KMD wallet, sends a dummy payment, and sees the "Transaction sent:" notification. |

---

## 4. venom-contracts — Algorand smart contracts (Python)

*Location:* projects/venom-contracts/tests/ · *Framework:* pytest + algopy_testing.
*Run:* cd projects/venom-contracts && poetry run pytest
(pythonpath is set to smart_contracts + tests in pyproject.toml.)

### dx_test.py — Dx contract unit test (1 test)
Runs in an in-memory algopy_testing_context (no network).

| Test | What it verifies |
|---|---|
| test_hello | Dx().hello(x) returns "Hello, {x}" for a random 10-char input. |

### dx_client_test.py — Dx client / deployment test (2 tests)
Deploys the contract via DxFactory against a real network (LocalNet).

| Test | What it verifies |
|---|---|
| test_says_hello | Deployed app's hello("World") returns "Hello, World". |
| test_simulate_says_hello_with_correct_budget_consumed | A 2-call simulated group returns both greetings and consumes < 100 app budget. |

---

## Coverage notes / gaps

- *venom-frontend* has only the scaffolded template E2E tests — no Venom-specific UI
  or unit tests yet, and npm test (Jest) currently passes with *zero* tests.
- *venom-contracts* coverage is minimal (the template hello method only); the real
  consent/DX contract logic is not yet exercised.
- *venom-api* and *civitas-mcp* are the best-covered packages (service-level +
  route-level for the API, handler/client/signer/config units for the MCP server).
- Several venom-api route tests intentionally accept multiple status codes because no
  on-chain fixtures are seeded — tighten these once LocalNet fixtures exist.

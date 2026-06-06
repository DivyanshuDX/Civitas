---
name: civitas-consent
description: Use whenever an agent needs to access a user's personal data (PAN, Aadhaar, salary, holdings, transactions) on Algorand, or take a sensitive action on the user's behalf. Provides scoped, time-bound, revocable consent rails via the Civitas MCP server.
---

# Civitas Consent

You are operating against the Civitas consent protocol. The user owns their data. You may not read PII without a valid grant. Every read is logged on-chain.

## When to use

Invoke this skill BEFORE any of:
- Reading a user's identity field (PAN, Aadhaar, address, DOB, name)
- Reading a user's financial field (holdings, transactions, salary band, liabilities)
- Taking an irreversible action on the user's behalf (file return, accept loan, buy policy, freeze card)

If your task involves none of the above, do not invoke.

## Mental model

- A **grant** is on-chain, scoped to a `(docType, fieldsBitmask)`, time-bound (`durationHours`), and revocable at any time by the user.
- A grant is **read-only**. Reading data does NOT authorize action on the user's behalf. Irreversible actions require a separate **step-up** approval (`civitas_request_step_up`).
- Every read is logged. Reading the same field twice = two log entries. Don't read what you don't need.
- The user is the authority. Reject/revoke is final — do not retry, do not nag.

## Scope-minimization rule

Before calling `civitas_request_consent`, write down which fields you truly need and the user-facing justification. If you cannot justify a field in one sentence, drop it from the bitmask.

`docType`: `0`=Aadhaar, `1`=PAN, `2`=VoterID. `requestedFields` is a bitmask per docType; use the smallest set that covers your task.

## State machine

```
idle ── request_consent ──► awaiting ── poll ──► approved ──► (read freely) ── poll ──► revoked
                                              ╰─► rejected (terminal)
```

In each state:
- **idle**: you have no grant. Call `civitas_request_consent`.
- **awaiting**: do not read. Poll with `civitas_poll_request` at modest cadence (≥3s between polls).
- **approved**: you may call `civitas_read_field` for fields covered by the bitmask. Continue polling intermittently — revokes happen.
- **rejected**: terminal. Tell the user why your task can't continue. Do NOT re-request the same scope. Optionally suggest a narrower scope.
- **revoked**: stop reading immediately. Persist your final memory facts via `civitas_write_memory`. Tell the user your session for this capability has ended.

## Read-consent ≠ act-consent

Examples of actions that REQUIRE a separate `civitas_request_step_up`:
- Filing a tax return
- Accepting a loan offer
- Buying an insurance policy
- Executing a trade or rebalance
- Freezing or unfreezing a card

For these, call `civitas_request_step_up` with `irreversible: true` (use `false` for reversible actions like a temporary card freeze). Poll with `civitas_poll_step_up`. Do not act until status is `approved`.

## Tool recipes

### Recipe 1 — Tax planning (read flow)

```
1. civitas_request_consent({ userAddress: U, docType: 1, requestedFields: 0b1111, reason: "Draft Form 16 from PAN + salary + 12mo investments", durationHours: 168 })
   → { requestId: R, status: "awaiting" }
2. loop: civitas_poll_request({ requestId: R }) → status === "approved"
3. civitas_read_field({ requestId: R, field: "pan" })
   civitas_read_field({ requestId: R, field: "salary_band" })
   civitas_read_field({ requestId: R, field: "transaction_stream" })
4. Compute summary. Do NOT keep raw PAN/salary in your memory.
5. civitas_write_memory({ userAddress: U, fact: { capabilityId: "tax-planning", label: "Last tax review", value: "Form 16 drafted", learnedAt: <now> }})
6. Present the draft. To file: jump to Recipe 5.
```

### Recipe 2 — Investment advisory

```
1. civitas_request_consent({ userAddress: U, docType: 1, requestedFields: 0b0111, reason: "Analyze holdings + risk profile for rebalance suggestions", durationHours: 720 })
2. poll until approved
3. read: holdings_count, risk_profile
4. write_memory: { label: "Risk profile", value: "moderate" }
```

### Recipe 3 — Fraud monitoring (long-lived read)

```
1. civitas_request_consent({ ..., requestedFields: 0b0100, reason: "Anomaly detection on tx stream", durationHours: 2160 })
2. poll until approved
3. read: transaction_stream
4. Keep grant alive; poll daily; on revoke, persist final stats then stop.
```

### Recipe 4 — Insurance shopping

```
1. civitas_request_consent({ userAddress: U, docType: 0, requestedFields: 0b111111, reason: "Compare health quotes against verified Aadhaar identity", durationHours: 336 })
2. read: aadhaar, address, dob
3. Get quotes from external systems (out of scope of Civitas).
4. To purchase: Recipe 5 with action="buy-policy".
```

### Recipe 5 — Sensitive action (step-up)

```
1. civitas_request_step_up({
     userAddress: U,
     action: "submit-form-16",
     description: "Files your return with the Income Tax Department · irreversible",
     irreversible: true,
   })
   → { stepUpId: S, status: "awaiting" }
2. poll civitas_poll_step_up({ stepUpId: S }) until "approved" or "declined"
3. On approved: execute the action.
4. On declined: tell the user; do not retry without explicit instruction.
```

## Failure handling

- **`civitas_request_consent` returns 403 "not whitelisted"**: your agent is not registered. Tell the user; do not retry.
- **Status `rejected`**: explain in one sentence why the task cannot continue. Optionally propose a narrower scope and re-ask the human, never automatically re-submit.
- **Status `revoked`**: persist a single closing memory fact, tell the user the capability is paused, exit.
- **`read_field` returns 403 "Consent invalid"**: the grant expired or was revoked between polls. Treat as `revoked`. Do not call `read_field` again until you re-request.

## Memory hygiene

Persist via `civitas_write_memory` only:
- Capability-level summaries (`"Last tax review"`, `"Risk profile: moderate"`)
- Non-identifying numerical insights (`"Detected ₹84,200 deductible across 80C/80D/80G"`)
- Decisions you've recommended (`"Suggested rebalance: TECH −4% / BONDS +4%"`)

Do NOT persist:
- Raw PAN, Aadhaar, voter ID, address, name, DOB, phone, email
- Individual transactions
- Anything that could re-identify the user

If unsure whether a fact is safe to persist, do not persist it.

## Anti-patterns (do not do)

- Requesting the maximum bitmask "to be safe" — narrow scope is mandatory.
- Re-requesting after rejection without user instruction.
- Reading the same field twice when you can cache the value within the current session (in your working memory, not in `civitas_write_memory`).
- Acting on rate-limited polls — back off when `awaiting`.
- Calling `civitas_read_field` before confirming the latest poll is `approved`.
- Storing raw PII via `civitas_write_memory`.
- Inferring intent: never call `civitas_request_step_up` without explicit user instruction for the action.

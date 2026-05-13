# Jupiter Bounty Submission: JupBrain

**Repo:** https://github.com/belalangeth/jupbrain

**Developer Platform Email:** ketuapartai29@gmail.com

**Demo:** https://jupbrain-f6ca.vercel.app/

---

## 1. Project Overview

JupBrain is a Next.js terminal dashboard pulling Jupiter's Native Swap V2, Tokens V2, and Prediction V1 APIs into one interface.

We skipped the Terminal widget and called the **Native V2 Order & Execute API** directly. A custom backend proxy handles exact micro-USD bet sizing, routes `x-api-key` without exposing it to the client, and parses raw base64 transaction buffers so bets and swaps execute through the user's wallet from a single screen, no page hop.

---

## 2. Developer Experience Report

### Time to First Call

About 15 minutes. The API key provisioned immediately. The friction came from migrating off V6 quote onto the **V2 Native Swap API** (`/order` → `/execute`). The new mental model is genuinely better — order and transaction arrive together instead of being assembled separately — but the error handling changed quietly, with no migration note anywhere in the docs.

---

### Bugs & Documentation That Need Fixing

**1. Prediction API: micro-USD unit not declared in schema**

Link: [Prediction API Events](https://developers.jup.ag/docs/api-reference/prediction/get-events)

The schema defines `buyYesPriceUsd` and `volume` as plain `number` with no unit annotation. We only found the micro-USD convention by digging through a separate "Common Questions" page — not the API reference where it belongs. Before we caught it, our UI was showing 99% odds on every market and $18 trillion in volume because `Math.round(700000 * 100)` was silently overflowing.

**Fix:** Add a `Micro USD (÷ 1,000,000)` annotation directly on the property description in the API reference, not buried in a guide.

---

**2. Prediction `/orders`: `depositAmount` format not strictly typed**

Link: [Prediction Market Guide](https://developers.jup.ag/docs/guides/how-to-build-a-prediction-market-app-on-solana)

The guide shows `depositAmount: "2000000"` as a string. Pass it as a number and the endpoint throws a validation error with no useful message explaining why.

**Fix:** Strict TypeScript `string` in the schema. Not `number | string`.

---

**3. Swap V2 `/order`: 200 OK with an error body**

When a `taker` address has insufficient SOL for gas or the swap amount, the API returns HTTP **200 OK** with `"transaction": ""` and `"errorCode": 1, "errorMessage": "Insufficient funds"`. Standard `!res.ok` checks pass, the frontend gets an empty string, and the deserializer crashes on an empty buffer.

**Fix:** Return `400 Bad Request` when the transaction builder rejects the request. A 200 with an error body isn't a response, it's a trap.

---

### Impact on AI-assisted Development

We used an AI coding agent to map JSON schemas into TypeScript interfaces. Because the OpenAPI spec defines prices as plain `number` with no unit context, the AI generated standard USD types across the board, and the entire pricing layer was wrong until we caught it manually.

An `llms.txt` or explicit OpenAPI annotations stating *"all `*PriceUsd` fields are micro-USD (1e6)"* would fix this without any manual correction step. AI-assisted integration is already common enough that it's worth treating as a first-class documentation concern.

---

### Two Things We'd Ask For in developers.jup.ag

**1. Inline API Playground**

"Copy cURL" shouldn't be the primary testing path. An embedded Swagger-style UI — paste your API key once, adjust parameters in input fields, see the live JSON response inline — would cut onboarding time for new integrators substantially.

**2. A unified error schema**

V6 Quote returns `{ error: string }`. V2 Order returns `{ errorCode: number, errorMessage: string }` over a 200 status. You can't write a single correct error handler that covers both. One format, correct HTTP status codes, applied consistently across all endpoints.

---

### Two Features We Wish Existed

**1. Prediction Market WebSocket**

Live odds right now require polling `/events` or `/markets` aggressively. A `wss://` feed pushing real-time price ticks would make trading UIs meaningfully more responsive without hammering the REST endpoints.

**2. `@jup-ag/react` hooks package**

The boilerplate per integration is significant: base64-decode the transaction, call `VersionedTransaction.deserialize()`, run `signTransaction` from the wallet adapter, handle pre-flight. A hook like `await executePrediction(marketId, isYes, amount)` cuts that from a few hours to a few minutes. It's the kind of thing that determines whether a hackathon team ships or gives up at 2am.

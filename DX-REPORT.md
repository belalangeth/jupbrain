# Jupiter Bounty Submission: JupBrain

**Repo:** https://github.com/belalangeth/jupbrain
**Developer Platform Email:** [Your Jupiter Email Here]
**Demo:** https://jupbrain-f6ca.vercel.app/

---

## 1. Project Overview

JupBrain is a Next.js terminal dashboard that integrates Jupiter's Native Swap V2 API, Tokens V2 API, and Prediction V1 API into a single interface.

Instead of using the Jupiter Terminal widget, we implemented the **Native V2 Order & Execute API** directly. We built a custom backend proxy that handles exact micro-USD bet sizing, routes `x-api-key` securely, and parses raw transaction base64 buffers to execute bets and trades via the user's wallet — all from one dashboard without a page hop.

---

## 2. Developer Experience Report

### Time to First Call

~15 minutes. The API key from the Developer Portal was instant. Moving from V6 quote to the **V2 Native Swap API** (`/order` → `/execute`) added friction. The new mental model (Get Order which includes the Tx → Execute) is better, but the error handling paradigm changed without warning.

---

### Bugs & Documentation That Need Fixing

**1. Prediction API: micro-USD unit not declared in schema**

- Link: [Prediction API Events](https://developers.jup.ag/docs/api-reference/prediction/get-events)
- The schema defines `buyYesPriceUsd` and `volume` as plain `number` with no unit annotation. We only discovered the micro-USD convention by digging through a separate "Common Questions" guide page.
- Result: our UI initially displayed 99% odds on every market and $18 trillion in volume due to `Math.round(700000 * 100)` overflow.
- **Fix:** Add a `Micro USD (÷ 1,000,000)` annotation directly on the property description in the API Reference page.

**2. Prediction `/orders`: `depositAmount` format not strictly typed**

- Link: [Prediction Market Guide](https://developers.jup.ag/docs/guides/how-to-build-a-prediction-market-app-on-solana)
- The guide shows `depositAmount: "2000000"` as a string. The endpoint throws a confusing validation error when passed as a number.
- **Fix:** Use a strict TypeScript `string` type in the schema, not `number | string`.

**3. Swap V2 `/order`: 200 OK with an error body**

- When a `taker` address has insufficient SOL for gas or the swap amount, the API returns HTTP **200 OK** with `"transaction": ""` and `"errorCode": 1, "errorMessage": "Insufficient funds"`.
- This breaks standard `!res.ok` checks. Our frontend consumed the empty string and crashed when trying to deserialize an empty buffer.
- **Fix:** Return `400 Bad Request` when the transaction builder rejects the request due to insufficient balance.

---

### Impact on AI-assisted Development

We used an AI coding agent to map JSON schemas into TypeScript interfaces. Because Jupiter's OpenAPI spec defines prices as plain `number` with no unit context, the AI mapped them as standard USD. The entire pricing layer was wrong until we caught it manually.

If Jupiter provided an `llms.txt` or OpenAPI annotations explicitly defining *"all `*PriceUsd` fields are micro-USD (1e6)"*, AI-assisted integration would produce correct types without any manual correction.

---

### Two Things We'd Ask For in developers.jup.ag

**1. Inline API Playground**
Replace "Copy cURL" as the primary testing method. An interactive Swagger-style UI embedded directly in the docs — paste your API key once, adjust parameters via input fields, see the live JSON response inline — would cut onboarding time significantly.

**2. Unified error schema**
V6 Quote returns `{ error: string }`. V2 Order returns `{ errorCode: number, errorMessage: string }` with a 200 OK status. SDK builders cannot write a single correct error handler for both. Pick one format, use it across all endpoints, and use correct HTTP status codes.

---

### Two Features We Wish Existed

**1. Prediction Market WebSocket**
Getting live odds currently requires aggressive polling against `/events` or `/markets`. A `wss://` feed pushing real-time price updates would make trading UIs substantially more responsive.

**2. `@jup-ag/react` hooks package**
The boilerplate for base64-decoding a transaction, running `VersionedTransaction.deserialize()`, calling `signTransaction` from the wallet adapter, and handling pre-flight checks is significant overhead for every integration. A hook like `await executePrediction(marketId, isYes, amount)` would cut integration time from hours to minutes.

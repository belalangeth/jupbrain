# Jupiter Bounty Submission: JupBrain

**Project Repo:** [https://github.com/belalangeth/jupbrain](https://github.com/belalangeth/jupbrain)
**Developer Platform Email:** [Tulis Email Jupiter Anda Di Sini]
**Demo URL:** [Tulis Link Vercel/Deployment Anda Di Sini]

---

## 1. The Project: JupBrain
**What it is:** JupBrain is a unified, high-performance terminal dashboard built on Next.js that aggressively combines Jupiter's Native Swap V2 API, Tokens V2 API, and the Prediction V1 API into a single, seamless, retro-futuristic interface. 

**The weird/ambitious part:** Instead of relying on the standard Jupiter Terminal widget (which is great, but abstracts too much), we fully stripped it down and implemented the **Native V2 Order & Execute API** directly alongside the **Prediction V1 API**. We built a custom backend proxy that handles exact micro-USD bet sizing, routes `x-api-key` securely, and parses raw transaction base64 buffers to execute bets and trades directly via the user's wallet. It maps the Polymarket/Kalshi Clob liquidity straight into a 1-click Solana transaction without leaving the unified dashboard.

---

## 2. Developer Experience (DX) Report

### Onboarding & Time to First Call
**Time to first successful call:** ~15 minutes.
Getting the API key from the new Developer Portal was instantaneous. Fetching a basic route via `quote-api` was fast. However, shifting from the V6 quote to the **V2 Native Swap API** (`/order` and `/execute`) added friction. The mental model switch from "Get Quote -> Get Swap Tx" to "Get Order (which includes the Tx) -> Execute" is vastly superior, but the error handling paradigms shifted unexpectedly (more on this below).

### What's Broken / Missing in the Docs
1. **Prediction API Micro-USD Ambiguity:** 
   *Link:* [Prediction API Events](https://developers.jup.ag/docs/api-reference/prediction/get-events)
   *Issue:* The JSON schema definition in the docs specifies `buyYesPriceUsd: 123` and `volume: 123` as `number`. It **does not explicitly state in the schema table** that these values are in **Micro USD**. We had to dig into a completely separate guide page under "Common Questions" to realize we needed to do `(parseInt(microUsd) / 1_000_000)`. Because of this, our UI initially showed 99% odds for everything (due to `Math.round(700000 * 100)` overflow) and 18 Trillion USD in volume. 
   *Fix:* Annotate `Micro USD` explicitly on the property descriptions in the API Reference page.

2. **Deposit Amount format in Prediction `/orders`:**
   *Link:* [Prediction Market Guide](https://developers.jup.ag/docs/guides/how-to-build-a-prediction-market-app-on-solana)
   *Issue:* The guide says `depositAmount: "2000000"` ($2.00). But the `/orders` endpoint throws confusing validation errors if passed as a standard number instead of a string. The requirement to pass exact stringified lamports/micro-USD should be typed strictly in the API docs.

### Where the APIs Bit Us (Edge Cases & Quirks)
**The 200 OK "Insufficient Funds" Trap in Swap V2 `/order`:**
When passing a `taker` address to `https://api.jup.ag/swap/v2/order`, if the user has an insufficient SOL balance to pay for gas or the exact swap amount, the API returns a **200 OK** HTTP status. However, the JSON payload contains `"transaction": ""` and `"errorCode": 1, "errorMessage": "Insufficient funds"`. 
*Why it bites:* Standard `fetch` wrappers rely on `!res.ok` to catch errors. Because it returned 200 OK, our frontend happily consumed the empty `transaction` string and threw a generic local exception when trying to deserialize a blank buffer. REST APIs should ideally return `400 Bad Request` if the transaction builder natively rejects the payload due to insufficient user funds.

### AI Stack Experience
We heavily utilized an AI coding agent to map the JSON schemas into TypeScript interfaces. 
*What failed:* AI slop happens when docs lack semantic typing. Because the OpenAPI/Swagger specs of Jupiter's APIs define prices as standard `number` or `string`, the AI blindly mapped them as standard USD. If Jupiter provided a native **MCP (Model Context Protocol) Server** or a heavily commented `llms.txt` that strictly defines *"All USD variables ending in PriceUsd are 1e6 Micro-USD"*, AI integration would be flawless out of the box.

### How We Would Rebuild developers.jup.ag
If we were engineering the Dev Platform:
1. **Inline API Playgrounds:** Get rid of "Copy cURL" as the primary testing method. Implement an interactive Swagger-like UI directly in the docs where devs can paste their API Key once, change parameters via input boxes, and hit "Send" to see the live JSON response right below the code block.
2. **Unified Error Schemas:** Standardize errors across the board. If V6 Quote returns `{ error: string }`, V2 Order shouldn't return `{ errorCode: number, errorMessage: string }` with a 200 OK status. Predictability is everything for SDK builders.

### What We Wish Existed
1. **Prediction Market WebSockets:** Currently, to get live odds for Polymarket/Kalshi events on Solana, we have to aggressively poll the `/events` or `/markets` endpoints. A `wss://` feed pushing real-time micro-USD price updates would make trading UIs buttery smooth.
2. **Native React Hooks Package:** We wish `@jup-ag/react` existed—an official library exporting hooks like `useSwapV2()` or `usePredictionMarket()`. Writing the boilerplate to base64-decode the transaction, run `VersionedTransaction.deserialize()`, grab `signTransaction` from the wallet adapter, and handle pre-flight checks manually is tedious. Abstracting this into a single `await executePrediction(marketId, isYes, amount)` hook would cut integration time from hours to minutes.

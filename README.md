# JupBrain

A terminal dashboard for Jupiter's Native Swap V2, Tokens V2, and Prediction V1 APIs with one screen, no page hops.

**[Live Demo →](https://jupbrain-f6ca.vercel.app/)**

---

## What it does

Most Jupiter integrations reach for the Terminal widget. JupBrain skips it and calls the **Native V2 Order & Execute API** directly. A custom backend proxy handles micro-USD bet sizing, keeps `x-api-key` off the client, and deserializes raw base64 transaction buffers so swaps and prediction bets both execute from your wallet without leaving the dashboard.

The V2 mental model is cleaner than V6; order and transaction arrive together instead of being assembled across two separate calls. Getting there required some undocumented digging, but the integration surface is tighter because of it.

---

## Stack

- **Next.js 15** (App Router)
- **Jupiter Native Swap V2** — `/order` + `/execute`, no widget
- **Jupiter Prediction V1** — market listing, live odds, bet execution
- **Jupiter Tokens V2** — token metadata and price context
- **Backend proxy** — hides API key, normalizes micro-USD, parses transaction buffers

---

## Getting started

```bash
npm install
cp .env.example .env.local
# Add your Jupiter API key to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```env
JUPITER_API_KEY=your_key_here
```

The key is read server-side only. It never reaches the browser.

---

## Things worth knowing before you integrate Jupiter yourself

Micro USD isn't documented where you'll look for it. Fields like buyYesPriceUsd and volume in the Prediction API are typed as plain number in the schema with no unit annotation. The actual unit is micro USD, so divide by 1,000,000. Before we caught it, the dashboard showed 99% odds on every market and $18 trillion in volume. The fix is one line in the API reference. It just hasn't landed yet.

**`depositAmount` has to be a string.** The guide shows `"2000000"` with quotes. Pass it as an integer and the endpoint throws a validation error with no explanation.

**Swap V2 returns HTTP 200 on failure.** Insufficient SOL for gas comes back as `200 OK` with `"transaction": ""` and `"errorCode": 1`. A standard `!res.ok` check passes, your frontend gets an empty string, and the deserializer crashes. We handle it explicitly now; it should be a 400.

---

## Deploying

Vercel works out of the box. The proxy runs as an API route, so the key stays in environment variables and never touches the client bundle.

```bash
vercel deploy
```

Set `JUPITER_API_KEY` under Environment Variables in your Vercel project settings.

---

## Contributing

Issues and PRs are open. If you're building on Jupiter's Prediction API and hit the micro-USD problem or the 200-on-error behavior, the relevant code is in `app/api/`.

---

*Built for the Jupiter Bounty program.*

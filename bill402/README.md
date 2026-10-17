<p align="center">
  <a href="https://bill402.vercel.app">
    <img src="./public/brand/logo.png" alt="bill402 logo" width="110" />
  </a>
</p>

<h1 align="center">bill402 · service</h1>

<p align="center">
  <strong>Invoices any AI agent can pay.</strong><br />
  Next.js 16 · x402 v2 · USDC on Base
</p>

<p align="center">
  <a href="https://bill402.vercel.app"><img alt="Live" src="https://img.shields.io/badge/live-bill402.vercel.app-000000?style=flat-square&logo=vercel&logoColor=white" /></a>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="x402" src="https://img.shields.io/badge/x402-v2-5B4CF5?style=flat-square" />
  <img alt="USDC" src="https://img.shields.io/badge/settles-USDC%20on%20Base-0052FF?style=flat-square" />
  <a href="../LICENSE"><img alt="MIT" src="https://img.shields.io/badge/license-MIT-0A0A0A?style=flat-square" /></a>
</p>

---

Invoices any AI agent can pay. Create an invoice, get an x402 URL — agents on PayBox (or any x402 client) discover it, pay in USDC, you get the webhook and an on-chain receipt.

Built for the MoonPay PayBox hackathon, Chapter 1 (Merchant tools).

## Payment flow

```mermaid
sequenceDiagram
  autonumber
  participant M as Merchant / agent
  participant B as bill402
  participant C as x402 client
  participant F as Facilitator
  participant H as Base

  M->>B: POST /api/invoices
  B-->>M: payUrl + receiptUrl
  C->>B: GET /api/invoices/:id
  B-->>C: 402 + exact-scheme USDC requirements
  C->>B: retry with X-PAYMENT (EIP-3009)
  B->>F: verify + settle
  F->>H: transferWithAuthorization
  H-->>F: tx hash
  F-->>B: settled
  B-->>C: 200 + receipt
  B->>M: webhook (optional)
```

## Routes

| Route | What it is |
| --- | --- |
| `GET /` | Landing page — hero, how it works, FAQ, footer |
| `GET /new` | Create-an-invoice form |
| `GET /status` | Settled count, volume, network, facilitator |
| `GET /r/:id` | Public receipt with the on-chain transaction link |
| `POST /api/invoices` | Create an invoice → `{ payUrl, receiptUrl, invoice }` |
| `GET /api/invoices/:id` | x402 pay-per-call resource — returns `402` with requirements |

## Structure

```text
app/
├── page.tsx                 # Landing
├── new/page.tsx             # Invoice form (client)
├── status/page.tsx          # Live stats
├── r/[id]/page.tsx          # Receipt
├── components/
│   ├── SiteHeader.tsx
│   └── SiteFooter.tsx
├── api/invoices/
│   ├── route.ts             # POST create
│   └── [id]/route.ts        # GET x402 resource
├── globals.css              # Design system (light, white default)
├── icon.png                 # Favicon generated from the logo
└── layout.tsx               # Metadata + Open Graph
public/brand/                # Logo, hero background, step icons
lib/
├── store.ts                 # Postgres when DATABASE_URL is set, memory otherwise
└── x402.ts                  # Network, facilitator, payment config
```

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start
```

No environment variables are required locally. Invoices fall back to an in-memory store; set `DATABASE_URL` to persist them.

## Config

Development defaults to Base Sepolia via the x402.org facilitator; production uses Base mainnet via the PayAI facilitator (no API key). Invoice storage uses Postgres when `DATABASE_URL` is set and memory otherwise.

## Stack

Next.js 16 · React 19 · TypeScript · x402 v2 (`@x402/core`, `@x402/next`, `@x402/evm`, `@x402/extensions`) · USDC · Base

## Docs

- [Security policy](../SECURITY.md)
- [Code of conduct](../CODE_OF_CONDUCT.md)
- [Contributing](../CONTRIBUTING.md)
- [License](../LICENSE) — MIT

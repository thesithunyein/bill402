<p align="center">
  <a href="https://bill402.vercel.app">
    <img src="./bill402/public/brand/logo.png" alt="bill402 logo" width="132" />
  </a>
</p>

<h1 align="center">bill402</h1>

<p align="center">
  <strong>Invoices any AI agent can pay.</strong><br />
  Create an invoice, get an x402 URL. Agents discover it, you approve with a passkey, it settles in USDC on Base.
</p>

<p align="center">
  <a href="https://bill402.vercel.app"><img alt="Live app" src="https://img.shields.io/badge/live-bill402.vercel.app-000000?style=flat-square&logo=vercel&logoColor=white" /></a>
  <a href="https://bill402.vercel.app/status"><img alt="Status" src="https://img.shields.io/website?url=https%3A%2F%2Fbill402.vercel.app%2Fstatus&label=status&style=flat-square" /></a>
  <a href="https://www.x402.org"><img alt="x402" src="https://img.shields.io/badge/x402-v2-5B4CF5?style=flat-square" /></a>
  <a href="https://base.org"><img alt="Base" src="https://img.shields.io/badge/Base-mainnet-0052FF?style=flat-square" /></a>
  <img alt="USDC" src="https://img.shields.io/badge/settles-USDC-2775CA?style=flat-square" />
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-0A0A0A?style=flat-square" /></a>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-087EA4?style=flat-square&logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="MCP" src="https://img.shields.io/badge/MCP-PayBox%20plugin-6E56CF?style=flat-square" />
  <img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" />
</p>

---

## Why

Agents can already **buy** things over x402, but businesses still can't **bill** them. bill402 is the missing half: a hosted x402 invoice endpoint with a public receipt page and an optional settlement webhook.

- **Merchant** creates an invoice — name, description, USD amount.
- **Agent** discovers the x402 URL on PayBox (or any x402 client) and pays.
- **Buyer** approves once with a passkey. No card forms, no accounts, no human in the loop.
- **Everyone** gets a receipt with the real Base transaction hash.

Built for **MoonPay Hackathons — PayBox Chapter 1** (Merchant tools), Oct 16–17, 2026.

## Architecture

```mermaid
flowchart LR
  subgraph Client["Payer side"]
    A["AI agent / x402 client"]
    P["PayBox marketplace<br/>(MCP plugin)"]
  end

  subgraph Service["bill402 — Next.js on Vercel"]
    API["POST /api/invoices<br/>create"]
    RES["GET /api/invoices/:id<br/>x402 resource"]
    REC["GET /r/:id<br/>public receipt"]
    ST["GET /status<br/>live stats"]
    STORE[("Postgres<br/>or in-memory")]
  end

  F["x402 facilitator<br/>(settlement)"]
  CH["Base mainnet<br/>USDC"]

  A -->|"GET payUrl"| RES
  RES -->|"402 + payment requirements"| A
  A -->|"EIP-3009 authorization"| RES
  RES -->|"verify + settle"| F
  F -->|"transferWithAuthorization"| CH
  RES -->|"mark paid"| STORE
  RES -->|"webhook"| P
  P -->|"create_invoice / pay_invoice / check_invoice"| API
  STORE --> REC
  STORE --> ST
```

## Payment flow

```mermaid
sequenceDiagram
  autonumber
  participant Merchant
  participant Bill as bill402
  participant Agent as AI agent (PayBox)
  participant Fac as x402 facilitator
  participant Chain as Base (USDC)

  Merchant->>Bill: POST /api/invoices { merchant, description, amountUsd }
  Bill-->>Merchant: { payUrl, receiptUrl, invoice }

  Agent->>Bill: GET /api/invoices/:id
  Bill-->>Agent: 402 Payment Required + x402 requirements
  Agent->>Agent: build EIP-3009 transferWithAuthorization
  Agent->>Bill: GET /api/invoices/:id + X-PAYMENT
  Bill->>Fac: verify + settle
  Fac->>Chain: transferWithAuthorization (USDC)
  Chain-->>Fac: tx hash
  Fac-->>Bill: settled
  Bill-->>Agent: 200 + receipt
  Bill->>Merchant: webhook (optional)
  Merchant->>Bill: GET /r/:id (public receipt, tx hash)
```

## Project structure

```text
bill402/
├── bill402/                        # Next.js 16 service (the live app)
│   ├── app/
│   │   ├── page.tsx                # Landing page — hero, how it works, FAQ
│   │   ├── new/page.tsx            # Invoice creation form
│   │   ├── status/page.tsx         # Live settled stats (on-chain proof)
│   │   ├── r/[id]/page.tsx         # Public receipt with Basescan link
│   │   ├── components/
│   │   │   ├── SiteHeader.tsx      # Shared logo + navigation
│   │   │   └── SiteFooter.tsx      # Shared footer
│   │   ├── api/
│   │   │   └── invoices/
│   │   │       ├── route.ts        # POST — create an invoice
│   │   │       └── [id]/route.ts   # GET — x402 pay-per-call resource
│   │   ├── globals.css             # Design system (light, clean, max-width)
│   │   ├── icon.png                # Generated favicon from the logo
│   │   └── layout.tsx              # Metadata, Open Graph, Twitter cards
│   ├── public/brand/
│   │   ├── logo.png                # Main logo (transparent)
│   │   ├── bg-fan.jpg              # Hero / CTA background
│   │   ├── icon-rocket.png         # Create — speed
│   │   ├── icon-code.png           # x402 endpoint
│   │   ├── icon-check.png          # Passkey approval
│   │   └── icon-chart.png          # Receipts / stats
│   ├── lib/
│   │   ├── store.ts                # Invoice persistence (Postgres | memory)
│   │   └── x402.ts                 # Network, facilitator, payment config
│   └── package.json
├── bill402-plugin/                 # PayBox marketplace plugin (MCP)
│   ├── src/
│   │   ├── plugin.ts               # Tool definitions
│   │   └── paybox.ts               # PayBox x402 integration
│   ├── examples/                   # Base transfer, repo info, x402 request
│   ├── scripts/                    # Conformance + report harness
│   └── paybox-plugin.json          # Marketplace manifest
├── LICENSE                         # MIT
├── SECURITY.md                     # Threat model + disclosure policy
├── CODE_OF_CONDUCT.md              # Contributor Covenant 2.1
└── CONTRIBUTING.md                 # Local setup and PR expectations
```

## Quickstart

```bash
git clone https://github.com/thesithunyein/bill402.git
cd bill402/bill402
npm install
npm run dev          # http://localhost:3000
```

No environment variables are required to run locally — invoices fall back to an in-memory store. For production, set `DATABASE_URL` and the x402 facilitator configuration described in [`bill402/README.md`](./bill402/README.md).

```bash
npm run build && npm start   # production build
```

## API

| Route | Method | What it does |
| --- | --- | --- |
| `/` | GET | Landing page |
| `/new` | GET | Invoice creation form |
| `/status` | GET | Settled count, volume, network, facilitator |
| `/r/:id` | GET | Public receipt with on-chain transaction link |
| `/api/invoices` | POST | Create an invoice → `{ payUrl, receiptUrl, invoice }` |
| `/api/invoices/:id` | GET | x402 resource — `402` with exact-scheme USDC requirements |

## PayBox plugin

The plugin uses PayBox's native x402 flow. `pay_invoice` fetches the invoice's live requirements and returns an **unsigned** `io.paybox/transactionProposal`. PayBox validates it against the live `402`, the user approves with a passkey, PayBox pays, and retries the invoice URL. The tool never signs, holds, or sees key material.

```text
Tools: create_invoice · pay_invoice · check_invoice
Outbound hosts: bill402.vercel.app only
Secrets required: none
```

## Documentation

- [Service docs](./bill402/README.md) — endpoints, configuration, persistence
- [Plugin docs](./bill402-plugin/README.md) — tools, conformance, marketplace manifest
- [Security policy](./SECURITY.md) — threat model and private disclosure
- [Code of conduct](./CODE_OF_CONDUCT.md) — Contributor Covenant 2.1
- [Contributing](./CONTRIBUTING.md) — local setup and review expectations
- [License](./LICENSE) — MIT

## License

MIT © thesithunyein. See [LICENSE](./LICENSE).

---

<p align="center">
  <sub>Built for MoonPay Hackathons — PayBox Chapter 1 · x402 v2 · USDC on Base</sub>
</p>

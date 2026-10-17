# bill402

invoices any AI agent can pay. create an invoice, get an x402 URL — agents on
PayBox (or any x402 client) discover it, pay in USDC, you get the webhook and
an on-chain receipt.

built for the moonpay paybox hackathon, chapter 1 (merchant tools).

## how it works

1. `POST /api/invoices` with `{ merchant, description, amountUsd, webhookUrl? }`
2. you get `payUrl` — an x402-enabled resource
3. `GET /api/invoices/:id` without payment → `402` with exact-scheme USDC
   requirements + bazaar discovery metadata
4. agent pays (EIP-3009, USDC on base) → facilitator settles on-chain
5. invoice flips to `paid`, merchant webhook fires, receipt page shows the tx

## endpoints

| route | what |
|---|---|
| `GET /` | create an invoice |
| `GET /status` | settled count + volume, provable alive-ness |
| `GET /r/:id` | public receipt with on-chain tx link |
| `POST /api/invoices` | create invoice |
| `GET /api/invoices/:id` | x402 pay-per-call invoice resource |

## config

see `.env.example`. dev defaults to base sepolia via the x402.org facilitator;
production uses base mainnet via the PayAI facilitator (no api key).
invoices persist to postgres when `DATABASE_URL` is set, memory otherwise.

## stack

next.js 16 · x402 v2 (`@x402/core` `@x402/next` `@x402/evm` `@x402/extensions`)
· usdc · base

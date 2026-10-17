# bill402

Invoicing for the agent economy. Merchants create an invoice, get a URL, and any AI agent pays it in USDC on Base over [x402](https://www.x402.org) — no accounts, no card forms, no human in the loop required.

**Live:** https://bill402.vercel.app · **Status:** https://bill402.vercel.app/status

Built for MoonPay Hackathons — PayBox Chapter 1 (Oct 16–17, 2026).

## Why

Agents can already *buy* things over x402, but businesses still can't *bill* them. bill402 is the missing half: a hosted x402 invoice endpoint with a public receipt page and an optional settlement webhook.

## Parts

| Path | What it is |
|---|---|
| [`bill402/`](./bill402) | Next.js service — create invoices, serve x402 `402`s, verify + settle payments, issue receipts |
| [`bill402-plugin/`](./bill402-plugin) | PayBox marketplace plugin (MCP) — `create_invoice`, `pay_invoice`, `check_invoice` |

## How a payment works

1. Merchant (or an agent) calls `create_invoice` → gets a `payUrl` and a public receipt URL.
2. Any x402 client hits the `payUrl` → gets a `402` with payment requirements (Base mainnet USDC, exact amount, resource metadata, Bazaar discovery extensions).
3. The client signs an EIP-3009 `transferWithAuthorization` and retries with the payment header.
4. bill402 verifies and settles through a facilitator, marks the invoice paid, fires the optional webhook, and returns a receipt with the on-chain transaction hash.

## PayBox plugin

The plugin uses PayBox's native x402 flow: `pay_invoice` fetches the invoice's live requirements and returns an unsigned `io.paybox/transactionProposal`. PayBox validates it against the live `402`, the user approves with a passkey, PayBox pays and retries the invoice URL. The tool never signs, holds, or sees any key material.

Single outbound host (`bill402.vercel.app`). No secrets, no API keys.

## Receipts

Every settlement produces a public receipt page linking the Base transaction: `https://bill402.vercel.app/r/<invoiceId>`.

## License

MIT

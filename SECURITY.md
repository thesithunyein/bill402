# Security Policy

bill402 moves money, so security is treated as a product feature rather than a checkbox. This document describes what we protect, how the design reduces risk, and how to report a vulnerability.

## Supported versions

| Version | Supported |
| --- | --- |
| `main` (live at bill402.vercel.app) | ✅ |
| Older commits and forks | ❌ |

## Reporting a vulnerability

**Please do not open a public issue for security reports.**

- Email the maintainer through the address on the [GitHub profile](https://github.com/thesithunyein), or
- Use GitHub's [private vulnerability reporting](https://github.com/thesithunyein/bill402/security/advisories/new).

Include:

1. A description of the issue and the affected endpoint or file.
2. Reproduction steps or a proof of concept.
3. Impact — what an attacker could do, and what funds or data are at risk.
4. Any suggested remediation.

You can expect an acknowledgement within 72 hours and a remediation plan within 7 days. Please give us a reasonable window to ship a fix before public disclosure. We will credit reporters in the advisory unless you prefer to stay anonymous.

## Threat model

### Assets

- **Payer funds.** USDC moved by the x402 facilitator on Base.
- **Invoice integrity.** Amount, merchant, description, and paid status.
- **Settlement receipts.** The transaction hash a receipt points at.
- **Merchant webhooks.** Delivery of the paid event to a merchant-controlled URL.

### Trust boundaries

| Boundary | Trust |
| --- | --- |
| Browser → Next.js API | Untrusted input; validated on the server |
| bill402 → x402 facilitator | Trusted transport; settlement result is authoritative |
| bill402 → Base RPC | Trusted for chain data; receipts are verifiable independently |
| bill402 → merchant webhook | Outbound request to a user-supplied URL; no secrets attached |

### What the system deliberately does *not* hold

- **No private keys.** The PayBox plugin returns an unsigned `io.paybox/transactionProposal`. PayBox and the user's passkey authorize and broadcast. bill402 never signs.
- **No API keys.** The facilitator path is keyless, and the plugin requires no credentials.
- **No card data.** There is no card form and no PII beyond what a merchant types into an invoice.

## Controls in place

- **Server-side validation** of every invoice field: merchant and description are length-bounded, `amountUsd` is numeric, positive, and capped at $10,000.
- **Exact-scheme payment requirements.** The 402 states the mint, network, amount, and recipient; the client cannot choose a cheaper asset or a different payee.
- **Facilitator verification before state change.** An invoice is only marked `paid` after settlement succeeds; the receipt's `txHash` comes from the settlement result.
- **Single outbound host in the plugin** (`bill402.vercel.app`), which keeps the MCP surface small and auditable.
- **No secret leakage in client bundles.** Configuration is read server-side; the browser receives only public invoice data.
- **Webhook URLs are optional and never include secrets.** Treat webhook receivers as untrusted and verify the payload against your own invoice id.

## Known limitations

- **Webhook delivery is best-effort.** There is currently no signed webhook payload. Merchants should treat the receipt page and invoice API as the source of truth.
- **The in-memory store is not durable.** Run with `DATABASE_URL` in production; otherwise invoices disappear on restart.
- **The x402 facilitator is a dependency.** If the facilitator is unavailable, payments cannot settle. The invoice stays `pending`, and no funds move without an on-chain transaction.
- **Rate limiting is not built in.** Production deployments should add a platform-level or edge rate limit in front of `POST /api/invoices`.

## Handling a suspected incident

1. Pause new invoice creation if invoice integrity is in doubt.
2. Reconcile affected invoices against Basescan using the receipt transaction hashes.
3. Rotate `DATABASE_URL` if persistence credentials were exposed.
4. Publish an advisory once the fix is deployed.

## Scope

In scope: the Next.js service in [`bill402/`](./bill402), the PayBox plugin in [`bill402-plugin/`](./bill402-plugin), and the deployed app at <https://bill402.vercel.app>.

Out of scope: vulnerabilities in the x402 facilitator, the Base network, PayBox itself, or third-party dependencies that are already publicly disclosed upstream.

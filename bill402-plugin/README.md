# bill402 — PayBox plugin

MCP plugin for the [PayBox marketplace](https://docs.paybox.sh): create and settle [bill402](https://bill402.vercel.app) invoices from any agent, paid in USDC on Base over x402.

## Tools

| Tool | Kind | What it does |
|---|---|---|
| `create_invoice` | write | Create an invoice (merchant, description, USD amount, optional https webhook). Returns `invoiceId`, `payUrl`, and a public `receiptUrl`. |
| `pay_invoice` | write | Fetch the invoice's live x402 requirements and return an unsigned `io.paybox/transactionProposal`. PayBox validates it against the live `402`, asks the user to approve, pays in USDC on Base, and retries the invoice URL. Never signs anything itself. |
| `check_invoice` | read-only | Status without paying: pending → USDC amount + payee; paid → settlement tx hash + payer. |

## Network profile

- Single outbound host: `https://bill402.vercel.app`
- Bounded fetches (4s timeout), no network at startup or tool discovery
- No secrets, API keys, or brokered headers required

## Develop

Requires Node 24.x and pnpm 11.11.0.

```sh
pnpm install --frozen-lockfile
pnpm test      # typecheck + deterministic double build + live conformance
pnpm build     # bundle to dist/plugin.mjs
```

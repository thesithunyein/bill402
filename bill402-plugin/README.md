# bill402 — PayBox plugin

MCP plugin for the [PayBox marketplace](https://docs.paybox.sh): create and settle [bill402](https://bill402.vercel.app) invoices from any agent, paid in USDC on Base over x402.

## Tools

| Tool | Kind | What it does |
|---|---|---|
| `create_invoice` | write | Create an invoice (merchant, description, USD amount, optional https webhook). Returns `invoiceId`, `payUrl`, `receiptUrl`, and the network. |
| `pay_invoice` | write | Fetches the invoice's live x402 requirements and returns an unsigned `io.paybox/transactionProposal`. PayBox validates it against the live `402`, asks the user to approve, pays in USDC on Base, and retries the invoice URL. Never signs anything itself. |
| `check_invoice` | read-only | Status without paying: pending → USDC amount and payee; paid → settlement transaction hash and payer. |

## Network profile

- Single outbound host: `bill402.vercel.app` (add this in **Test & configure → Network**)
- Environment variables: none
- Secrets / brokered credentials: none
- Bounded fetches (4s timeout); no network at startup or during tool discovery

## Build and verify

Requires Node 24 and pnpm 11.11.0. The starter's conformance run only accepts macOS or Linux, so on Windows run it inside WSL2.

```sh
pnpm install --frozen-lockfile
pnpm test        # typecheck + deterministic double build + conformance sample call
pnpm build       # bundle to dist/plugin.mjs
pnpm local-check # optional: exercises all three tools against the live service
```

`pnpm local-check` is a Windows-friendly harness that validates tool schemas, then calls `create_invoice`, `check_invoice`, and `pay_invoice` against the live service and checks the returned x402 proposal. It is not a substitute for `pnpm test`.

Last verified run (starter 1.0.2, protocol 2026-07-28):

```json
{"status":"passed","toolchain":{"node":"24.21.0","platform":"linux","arch":"x64"},
 "sampleCall":{"tool":"create_invoice","status":"passed"},
 "artifact":{"bytes":400067,"sha256":"43c265c7a56362ffc5e8c06b5a91bb65e1123ccf27badf04b2da818b2d1fc6ba"},
 "discoveredToolCount":3}
```

The sample call in `paybox-plugin.json` really creates a bill402 invoice, so each run leaves one `$0.01` invoice in the service history.

## Submit to PayBox

1. `pnpm test` must pass on the exact bundle you upload.
2. Upload `dist/plugin.mjs` — not the source and not a zip.
3. Add the network host `bill402.vercel.app`. No variables or secrets are needed.
4. Run the hosted checks, load the tools, and call `create_invoice` with the sample arguments.
5. Call `pay_invoice` and validate the returned x402 proposal with a Base wallet — validation is simulation only and pays nothing.
6. A settlement needs a funded Base wallet; the invoice's `PAY_TO` address receives the USDC.

The tools are also exercised end to end against the live service (tools/list, the sample call, pending status, the x402 proposal envelope, and error paths); the PayBox hosted checks are the authoritative gate.

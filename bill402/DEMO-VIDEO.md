# Product demo — 50 seconds

Screen recording at 1440p or higher, 110% zoom in the editor, captions burned in. Every shot should show the product doing real work: the PayBox plugin, the invoice endpoint, or the receipt.

## Shot list

**Shot 1 — The problem (0:00–0:06)**
Screen: a chat with an agent. Caption: "Businesses cannot invoice AI agents."
Voice: "AI agents move money now, but most businesses still have no way to bill them."

**Shot 2 — The product (0:06–0:14)**
Screen: PayBox marketplace listing for bill402 with its three tools — `create_invoice`, `pay_invoice`, `check_invoice`.
Caption: "bill402: invoices any AI agent can pay. USDC on Base, x402."

**Shot 3 — Create the invoice (0:14–0:22)**
Screen: agent chat. Prompt: "Create an invoice for Acme Coffee, 100 bags of espresso beans, $0.05."
The agent calls `create_invoice` and returns a payment URL and receipt URL.
Caption: "One tool call. One payment URL."

**Shot 4 — The payment (0:22–0:38)**
Screen: same chat. Prompt: "Pay it."
The agent calls `pay_invoice`; PayBox shows the x402 proposal — "Pay $0.05 USDC on Base" — then cut to the phone for a passkey confirmation. Back to the screen: `check_invoice` reports paid with the transaction hash.
Caption: "The agent requests. You approve with one passkey. Settled on-chain."

**Shot 5 — The proof (0:38–0:46)**
Screen: receipt page with the paid badge and the transaction link, then the Basescan transaction, then the status page with settled count and volume.
Caption: "Every settlement leaves a public, on-chain receipt."

**Shot 6 — The close (0:46–0:50)**
Screen: repository and landing page side by side.
Caption: "Any business, agent-payable in a minute. x402 and PayBox."
Repository URL on screen: github.com/thesithunyein/bill402

## Production notes

- Record shot 4 last, after two rehearsals. If a live payment fails, restart rather than showing a retry.
- Film the phone screen directly; two taps maximum.
- Use sentence case for captions. No hashtags in the video.
- Minimal or no music; the video is often watched muted.

## Social caption

Businesses still cannot invoice an AI agent. bill402 closes that gap: create a USD invoice, share the x402 payment URL, and any agent settles it in USDC on Base with an on-chain receipt.

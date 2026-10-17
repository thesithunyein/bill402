# demo video script — 50 seconds

post to X. screen recording at 1440p+, zoom 110% in editor, captions burned in.
the plugin is the submission — every shot should show paybox or the plugin doing work.

## shot list

**shot 1 — the problem (0:00-0:06)**
screen: a chat with an agent. caption: "businesses can't charge AI agents. agents can't pay invoices."
voice/caption: "ai agents move money now. but a business still can't send them an invoice."

**shot 2 — the plugin in paybox (0:06-0:14)**
screen: paybox marketplace / plugin detail: bill402 with its 3 tools (create_invoice, pay_invoice, check_invoice).
caption: "i built bill402: invoicing agents can actually pay. usdc on base, x402."

**shot 3 — create the invoice (0:14-0:22)**
screen: agent chat. prompt: "create an invoice for acme coffee, 100 bags of espresso beans, $0.05"
agent calls create_invoice → result card with pay url + receipt url appears.
caption: "one tool call. ten seconds. one url."

**shot 4 — the agent pays (0:22-0:38) — THE HERO SHOT**
screen: same chat. prompt: "pay it"
agent calls pay_invoice → paybox x402 proposal card: "pay $0.05 usdc on base" → CUT TO PHONE: passkey tap
→ back to screen: agent calls check_invoice → "paid. transaction 0x… on base."
caption: "the agent requests. i approve with one tap. settled on-chain."

**shot 5 — the proof (0:38-0:46)**
screen: receipt page with status badge "paid", tx hash link. click through to basescan.
then /status page: settled count ticking, volume in USD.
caption: "every invoice leaves an on-chain receipt. no dead endpoints."

**shot 6 — the pitch (0:46-0:50)**
screen: github repo + landing page side by side. caption:
"any business, agent-payable in 60 seconds. x402 + paybox. merchant tools track."

## production notes

- record shot 4 LAST after rehearsing twice; if the live paid call fails once, cut it out and re-run — never show a retry
- phone passkey shot: film the phone screen directly (not through glass), 2 taps max visible
- keep all captions lowercase, no hashtags in-video
- music: none or minimal; judges watch on mute
- repo url on screen in shot 6: github.com/thesithunyein/bill402

# X caption (copy-paste ready, post video in main tweet, link in first reply)

businesses still can't invoice an ai agent. so i built the missing half: bill402,
a paybox plugin where you create an invoice and any agent pays it in usdc on base
via x402. on-chain receipt included. merchant tools track, @PayBox hackathon

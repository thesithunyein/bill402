# demo video script — 50 seconds

post to X. screen recording at 1440p+, zoom 110% in editor, captions burned in.

## shot list

**shot 1 — the problem (0:00-0:06)**
screen: a terminal or chat. caption: "businesses can't charge AI agents. agents can't pay invoices."
voice/caption: "ai agents move money now. but a business still can't send them an invoice."

**shot 2 — create the invoice (0:06-0:16)**
screen: bill402 landing page. type: Acme Coffee / 100 bags of espresso beans / $0.05.
click create. highlight the pay url appearing.
caption: "ten seconds. one url."

**shot 3 — the agent pays (0:16-0:34) — THE HERO SHOT**
screen: claude (or grok) with PayBox connector. paste: "pay this invoice: <payUrl>"
agent calls use_service → paybox approval card appears → CUT TO PHONE: passkey tap
→ back to screen: agent reads out "paid. transaction 0x… on base."
caption: "the agent pays. i approve with one tap. settled on-chain."

**shot 4 — the proof (0:34-0:44)**
screen: receipt page with status badge "paid", tx hash link. click through to basescan.
then /status page: settled count ticking, volume in USD.
caption: "every invoice leaves an on-chain receipt. no dead endpoints."

**shot 5 — the pitch (0:44-0:50)**
screen: back on landing. caption:
"any business, agent-payable in 60 seconds. built on x402 + paybox. merchant tools track."

## production notes

- record shot 3 LAST after rehearsing twice; if the live paid call fails once, cut it out and re-run — never show a retry
- phone passkey shot: film the phone screen directly (not through glass), 2 taps max visible
- keep all captions lowercase, no hashtags in-video
- music: none or minimal; judges watch on mute

# X caption (copy-paste ready, post video in main tweet, link in first reply)

businesses still can't invoice an ai agent. so i built the missing half: create
an invoice, get a url, any agent on paybox pays it in usdc on base. webhook +
on-chain receipt included. merchant tools track, @PayBox hackathon

import Link from "next/link";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";

const STEPS = [
  {
    n: "01",
    icon: "/brand/icon-rocket.png",
    title: "Create an invoice",
    body: "Add the business name, a line-item description, the amount in USD, and an optional webhook URL.",
  },
  {
    n: "02",
    icon: "/brand/icon-code.png",
    title: "Share the payment URL",
    body: "Every invoice returns a dedicated x402 endpoint plus a public receipt URL you can send anywhere.",
  },
  {
    n: "03",
    icon: "/brand/icon-check.png",
    title: "Agent pays",
    body: "The payer requests the endpoint and receives an HTTP 402 with exact USDC requirements on Base. Approval is one passkey confirmation.",
  },
  {
    n: "04",
    icon: "/brand/icon-chart.png",
    title: "Settlement confirmed",
    body: "bill402 verifies settlement, records the transaction hash, delivers your webhook, and publishes the receipt.",
  },
];

const FEATURES = [
  {
    kicker: "402",
    title: "Exact payment requirements",
    body: "Unpaid requests receive a standards-compliant 402 with the amount, asset, network, recipient, and Bazaar discovery metadata. No negotiation or custom integration required.",
  },
  {
    kicker: "passkey",
    title: "Approval without key exposure",
    body: "PayBox validates the live requirements and requests a single passkey confirmation. bill402 and its plugin never sign, hold, or transmit private keys.",
  },
  {
    kicker: "receipt",
    title: "Settlement you can verify",
    body: "Every payment produces a public receipt linked to its Base transaction, plus an optional webhook so your finance or fulfilment systems are notified immediately.",
  },
];

const FAQ = [
  {
    q: "What is bill402?",
    a: "bill402 is invoicing infrastructure for the agent economy. A business creates a USD invoice and receives an x402 payment endpoint. Any x402-compatible client can retrieve the payment requirements, settle in USDC on Base, and receive a verifiable receipt.",
  },
  {
    q: "How does an x402 payment work?",
    a: "A client requests the invoice endpoint and receives an HTTP 402 containing the exact requirements. It signs an EIP-3009 transferWithAuthorization, retries with the payment header, and bill402 verifies and settles through a facilitator. The invoice is marked paid and the receipt records the transaction hash.",
  },
  {
    q: "Do I need an API key or an account?",
    a: "No. There is nothing to register and no credential to store. Agents pay per request, and the payer confirms each payment with a passkey in PayBox. bill402 never handles key material.",
  },
  {
    q: "Which network and asset are supported?",
    a: "USDC on Base. Development defaults to Base Sepolia with the x402.org facilitator; production runs on Base mainnet through the PayAI facilitator. Every settled invoice links to its transaction on Basescan.",
  },
  {
    q: "Is settlement recorded on-chain?",
    a: "Yes. Settlement is broadcast by an x402 facilitator and the resulting Base transaction is linked from the public receipt. The status page counts only invoices that settled.",
  },
  {
    q: "What does it cost?",
    a: "bill402 is open source under the MIT license. There is no subscription and no platform fee; you pay only the network and facilitator costs of moving USDC, which are fractions of a cent on Base.",
  },
  {
    q: "Can I self-host it?",
    a: "Yes. Clone the repository and run npm install followed by npm run dev. Invoices persist to Postgres when DATABASE_URL is set and fall back to an in-memory store otherwise, so the service runs locally with no configuration.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* hero */}
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Invoicing infrastructure for AI agents</span>
            <h1>Invoices any AI agent can pay.</h1>
            <p className="lede">
              bill402 turns a USD invoice into an x402 endpoint. Agents on PayBox pay in USDC on
              Base, and your systems receive a webhook and an on-chain receipt.
            </p>
            <div className="hero-actions">
              <Link href="/new" className="btn btn-primary">
                Create an invoice
              </Link>
              <Link href="/status" className="btn btn-ghost">
                View service status
              </Link>
            </div>
            <p className="hero-note">No signup, no card details, settled in USDC.</p>
          </div>

          <div className="hero-visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/bg-fan.jpg" alt="" className="hero-bg" />
            <div className="hero-card">
              <div className="hero-card-top">
                <span className="badge pending">Awaiting payment</span>
                <span className="muted" style={{ fontSize: 12 }}>
                  INV-8F2A
                </span>
              </div>
              <div className="hero-card-amount">
                $49.50 <small>USDC</small>
              </div>
              <div className="hero-card-merchant">Acme Coffee · 100 bags of espresso beans</div>
              <div className="hero-card-divider" />
              <div className="hero-card-request">
                <span className="dim">GET</span> /api/invoices/8f2a
                <br />
                <span className="sig">402 Payment Required</span>
              </div>
              <div className="hero-card-foot">
                <span>agent pays</span>
                <span>·</span>
                <span>passkey approved</span>
                <span>·</span>
                <span>settled on Base</span>
              </div>
            </div>
          </div>
        </section>

        {/* specifications strip */}
        <section className="strip">
          <div className="strip-inner">
            <span className="pill pill-accent">x402 v2</span>
            <span className="pill">USDC on Base</span>
            <span className="pill">PayBox marketplace</span>
            <span className="pill">MCP plugin</span>
            <span className="pill">MIT licensed</span>
            <span style={{ marginLeft: "auto" }}>
              <a href="https://www.x402.org" target="_blank" rel="noreferrer">
                x402 protocol specification ↗
              </a>
            </span>
          </div>
        </section>

        {/* how it works */}
        <section className="section" id="how-it-works">
          <div className="section-head">
            <h2>From invoice to settled USDC.</h2>
            <p>
              Four steps, one endpoint. No card forms, no manual reconciliation, and no separate
              payment integration to maintain.
            </p>
          </div>

          <div className="steps-grid">
            {STEPS.map((step) => (
              <article className="step" key={step.n}>
                <div className="icon-tile">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={step.icon} alt="" width={24} height={24} />
                </div>
                <div className="step-num">Step {step.n}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* capabilities */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <h2>Everything an invoice needs to settle.</h2>
            <p>
              Payment requirements, approval, verification, receipts, and webhooks — consolidated
              into a single hosted endpoint.
            </p>
          </div>

          <div className="feature-grid">
            {FEATURES.map((feature) => (
              <article className="feature" key={feature.kicker}>
                <span className="kicker">{feature.kicker}</span>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="section" id="faq" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <h2>Frequently asked questions</h2>
            <p>Technical details for evaluating or deploying bill402.</p>
          </div>

          <div className="faq">
            {FAQ.map((item) => (
              <details className="faq-item" key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="cta-wrap">
          <section className="cta">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/bg-fan.jpg" alt="" className="cta-bg" />
            <h2>Start invoicing in minutes.</h2>
            <p>
              Create an invoice, share the payment URL, and settle in USDC on Base with a receipt
              anyone can verify.
            </p>
            <Link href="/new" className="btn btn-white">
              Create an invoice
            </Link>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

import Link from "next/link";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";

const STEPS = [
  {
    n: "01",
    icon: "/brand/icon-rocket.png",
    title: "Create an invoice",
    body: "Name the business, describe the work, set a USD amount. Ten seconds, no account needed.",
  },
  {
    n: "02",
    icon: "/brand/icon-code.png",
    title: "Share the pay URL",
    body: "You get an x402 endpoint. Paste it anywhere — an email, a chat, or straight to an agent.",
  },
  {
    n: "03",
    icon: "/brand/icon-check.png",
    title: "Agent pays, you approve",
    body: "The agent hits the URL, gets a 402, and pays USDC on Base. You approve once with a passkey.",
  },
  {
    n: "04",
    icon: "/brand/icon-chart.png",
    title: "Receipt, settled on-chain",
    body: "The invoice flips to paid, your webhook fires, and the receipt links the actual Base transaction.",
  },
];

const FAQ = [
  {
    q: "What is bill402?",
    a: "bill402 is an invoicing service for the agent economy. You create an invoice and get an x402 pay URL. Any AI agent that speaks x402 can discover it, pay it in USDC on Base, and receive a receipt — no accounts, no card forms, no human in the loop required.",
  },
  {
    q: "How does the x402 payment work?",
    a: "A client requests the invoice URL and receives an HTTP 402 with the exact payment requirements. It signs an EIP-3009 transferWithAuthorization for the amount, retries with the payment header, and bill402 verifies and settles through a facilitator. The invoice is marked paid and the receipt includes the on-chain transaction hash.",
  },
  {
    q: "Do I need an API key or a PayBox account to get paid?",
    a: "No. There is nothing to sign up for and no secret to manage on the invoice side. Agents pay per request, and you approve the payment with a passkey via PayBox. bill402 never sees, holds, or signs with key material.",
  },
  {
    q: "Which network and asset are used?",
    a: "USDC on Base mainnet. In development the app defaults to Base Sepolia and the x402.org facilitator; production uses Base mainnet through the PayAI facilitator. Every settled invoice shows the real transaction hash on Basescan.",
  },
  {
    q: "Is it really on-chain, or just a database flag?",
    a: "It is on-chain. Settlement happens through an x402 facilitator, which broadcasts the payment. The public receipt page links the Base transaction, and the status page reports only invoices that actually moved USDC.",
  },
  {
    q: "What does it cost to use?",
    a: "bill402 is open source under MIT. You pay only the network and facilitator costs of moving USDC, which are fractions of a cent on Base. There is no subscription and no platform fee.",
  },
  {
    q: "Can I self-host it?",
    a: "Yes. Clone the repository, run npm install and npm run dev. Invoices persist to Postgres when DATABASE_URL is set, and fall back to in-memory storage otherwise, so it runs locally with zero configuration.",
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
            <span className="eyebrow">x402 invoicing for the agent economy</span>
            <h1>Invoices any AI agent can pay.</h1>
            <p className="lede">
              Create an invoice, get an x402 URL. Agents on PayBox discover it, you approve
              with a passkey, and it settles in USDC on Base — webhook and on-chain receipt
              included.
            </p>
            <div className="hero-actions">
              <Link href="/new" className="btn btn-primary">
                Create your first invoice
              </Link>
              <Link href="/status" className="btn btn-ghost">
                See live stats
              </Link>
            </div>
            <p className="hero-note">No accounts. No card forms. No human in the loop required.</p>
          </div>

          <div className="hero-visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/bg-fan.jpg" alt="" className="hero-bg" />
            <div className="hero-card">
              <div className="hero-card-top">
                <span className="badge pending">awaiting payment</span>
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

        {/* trust strip */}
        <section className="strip">
          <div className="strip-inner">
            <span className="pill pill-accent">x402 v2</span>
            <span className="pill">USDC on Base</span>
            <span className="pill">PayBox marketplace</span>
            <span className="pill">MCP plugin</span>
            <span className="pill">MIT licensed</span>
            <span style={{ marginLeft: "auto" }}>
              <a href="https://www.x402.org" target="_blank" rel="noreferrer">
                An open protocol for machine payments ↗
              </a>
            </span>
          </div>
        </section>

        {/* how it works */}
        <section className="section" id="how-it-works">
          <div className="section-head">
            <h2>Four steps from invoice to settled USDC.</h2>
            <p>
              The merchant never touches a wallet UI, and the agent never asks for a card.
              x402 makes the payment part of the HTTP request.
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

        {/* features */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <h2>Built for bills, not for browsers.</h2>
            <p>
              Everything a business needs to get paid by software, and nothing that requires a
              human to fill in a form.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature">
              <span className="kicker">402</span>
              <h3>A real payment challenge</h3>
              <p>
                The invoice URL is an x402 resource. Unpaid requests get an exact-scheme 402 with
                the amount, asset, network, and Bazaar discovery metadata.
              </p>
            </article>
            <article className="feature">
              <span className="kicker">passkey</span>
              <h3>Approval you can trust</h3>
              <p>
                PayBox shows the live requirements and asks for a passkey once. The plugin returns
                an unsigned transaction proposal — it never signs, holds, or sees a key.
              </p>
            </article>
            <article className="feature">
              <span className="kicker">receipt</span>
              <h3>Proof, not a promise</h3>
              <p>
                Every settlement produces a public receipt page linking the Base transaction, plus
                an optional webhook so your own systems hear about it immediately.
              </p>
            </article>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" id="faq" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <h2>Questions, answered plainly.</h2>
            <p>If something is still unclear, open an issue on GitHub.</p>
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
            <h2>Send your first agent invoice today.</h2>
            <p>
              Ten seconds to create it. One URL to get paid. Real USDC on Base, with a receipt
              anyone can verify.
            </p>
            <Link href="/new" className="btn btn-white">
              Get started
            </Link>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

interface CreateResult {
  payUrl: string;
  receiptUrl: string;
  invoice: { id: string; amountUsd: number; merchant: string };
}

export default function NewInvoicePage() {
  const [merchant, setMerchant] = useState("");
  const [description, setDescription] = useState("");
  const [amountUsd, setAmountUsd] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateResult | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant,
          description,
          amountUsd: Number(amountUsd),
          webhookUrl: webhookUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "something went wrong");
        return;
      }
      setResult(data);
    } catch {
      setError("network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SiteHeader />

      <main className="container">
        <p className="page-kicker">New invoice</p>
        <h1>Create an invoice any agent can pay.</h1>
        <p className="sub">
          You will get an x402 pay URL and a public receipt URL. Share the pay URL with any agent
          on PayBox — or paste it straight into a chat.
        </p>

        <form onSubmit={submit} className="card">
          <label htmlFor="merchant">Business name</label>
          <input
            id="merchant"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder="Acme Coffee"
            maxLength={80}
            required
          />

          <label htmlFor="description">What is this invoice for?</label>
          <input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="100 bags of espresso beans"
            maxLength={200}
            required
          />

          <label htmlFor="amount">Amount (USD)</label>
          <input
            id="amount"
            type="number"
            min="0.01"
            max="10000"
            step="0.01"
            value={amountUsd}
            onChange={(e) => setAmountUsd(e.target.value)}
            placeholder="49.50"
            required
          />

          <label htmlFor="webhook">Webhook URL (optional)</label>
          <input
            id="webhook"
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://yourapp.com/hooks/paid"
          />

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Creating…" : "Create invoice"}
          </button>

          {error && <div className="error">{error}</div>}

          {result && (
            <div className="result">
              <div>
                <strong>Invoice {result.invoice.id} created</strong>
              </div>
              <div style={{ marginTop: 10 }}>
                Agent pay URL: <code>{result.payUrl}</code>
              </div>
              <div style={{ marginTop: 8 }}>
                Receipt: <a href={result.receiptUrl}>{result.receiptUrl}</a>
              </div>
              <div style={{ marginTop: 12, color: "var(--muted)" }}>
                Tell any agent on PayBox: “pay the {result.invoice.merchant} invoice at{" "}
                {result.payUrl}”
              </div>
            </div>
          )}
        </form>

        <ol className="steps">
          <li>Create an invoice — takes ten seconds.</li>
          <li>Give the pay URL to any AI agent, or paste it in chat.</li>
          <li>The agent pays via PayBox and you approve with a passkey.</li>
          <li>You get the webhook, they get the receipt, everyone gets the tx hash.</li>
        </ol>

        <p className="app-foot">
          <Link href="/">← Back to home</Link>
        </p>
      </main>

      <SiteFooter />
    </>
  );
}

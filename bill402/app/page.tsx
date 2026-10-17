"use client";

import { useState } from "react";

interface CreateResult {
  payUrl: string;
  receiptUrl: string;
  invoice: { id: string; amountUsd: number; merchant: string };
}

export default function Home() {
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
    <div className="container">
      <header className="top">
        <div className="logo">
          bill<span>402</span>
        </div>
        <a className="muted" href="/status">
          live stats →
        </a>
      </header>

      <h1>Invoices any AI agent can pay.</h1>
      <p className="sub">
        Create an invoice, get an x402 URL. Agents on PayBox discover it, you approve with a
        passkey, it settles in USDC on Base. Webhook and on-chain receipt included.
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

        <button type="submit" disabled={busy}>
          {busy ? "creating…" : "create invoice →"}
        </button>

        {error && <div className="error">{error}</div>}

        {result && (
          <div className="result">
            <div>
              <strong>invoice {result.invoice.id} created</strong>
            </div>
            <div style={{ marginTop: 8 }}>
              agent pay url: <code>{result.payUrl}</code>
            </div>
            <div style={{ marginTop: 6 }}>
              receipt: <a href={result.receiptUrl}>{result.receiptUrl}</a>
            </div>
            <div style={{ marginTop: 8 }} className="muted">
              tell any agent on PayBox: “pay the {result.invoice.merchant} invoice at{" "}
              {result.payUrl}”
            </div>
          </div>
        )}
      </form>

      <ol className="steps">
        <li>create an invoice — takes ten seconds</li>
        <li>give the pay url to any AI agent (or just paste it in chat)</li>
        <li>agent pays via PayBox, you approve with a passkey</li>
        <li>you get the webhook, they get the receipt, everyone gets the tx hash</li>
      </ol>
    </div>
  );
}

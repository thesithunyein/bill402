"use client";

import { useState } from "react";
import Link from "next/link";

interface CreateResult {
  payUrl: string;
  receiptUrl: string;
  invoice: { id: string; amountUsd: number; merchant: string };
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="copy-btn"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? "Copied" : `Copy ${label}`}
    </button>
  );
}

export function NewInvoiceForm() {
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
        setError(data.error ?? "The invoice could not be created. Please review the details and try again.");
        return;
      }
      setResult(data);
    } catch {
      setError("The server could not be reached. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
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

        <label htmlFor="description">Description</label>
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
          {busy ? "Creating invoice…" : "Create invoice"}
        </button>

        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

        {result && (
          <div className="result" aria-live="polite">
            <strong>Invoice {result.invoice.id} created</strong>
            <div className="result-field">
              <span className="result-label">Payment URL</span>
              <div className="copy-row">
                <code>{result.payUrl}</code>
                <CopyButton value={result.payUrl} label="payment URL" />
              </div>
            </div>
            <div className="result-field">
              <span className="result-label">Receipt URL</span>
              <div className="copy-row">
                <a href={result.receiptUrl}>{result.receiptUrl}</a>
                <CopyButton value={result.receiptUrl} label="receipt URL" />
              </div>
            </div>
            <p style={{ marginTop: 14, color: "var(--muted)" }}>
              Share the payment URL with the payer. Any x402 client can settle this invoice in USDC
              on Base.
            </p>
          </div>
        )}
      </form>

      <h2 className="aside-heading">What happens next</h2>
      <ol className="steps">
        <li>Send the payment URL to the payer or their agent.</li>
        <li>The agent retrieves the 402 requirements and settles in USDC on Base.</li>
        <li>bill402 verifies settlement, delivers your webhook, and publishes the receipt.</li>
      </ol>

      <p className="app-foot">
        <Link href="/">← Back to overview</Link>
      </p>
    </>
  );
}

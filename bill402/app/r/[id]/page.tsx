import type { Metadata } from "next";
import { getStore } from "@/lib/store";
import { NETWORK, networkLabel } from "@/lib/x402";
import Link from "next/link";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";

export const instant = false;

export const metadata: Metadata = {
  title: "Receipt",
  description: "Public settlement receipt for a bill402 invoice.",
  robots: { index: false, follow: false },
};

const EXPLORER: Record<string, string> = {
  "eip155:84532": "https://sepolia.basescan.org/tx/",
  "eip155:8453": "https://basescan.org/tx/",
};

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getStore().getInvoice(id);

  if (!invoice) {
    return (
      <>
        <SiteHeader />
        <main className="container">
          <p className="page-kicker">Receipt</p>
          <h1>Receipt not found</h1>
          <p className="sub">No invoice matches the identifier {id}.</p>
          <p className="app-foot">
            <Link href="/">← Back to overview</Link>
          </p>
        </main>
        <SiteFooter />
      </>
    );
  }

  const explorer = EXPLORER[NETWORK] ?? EXPLORER["eip155:8453"];

  return (
    <>
      <SiteHeader />

      <main className="container">
        <p className="page-kicker">Receipt</p>
        <h1>{invoice.status === "paid" ? "Payment settled" : "Payment pending"}</h1>
        <p className="sub">
          {invoice.status === "paid"
            ? "This invoice has settled on Base. The transaction below is the final record."
            : "This invoice has not settled yet. Payment requirements are available from its x402 endpoint."}
        </p>

        <div className="card">
          <div className="card-head">
            <span className={`badge ${invoice.status}`}>
              {invoice.status === "paid" ? "Paid" : "Awaiting payment"}
            </span>
            <span className="muted mono">{invoice.id}</span>
          </div>
          <div className="big-amount">${invoice.amountUsd.toFixed(2)}</div>
          <div className="muted">USDC · {networkLabel()}</div>

          <div style={{ marginTop: 20 }}>
            <div className="kv">
              <span className="k">Merchant</span>
              <span className="v">{invoice.merchant}</span>
            </div>
            <div className="kv">
              <span className="k">Description</span>
              <span className="v">{invoice.description}</span>
            </div>
            <div className="kv">
              <span className="k">Created</span>
              <span className="v">{new Date(invoice.createdAt).toUTCString()}</span>
            </div>
            {invoice.status === "paid" && (
              <>
                <div className="kv">
                  <span className="k">Settled</span>
                  <span className="v">
                    {invoice.paidAt ? new Date(invoice.paidAt).toUTCString() : "—"}
                  </span>
                </div>
                <div className="kv">
                  <span className="k">Payer</span>
                  <span className="v mono">{invoice.payer ?? "—"}</span>
                </div>
                <div className="kv">
                  <span className="k">Transaction</span>
                  <span className="v">
                    {invoice.txHash ? (
                      <a
                        className="inline-link mono"
                        href={`${explorer}${invoice.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {invoice.txHash.slice(0, 10)}…{invoice.txHash.slice(-8)} ↗
                      </a>
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
              </>
            )}
          </div>

          {invoice.status === "pending" && (
            <p className="muted" style={{ marginTop: 20 }}>
              Payment endpoint: <code className="inline-code">/api/invoices/{invoice.id}</code>
            </p>
          )}
        </div>

        <p className="app-foot">
          <Link href="/status">Service status</Link> · <Link href="/">Back to overview</Link>
        </p>
      </main>

      <SiteFooter />
    </>
  );
}

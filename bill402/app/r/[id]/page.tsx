import { getStore } from "@/lib/store";
import { NETWORK, networkLabel } from "@/lib/x402";
import Link from "next/link";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";

export const instant = false;

const EXPLORER: Record<string, string> = {
  "eip155:84532": "https://sepolia.basescan.org/tx/",
  "eip155:8453": "https://basescan.org/tx/",
};

function usd(units: string): string {
  const n = Number(BigInt(units)) / 1_000_000;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

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
          <div className="card" style={{ marginTop: 20 }}>
            <h2>Invoice not found</h2>
            <p className="muted">No invoice with id {id}</p>
          </div>
          <p className="app-foot">
            <Link href="/new">← Create one</Link>
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

        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className={`badge ${invoice.status}`}>{invoice.status}</span>
            <span className="muted">{invoice.id}</span>
          </div>
          <div className="big-amount">${invoice.amountUsd.toFixed(2)}</div>
          <div className="muted">USDC · {networkLabel()}</div>

          <div style={{ marginTop: 20 }}>
            <div className="kv">
              <span className="k">merchant</span>
              <span className="v">{invoice.merchant}</span>
            </div>
            <div className="kv">
              <span className="k">for</span>
              <span className="v">{invoice.description}</span>
            </div>
            <div className="kv">
              <span className="k">created</span>
              <span className="v">{new Date(invoice.createdAt).toUTCString()}</span>
            </div>
            {invoice.status === "paid" && (
              <>
                <div className="kv">
                  <span className="k">paid at</span>
                  <span className="v">
                    {invoice.paidAt ? new Date(invoice.paidAt).toUTCString() : "—"}
                  </span>
                </div>
                <div className="kv">
                  <span className="k">payer</span>
                  <span className="v">{invoice.payer ?? "—"}</span>
                </div>
                <div className="kv">
                  <span className="k">transaction</span>
                  <span className="v">
                    {invoice.txHash ? (
                      <a
                        href={`${explorer}${invoice.txHash}`}
                        style={{ color: "var(--accent-ink)", textDecoration: "underline" }}
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
              Waiting for payment. Any x402 client can pay this invoice at{" "}
              <code>/api/invoices/{invoice.id}</code>
            </p>
          )}
        </div>

        {invoice.status === "paid" && (
          <p className="muted">
            Settled on-chain. Webhook fired if configured. Receipt is final.
          </p>
        )}
      </main>

      <SiteFooter />
    </>
  );
}

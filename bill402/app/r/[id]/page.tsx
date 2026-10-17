import { getStore } from "@/lib/store";
import { NETWORK } from "@/lib/x402";
import Link from "next/link";

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
      <div className="container">
        <header className="top">
          <div className="logo">
            bill<span>402</span>
          </div>
        </header>
        <div className="card">
          <h2>invoice not found</h2>
          <p className="muted">no invoice with id {id}</p>
        </div>
        <Link href="/">← create one</Link>
      </div>
    );
  }

  const explorer = EXPLORER[NETWORK] ?? EXPLORER["eip155:8453"];

  return (
    <div className="container">
      <header className="top">
        <div className="logo">
          bill<span>402</span>
        </div>
        <Link className="muted" href="/status">
          live stats →
        </Link>
      </header>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className={`badge ${invoice.status}`}>{invoice.status}</span>
          <span className="muted">{invoice.id}</span>
        </div>
        <div className="big-amount">${invoice.amountUsd.toFixed(2)}</div>
        <div className="muted">USDC · {NETWORK.replace("eip155:", "base ")}</div>

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
                    <a href={`${explorer}${invoice.txHash}`}>
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
            waiting for payment. any x402 client can pay this invoice at{" "}
            <code>/api/invoices/{invoice.id}</code>
          </p>
        )}
      </div>

      {invoice.status === "paid" && (
        <p className="muted">settled on-chain. webhook fired if configured. receipt is final.</p>
      )}
    </div>
  );
}

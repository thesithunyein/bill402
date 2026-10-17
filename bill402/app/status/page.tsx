import { getStore } from "@/lib/store";
import { FACILITATOR_URL, networkLabel } from "@/lib/x402";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

export const instant = false;

function usd(units: string): string {
  const n = Number(BigInt(units)) / 1_000_000;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default async function StatusPage() {
  const stats = await getStore().stats();

  return (
    <>
      <SiteHeader />

      <main className="container wide">
        <p className="page-kicker">Live stats</p>
        <h1>Provable alive-ness.</h1>
        <p className="sub">
          Every settled invoice here moved real USDC on {networkLabel()} and has an on-chain
          receipt. No dead endpoints.
        </p>

        <div className="stats">
          <div className="stat">
            <div className="n">{stats.invoicesCreated}</div>
            <div className="l">invoices created</div>
          </div>
          <div className="stat">
            <div className="n">{stats.invoicesPaid}</div>
            <div className="l">settled on-chain</div>
          </div>
          <div className="stat">
            <div className="n">{usd(stats.volumeUnits)}</div>
            <div className="l">volume settled</div>
          </div>
        </div>

        <div className="card">
          <div className="kv">
            <span className="k">payment network</span>
            <span className="v">{networkLabel()}</span>
          </div>
          <div className="kv">
            <span className="k">settlement asset</span>
            <span className="v">USDC</span>
          </div>
          <div className="kv">
            <span className="k">facilitator</span>
            <span className="v">{FACILITATOR_URL}</span>
          </div>
          <div className="kv">
            <span className="k">protocol</span>
            <span className="v">x402 (HTTP 402 + EIP-3009)</span>
          </div>
        </div>

        <p className="muted">
          Agents: discover this service via the x402 bazaar, or call{" "}
          <code>GET /api/invoices/&lt;id&gt;</code> directly — the 402 tells you exactly how to
          pay.
        </p>
      </main>

      <SiteFooter />
    </>
  );
}

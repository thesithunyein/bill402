import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { getStore } from "@/lib/store";
import { NETWORK, FACILITATOR_URL, networkLabel } from "@/lib/x402";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

export const instant = false;

export const metadata: Metadata = {
  title: "Service status",
  description:
    "Live settlement metrics, network configuration, and facilitator details for the bill402 invoicing service.",
};

function usd(units: string): string {
  const n = Number(BigInt(units)) / 1_000_000;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

async function Metrics() {
  await connection();
  const stats = await getStore().stats();

  return (
    <div className="stats">
      <div className="stat">
        <div className="n">{stats.invoicesCreated}</div>
        <div className="l">Invoices created</div>
      </div>
      <div className="stat">
        <div className="n">{stats.invoicesPaid}</div>
        <div className="l">Invoices settled</div>
      </div>
      <div className="stat">
        <div className="n">{usd(stats.volumeUnits)}</div>
        <div className="l">Volume settled</div>
      </div>
    </div>
  );
}

function MetricsFallback() {
  return (
    <div className="stats" aria-hidden="true">
      <div className="stat">
        <div className="n">—</div>
        <div className="l">Invoices created</div>
      </div>
      <div className="stat">
        <div className="n">—</div>
        <div className="l">Invoices settled</div>
      </div>
      <div className="stat">
        <div className="n">—</div>
        <div className="l">Volume settled</div>
      </div>
    </div>
  );
}

export default function StatusPage() {
  return (
    <>
      <SiteHeader />

      <main className="container wide">
        <p className="page-kicker">Service status</p>
        <h1 className="status-title">
          <span className="status-dot" aria-hidden="true" />
          All systems operational
        </h1>
        <p className="sub">
          Settlement metrics for the production deployment, together with the network and payment
          configuration currently in use.
        </p>

        <Suspense fallback={<MetricsFallback />}>
          <Metrics />
        </Suspense>

        <div className="card">
          <h2 className="card-title">Payment configuration</h2>
          <div className="kv">
            <span className="k">Payment network</span>
            <span className="v">{networkLabel(NETWORK)}</span>
          </div>
          <div className="kv">
            <span className="k">Settlement asset</span>
            <span className="v">USDC</span>
          </div>
          <div className="kv">
            <span className="k">Facilitator</span>
            <span className="v mono">{FACILITATOR_URL}</span>
          </div>
          <div className="kv">
            <span className="k">Protocol</span>
            <span className="v">x402 v2 · exact scheme · EIP-3009</span>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Integration</h2>
          <p className="card-body">
            Invoice endpoints return HTTP 402 with the exact payment requirements, and discovery
            metadata is published to the x402 Bazaar. No API key is required.
          </p>
          <p className="card-body">
            Endpoint format: <code className="inline-code">/api/invoices/&lt;id&gt;</code>
          </p>
        </div>

        <p className="app-foot">
          <a href="/#how-it-works">How it works</a> · <a href="/#faq">FAQ</a>
        </p>
      </main>

      <SiteFooter />
    </>
  );
}

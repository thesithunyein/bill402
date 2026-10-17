import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import {
  getResourceServer,
  buildRequirements,
  invoiceResourceInfo,
  invoiceDiscoveryExtensions,
  invoiceResourceUrl,
} from "@/lib/x402";

const g = globalThis as unknown as { __bill402_init?: Promise<void> };

function ensureInit(server: ReturnType<typeof getResourceServer>) {
  if (!g.__bill402_init) {
    g.__bill402_init = server.initialize().catch((err) => {
      g.__bill402_init = undefined;
      throw err;
    });
  }
  return g.__bill402_init;
}

function parsePaymentHeader(raw: string): object | null {
  try {
    return JSON.parse(raw);
  } catch {
    try {
      return JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    } catch {
      return null;
    }
  }
}

async function fireWebhook(url: string, body: unknown) {
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.error("webhook delivery failed:", err);
  }
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const store = getStore();
  const invoice = await store.getInvoice(id);
  if (!invoice) {
    return NextResponse.json({ error: "invoice not found" }, { status: 404 });
  }

  const receipt = (settlement?: { transaction: string; payer: string | null }) =>
    NextResponse.json({
      invoice: {
        id: invoice.id,
        merchant: invoice.merchant,
        description: invoice.description,
        amountUsd: invoice.amountUsd,
        currency: "USDC",
        status: invoice.status,
        paidAt: invoice.paidAt,
        receiptUrl: invoiceResourceUrl(invoice.id).replace("/api/invoices/", "/r/"),
      },
      settlement: settlement ?? { transaction: invoice.txHash, payer: invoice.payer },
    });

  if (invoice.status === "paid") {
    return receipt();
  }

  const server = getResourceServer();
  try {
    await ensureInit(server);
  } catch (err) {
    console.error("facilitator init failed:", err);
    return NextResponse.json({ error: "payment facilitator unavailable" }, { status: 502 });
  }

  const requirements = buildRequirements(invoice);
  const resourceInfo = invoiceResourceInfo(invoice, invoiceResourceUrl(invoice.id));
  const extensions = invoiceDiscoveryExtensions(invoice);

  const paymentHeader =
    request.headers.get("payment-signature") ?? request.headers.get("x-payment");

  if (!paymentHeader) {
    const paymentRequired = await server.createPaymentRequiredResponse(
      [requirements],
      resourceInfo,
      undefined,
      extensions,
    );
    return NextResponse.json(paymentRequired, {
      status: 402,
      headers: { "Content-Type": "application/json" },
    });
  }

  const payload = parsePaymentHeader(paymentHeader);
  if (!payload) {
    return NextResponse.json({ error: "unparseable payment header" }, { status: 400 });
  }

  const verify = await server.verifyPayment(payload as never, requirements);
  if (!verify.isValid) {
    const paymentRequired = await server.createPaymentRequiredResponse(
      [requirements],
      resourceInfo,
      verify.invalidReason,
      extensions,
    );
    return NextResponse.json(
      { ...paymentRequired, invalidReason: verify.invalidReason },
      { status: 402 },
    );
  }

  const settle = await server.settlePayment(payload as never, requirements);
  if (!settle.success) {
    const paymentRequired = await server.createPaymentRequiredResponse(
      [requirements],
      resourceInfo,
      settle.errorReason,
      extensions,
    );
    return NextResponse.json(
      { ...paymentRequired, errorReason: settle.errorReason },
      { status: 402 },
    );
  }

  const paid = await store.markPaid(invoice.id, {
    txHash: settle.transaction,
    payer: settle.payer ?? null,
    paidAt: new Date().toISOString(),
  });

  if (!paid) {
    // another concurrent request settled it first — don't double-count
    return receipt({ transaction: settle.transaction, payer: settle.payer ?? null });
  }

  if (invoice.webhookUrl) {
    await fireWebhook(invoice.webhookUrl, {
      event: "invoice.settled",
      invoice: {
        id: paid.id,
        merchant: paid.merchant,
        description: paid.description,
        amountUsd: paid.amountUsd,
        status: paid.status,
        paidAt: paid.paidAt,
        receiptUrl: invoiceResourceUrl(paid.id).replace("/api/invoices/", "/r/"),
      },
      settlement: { transaction: settle.transaction, network: settle.network, payer: settle.payer },
    });
  }

  const response = receipt({ transaction: settle.transaction, payer: settle.payer ?? null });
  response.headers.set(
    "X-PAYMENT-RESPONSE",
    Buffer.from(
      JSON.stringify({ success: true, transaction: settle.transaction, network: settle.network }),
    ).toString("base64url"),
  );
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

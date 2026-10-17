import { NextRequest, NextResponse } from "next/server";
import { getStore, type Invoice } from "@/lib/store";
import { BASE_URL, NETWORK } from "@/lib/x402";

function shortId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

function toUnits(amountUsd: number): string {
  return BigInt(Math.round(amountUsd * 1_000_000)).toString();
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const amountUsd = Number(body.amountUsd);
  const merchant = typeof body.merchant === "string" ? body.merchant.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const webhookUrl =
    typeof body.webhookUrl === "string" && body.webhookUrl.trim() !== ""
      ? body.webhookUrl.trim()
      : null;

  if (!Number.isFinite(amountUsd) || amountUsd < 0.01 || amountUsd > 10_000) {
    return NextResponse.json({ error: "amountUsd must be between 0.01 and 10000" }, { status: 400 });
  }
  if (!merchant || merchant.length > 80) {
    return NextResponse.json({ error: "merchant is required (max 80 chars)" }, { status: 400 });
  }
  if (!description || description.length > 200) {
    return NextResponse.json({ error: "description is required (max 200 chars)" }, { status: 400 });
  }
  if (webhookUrl && !/^https:\/\//.test(webhookUrl)) {
    return NextResponse.json({ error: "webhookUrl must be https" }, { status: 400 });
  }

  const invoice: Invoice = {
    id: shortId(),
    merchant,
    description,
    amountUsd: Math.round(amountUsd * 100) / 100,
    amountUnits: toUnits(amountUsd),
    webhookUrl,
    status: "pending",
    paidAt: null,
    txHash: null,
    payer: null,
    createdAt: new Date().toISOString(),
  };

  await getStore().createInvoice(invoice);

  return NextResponse.json(
    {
      invoice: {
        id: invoice.id,
        merchant: invoice.merchant,
        description: invoice.description,
        amountUsd: invoice.amountUsd,
        status: invoice.status,
      },
      payUrl: `${BASE_URL}/api/invoices/${invoice.id}`,
      receiptUrl: `${BASE_URL}/r/${invoice.id}`,
      network: NETWORK,
    },
    { status: 201 },
  );
}

import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { proposeX402, x402OutputSchema } from "./paybox.js";

const PROTOCOL_VERSION = "2026-07-28";
const API = "https://bill402.vercel.app";
const FETCH_TIMEOUT_MS = 4000;
const USDC_DECIMALS = 6;

const invoiceIdSchema = z
  .string()
  .regex(/^[0-9a-f]{12}$/, "Use the 12-character invoice id returned by create_invoice.");

const createInput = z
  .object({
    merchant: z
      .string()
      .min(1)
      .max(80)
      .describe("Who is billing — the business or person sending this invoice."),
    description: z
      .string()
      .min(1)
      .max(200)
      .describe("What the invoice is for, shown to the payer."),
    amountUsd: z
      .number()
      .min(0.01)
      .max(10000)
      .describe("Invoice amount in US dollars. Billed 1:1 in USDC on Base."),
    webhookUrl: z
      .url()
      .max(500)
      .optional()
      .describe("Optional https URL that receives a POST with the settlement receipt when the invoice is paid."),
  })
  .strict();

const createOutput = z
  .object({
    invoiceId: z.string(),
    merchant: z.string(),
    description: z.string(),
    amountUsd: z.number(),
    status: z.string(),
    payUrl: z.string(),
    receiptUrl: z.string(),
    network: z.string(),
  })
  .strict();

const invoiceRefInput = z.object({ invoiceId: invoiceIdSchema }).strict();

const checkOutput = z
  .object({
    invoiceId: z.string(),
    status: z.enum(["pending", "paid"]),
    amountUsd: z.number(),
    currency: z.literal("USDC"),
    payUrl: z.string(),
    receiptUrl: z.string(),
    network: z.string().nullish(),
    payTo: z.string().nullish(),
    paidAt: z.string().nullish(),
    transaction: z.string().nullish(),
    payer: z.string().nullish(),
  })
  .strict();

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Unexpected bill402 response: ${label} missing.`);
  }
  return value as Record<string, unknown>;
}

function failFrom(status: number, body: unknown): never {
  const rec =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
  const detail =
    typeof rec.error === "string" ? rec.error : JSON.stringify(body ?? null).slice(0, 200);
  throw new Error(`bill402 returned HTTP ${status}: ${detail}`);
}

async function api(
  path: string,
  init?: RequestInit,
): Promise<{ status: number; body: unknown }> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      ...init,
      headers: { accept: "application/json", ...(init?.headers ?? {}) },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    throw new Error(
      `bill402 service unreachable (${
        err instanceof Error ? err.message : "network error"
      }). It may be cold-starting; try again in a moment.`,
    );
  }
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, body };
}

function unitsToUsd(units: string): number {
  const n = Number(units);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round((n / 10 ** USDC_DECIMALS) * 100) / 100;
}

function paymentRequirement(body: unknown): Record<string, unknown> {
  const root = asRecord(body, "payment-required payload");
  const accepts = Array.isArray(root.accepts) ? root.accepts : [];
  if (accepts.length === 0) throw new Error("bill402 returned no x402 payment options.");
  return asRecord(accepts[0], "x402 payment requirement");
}

function atomicUnits(req: Record<string, unknown>): string {
  const amount = typeof req.amount === "string" ? req.amount : "";
  const fallback = typeof req.maxAmountRequired === "string" ? req.maxAmountRequired : "";
  const units = /^[1-9][0-9]{0,19}$/.test(amount) ? amount : fallback;
  if (!/^[1-9][0-9]{0,19}$/.test(units)) {
    throw new Error("Could not read a valid USDC amount from the invoice's payment requirements.");
  }
  return units;
}

function createServer() {
  const server = new McpServer(
    { name: "bill402", version: "1.0.0" },
    { supportedProtocolVersions: [PROTOCOL_VERSION] },
  );

  server.registerTool(
    "create_invoice",
    {
      title: "Create invoice",
      description:
        "Create a bill402 invoice payable in USDC on Base over x402. Returns an invoiceId, a payUrl that any x402-capable agent (or PayBox) can pay, and a public receipt URL. After creating, call pay_invoice with the invoiceId to request payment.",
      inputSchema: createInput,
      outputSchema: createOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ merchant, description, amountUsd, webhookUrl }) => {
      console.error(`[bill402] create_invoice merchant="${merchant}" amountUsd=${amountUsd}`);
      const { status, body } = await api("/api/invoices", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          merchant,
          description,
          amountUsd,
          ...(webhookUrl ? { webhookUrl } : {}),
        }),
      });
      if (status !== 201) failFrom(status, body);
      const root = asRecord(body, "invoice payload");
      const inv = asRecord(root.invoice, "invoice object");
      const out = {
        invoiceId: String(inv.id),
        merchant: String(inv.merchant),
        description: String(inv.description),
        amountUsd: Number(inv.amountUsd),
        status: String(inv.status),
        payUrl: String(root.payUrl),
        receiptUrl: String(root.receiptUrl),
        network: String(root.network),
      };
      return {
        content: [
          {
            type: "text",
            text: `Invoice ${out.invoiceId} created: $${out.amountUsd.toFixed(2)} USD (${out.merchant} — ${out.description}), payable in USDC on Base via ${out.payUrl}. Public receipt: ${out.receiptUrl}. Next: call pay_invoice with invoiceId "${out.invoiceId}" to request payment.`,
          },
        ],
        structuredContent: out,
      };
    },
  );

  server.registerTool(
    "pay_invoice",
    {
      title: "Pay invoice (x402)",
      description:
        "Settle a bill402 invoice in USDC on Base. Fetches the invoice's live x402 payment requirements and returns an unsigned io.paybox/transactionProposal — PayBox validates it against the live 402 response, asks the user to approve, then pays and retries the invoice URL. This tool never signs or pays anything itself. If the invoice is already paid, the error message carries the settlement transaction hash.",
      inputSchema: invoiceRefInput,
      outputSchema: x402OutputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ invoiceId }) => {
      console.error(`[bill402] pay_invoice invoiceId=${invoiceId}`);
      const { status, body } = await api(`/api/invoices/${invoiceId}`);
      if (status === 404) throw new Error(`No invoice ${invoiceId} exists on bill402.`);
      if (status === 200) {
        const root = asRecord(body, "receipt payload");
        const settle =
          root.settlement && typeof root.settlement === "object" && !Array.isArray(root.settlement)
            ? (root.settlement as Record<string, unknown>)
            : {};
        const tx = typeof settle.transaction === "string" ? settle.transaction : "unknown";
        throw new Error(
          `Invoice ${invoiceId} is already paid. Settlement transaction: ${tx}. Receipt: ${API}/r/${invoiceId}`,
        );
      }
      if (status !== 402) failFrom(status, body);
      const req = paymentRequirement(body);
      const network = String(req.network ?? "");
      if (network !== "eip155:8453") {
        throw new Error(
          `bill402 is serving ${network || "an unknown network"}, but PayBox x402 proposals support eip155:8453 (Base mainnet). Ask the merchant to switch the invoice service to mainnet.`,
        );
      }
      return proposeX402({
        chain: "eip155:8453",
        url: `${API}/api/invoices/${invoiceId}`,
        maxAmount: atomicUnits(req),
        method: "GET",
      });
    },
  );

  server.registerTool(
    "check_invoice",
    {
      title: "Check invoice status",
      description:
        "Check a bill402 invoice without paying. Free to call: returns status 'pending' with the USDC amount and payee address while unpaid, or 'paid' with the on-chain settlement transaction hash and payer once settled.",
      inputSchema: invoiceRefInput,
      outputSchema: checkOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ invoiceId }) => {
      console.error(`[bill402] check_invoice invoiceId=${invoiceId}`);
      const { status, body } = await api(`/api/invoices/${invoiceId}`);
      if (status === 404) throw new Error(`No invoice ${invoiceId} exists on bill402.`);
      const payUrl = `${API}/api/invoices/${invoiceId}`;
      const receiptUrl = `${API}/r/${invoiceId}`;

      if (status === 402) {
        const req = paymentRequirement(body);
        const units = atomicUnits(req);
        const network = typeof req.network === "string" ? req.network : null;
        const payTo = typeof req.payTo === "string" ? req.payTo : null;
        return {
          content: [
            {
              type: "text",
              text: `Invoice ${invoiceId} is pending: ${unitsToUsd(units).toFixed(2)} USDC${
                payTo ? ` to ${payTo}` : ""
              }${network ? ` on ${network}` : ""}. Payable via ${payUrl}. Receipt: ${receiptUrl}.`,
            },
          ],
          structuredContent: {
            invoiceId,
            status: "pending" as const,
            amountUsd: unitsToUsd(units),
            currency: "USDC" as const,
            payUrl,
            receiptUrl,
            network,
            payTo,
          },
        };
      }
      if (status !== 200) failFrom(status, body);
      const root = asRecord(body, "receipt payload");
      const inv = asRecord(root.invoice, "invoice object");
      const settle =
        root.settlement && typeof root.settlement === "object" && !Array.isArray(root.settlement)
          ? (root.settlement as Record<string, unknown>)
          : {};
      const out = {
        invoiceId: String(inv.id),
        status: "paid" as const,
        amountUsd: Number(inv.amountUsd),
        currency: "USDC" as const,
        payUrl,
        receiptUrl,
        network: null,
        payTo: null,
        paidAt: typeof inv.paidAt === "string" ? inv.paidAt : null,
        transaction: typeof settle.transaction === "string" ? settle.transaction : null,
        payer: typeof settle.payer === "string" ? settle.payer : null,
      };
      return {
        content: [
          {
            type: "text",
            text: `Invoice ${invoiceId} is paid. Settlement transaction: ${out.transaction ?? "unknown"}${
              out.payer ? ` by ${out.payer}` : ""
            }. Receipt: ${receiptUrl}.`,
          },
        ],
        structuredContent: out,
      };
    },
  );

  return server;
}

serveStdio(createServer, { legacy: "reject" });

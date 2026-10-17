import { x402ResourceServer } from "@x402/next";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { declareDiscoveryExtension, bazaarResourceServerExtension } from "@x402/extensions/bazaar";
import type { PaymentRequirements, ResourceInfo } from "@x402/core/types";
import type { Invoice } from "./store";

export const NETWORK = (process.env.X402_NETWORK ?? "eip155:84532") as `eip155:${number}`;
export const PAY_TO = process.env.PAY_TO ?? "";
export const FACILITATOR_URL = process.env.FACILITATOR_URL ?? "https://x402.org/facilitator";
export const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

const USDC: Record<string, string> = {
  "eip155:84532": "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // base sepolia
  "eip155:8453": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // base mainnet
};

const NETWORK_LABELS: Record<string, string> = {
  "eip155:8453": "Base",
  "eip155:84532": "Base Sepolia",
};

/** Human-readable network name for UI, falling back to the raw CAIP-2 id. */
export function networkLabel(network: string = NETWORK): string {
  return NETWORK_LABELS[network] ?? network;
}

export function usdcForNetwork(network: string): string {
  const asset = USDC[network];
  if (!asset) throw new Error(`no USDC address configured for ${network}`);
  return asset;
}

const g = globalThis as unknown as { __bill402_server?: x402ResourceServer };

export function getResourceServer(): x402ResourceServer {
  if (g.__bill402_server) return g.__bill402_server;
  const server = new x402ResourceServer(new HTTPFacilitatorClient({ url: FACILITATOR_URL }))
    .register(NETWORK, new ExactEvmScheme())
    .registerExtension(bazaarResourceServerExtension);
  g.__bill402_server = server;
  return server;
}

export function invoiceResourceUrl(id: string): string {
  return `${BASE_URL}/api/invoices/${id}`;
}

export function buildRequirements(invoice: Invoice): PaymentRequirements {
  return {
    scheme: "exact",
    network: NETWORK,
    asset: usdcForNetwork(NETWORK),
    amount: invoice.amountUnits,
    payTo: PAY_TO,
    maxTimeoutSeconds: 120,
    extra: {},
  };
}

export function invoiceResourceInfo(invoice: Invoice, url: string): ResourceInfo {
  return {
    url,
    description: `Invoice ${invoice.id}: ${invoice.description} — ${invoice.merchant}`,
    mimeType: "application/json",
    serviceName: "bill402",
    tags: ["invoice", "checkout", "merchant", "payments"],
  };
}

export function invoiceDiscoveryExtensions(invoice: Invoice) {
  return declareDiscoveryExtension({
    pathParams: { id: invoice.id },
    pathParamsSchema: {
      type: "object",
      properties: { id: { type: "string", description: "invoice id" } },
      required: ["id"],
    },
    output: {
      example: {
        invoice: {
          id: invoice.id,
          merchant: invoice.merchant,
          description: invoice.description,
          amountUsd: invoice.amountUsd,
          status: "paid",
          receiptUrl: `${BASE_URL}/r/${invoice.id}`,
        },
        settlement: {
          transaction:
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          payer: PAY_TO,
        },
      },
    },
  });
}

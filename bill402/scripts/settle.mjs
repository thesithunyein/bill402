#!/usr/bin/env node
// Settle a bill402 invoice on Base mainnet with a real x402 (exact, EIP-3009) payment.
//
//   node scripts/settle.mjs --new-key               # generate a throwaway payer key + address
//   node scripts/settle.mjs <invoiceId>             # check balance, then pay
//   node scripts/settle.mjs <invoiceId> --dry-run   # build and sign the payload, send nothing
//
// The payer key lives in .payer-key (mode 600, gitignored) unless PRIVATE_KEY is set.
// A throwaway key holds only the USDC you send it — never point this at a main wallet.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { x402Client } from "@x402/core/client";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { createPublicClient, http, formatUnits } from "viem";
import { base } from "viem/chains";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const BASE = (process.env.BILL402_BASE ?? "https://bill402.vercel.app").replace(/\/$/, "");
const RPC = process.env.BASE_RPC ?? "https://mainnet.base.org";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const KEY_FILE =
  process.env.PAYER_KEY_FILE ??
  resolve(dirname(fileURLToPath(import.meta.url)), "..", ".payer-key");

const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
];

class Exit extends Error {
  constructor(message, code = 1) {
    super(message);
    this.code = code;
  }
}

function loadKey({ create }) {
  if (process.env.PRIVATE_KEY) return process.env.PRIVATE_KEY.trim();
  if (existsSync(KEY_FILE)) return readFileSync(KEY_FILE, "utf8").trim();
  if (!create) {
    throw new Exit("No payer key. Run `node scripts/settle.mjs --new-key` first, or set PRIVATE_KEY.");
  }
  const key = generatePrivateKey();
  writeFileSync(KEY_FILE, `${key}\n`, { mode: 0o600 });
  return key;
}

function decodeReceiptHeader(value) {
  if (!value) return undefined;
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"))?.transaction;
  } catch {
    return undefined;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith("--")));
  const invoiceId = args.find((a) => !a.startsWith("--"));

  const account = privateKeyToAccount(loadKey({ create: flags.has("--new-key") }));

  if (flags.has("--new-key")) {
    console.log(`\nGenerated payer: ${account.address}`);
    console.log(`Key stored in ${KEY_FILE} (mode 600, gitignored).`);
    console.log("\nSend USDC on Base to that address, then run:");
    console.log("  node scripts/settle.mjs <invoiceId>\n");
    return 0;
  }

  if (!invoiceId || !/^[0-9a-f]{12}$/.test(invoiceId)) {
    throw new Exit("Usage: node scripts/settle.mjs <12-char-invoice-id> [--dry-run]");
  }

  const invoiceUrl = `${BASE}/api/invoices/${invoiceId}`;

  // 1. Ask the service what this invoice costs.
  const challenge = await fetch(invoiceUrl, { headers: { accept: "application/json" } });
  if (challenge.status === 200) {
    const body = await challenge.json();
    console.log(`Invoice ${invoiceId} is already paid.`);
    console.log(`Transaction: ${body?.settlement?.transaction ?? "unknown"}`);
    console.log(`Receipt: ${BASE}/r/${invoiceId}`);
    return 0;
  }
  if (challenge.status !== 402) {
    const text = (await challenge.text()).slice(0, 300);
    throw new Exit(`Expected 402 from ${invoiceUrl}, got ${challenge.status}: ${text}`);
  }

  const required = await challenge.json();
  const accepts = Array.isArray(required.accepts) ? required.accepts : [];
  const requirement = accepts.find((a) => a.network === "eip155:8453") ?? accepts[0];
  if (!requirement) throw new Exit("The 402 response carried no x402 payment options.");
  if (requirement.network !== "eip155:8453") {
    throw new Exit(`Service is serving ${requirement.network}, not Base mainnet (eip155:8453).`);
  }

  const amountUnits = BigInt(requirement.amount ?? requirement.maxAmountRequired);
  console.log(
    `Invoice ${invoiceId}: ${formatUnits(amountUnits, 6)} USDC to ${requirement.payTo} on ${requirement.network}`,
  );
  console.log(`Payer: ${account.address}`);

  // 2. Make sure the payer can cover it before asking a facilitator to verify anything.
  const client = createPublicClient({ chain: base, transport: http(RPC) });
  const balance = await client.readContract({
    address: USDC,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [account.address],
  });
  console.log(`Balance: ${formatUnits(balance, 6)} USDC`);

  if (balance < amountUnits) {
    throw new Exit(
      `Insufficient USDC on Base: short ${formatUnits(amountUnits - balance, 6)}.\n` +
        `Send at least ${formatUnits(amountUnits, 6)} USDC on Base to ${account.address},\n` +
        "then run this command again. Nothing was signed or sent.",
    );
  }

  // 3. Sign the EIP-3009 authorization and build the x402 payload.
  const payer = new x402Client();
  registerExactEvmScheme(payer, { signer: account });
  const payload = await payer.createPaymentPayload(required);
  const header = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

  if (flags.has("--dry-run")) {
    console.log("\nDry run: payload built and signed, nothing sent.");
    console.log(`  x402Version: ${payload.x402Version}`);
    console.log(`  scheme: ${payload.accepted?.scheme ?? payload.scheme}`);
    console.log(`  network: ${payload.accepted?.network ?? payload.network}`);
    console.log(`  header bytes: ${header.length}`);
    return 0;
  }

  // 4. Retry the invoice with the payment header; the facilitator settles on-chain.
  const paid = await fetch(invoiceUrl, {
    headers: { accept: "application/json", "X-PAYMENT": header },
  });
  const body = await paid.json().catch(() => null);

  if (paid.status !== 200) {
    const reason =
      body?.invalidReason ?? body?.errorReason ?? body?.error ?? JSON.stringify(body)?.slice(0, 400);
    throw new Exit(`Settlement failed with HTTP ${paid.status}: ${reason}`);
  }

  const transaction =
    body?.settlement?.transaction ?? decodeReceiptHeader(paid.headers.get("x-payment-response"));
  console.log(`\nSettled. HTTP ${paid.status}`);
  console.log(`Transaction: ${transaction ?? "unknown"}`);
  console.log(`Payer: ${body?.settlement?.payer ?? account.address}`);
  console.log(`Receipt: ${BASE}/r/${invoiceId}`);
  if (transaction && /^0x[0-9a-f]{64}$/i.test(transaction)) {
    console.log(`Explorer: https://basescan.org/tx/${transaction}`);
  }
  return 0;
}

main().then(
  (code) => {
    process.exitCode = code ?? 0;
  },
  (error) => {
    console.error(`\n${error instanceof Exit ? error.message : error?.stack ?? error}\n`);
    process.exitCode = error instanceof Exit ? error.code : 1;
  },
);

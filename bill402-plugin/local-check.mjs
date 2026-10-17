// Local MCP harness for the bill402 PayBox plugin.
// Mirrors the starter conformance checks (tools/list + tools/call, schema validation,
// resultType "complete", stdout/stderr budgets) and additionally exercises every tool,
// including the pending-status read and the unsigned x402 proposal.
// It runs on Windows with Node 24, where the starter's environment gate refuses to run;
// `pnpm test` in WSL2 remains the authoritative PayBox gate.
// Sample tool calls hit the live bill402 API and create real invoices.

import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { compileSchema } from "./scripts/schema.mjs";

const PROTOCOL_VERSION = "2026-07-28";
const here = dirname(fileURLToPath(import.meta.url));
const root = here;
const artifact = resolve(root, "dist/plugin.mjs");
const MAX_STDERR = 16 * 1024;
const MAX_STDOUT = 256 * 1024;

const results = [];
function record(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function call(method, params) {
  const child = spawn(process.execPath, [artifact], {
    cwd: dirname(artifact),
    env: { NODE_ENV: "production", NO_COLOR: "1", PATH: process.env.PATH ?? "" },
    stdio: ["pipe", "pipe", "pipe"],
  });

  let stdoutBytes = 0;
  let stderrText = "";
  child.stdout.on("data", (chunk) => (stdoutBytes += chunk.byteLength));
  child.stderr.on("data", (chunk) => (stderrText += chunk.toString("utf8")));

  const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });
  const message = {
    jsonrpc: "2.0",
    id: 2,
    method,
    params: {
      ...params,
      _meta: {
        "io.modelcontextprotocol/protocolVersion": PROTOCOL_VERSION,
        "io.modelcontextprotocol/clientInfo": { name: "bill402-local-harness", version: "1.0.0" },
        "io.modelcontextprotocol/clientCapabilities": {},
      },
    },
  };

  const response = await new Promise((resolvePromise, rejectPromise) => {
    const timer = setTimeout(() => {
      child.kill();
      rejectPromise(new Error(`${method} timed out after 10s`));
    }, 10_000);
    lines.on("line", (line) => {
      let parsed;
      try {
        parsed = JSON.parse(line);
      } catch {
        return;
      }
      if (parsed && "id" in parsed && parsed.id === 2) {
        clearTimeout(timer);
        child.kill();
        resolvePromise(parsed);
      }
    });
    child.on("exit", () => {
      clearTimeout(timer);
      rejectPromise(new Error(`${method}: plugin exited before answering`));
    });
    child.stdin.write(`${JSON.stringify(message)}\n`);
  });

  if (stderrText.length > MAX_STDERR) throw new Error(`${method}: stderr ${stderrText.length} bytes`);
  if (stdoutBytes > MAX_STDOUT) throw new Error(`${method}: stdout ${stdoutBytes} bytes`);
  if ("error" in response) throw new Error(`${method}: JSON-RPC error ${JSON.stringify(response.error)}`);
  if (response.result?.resultType !== "complete") {
    throw new Error(`${method}: resultType was ${response.result?.resultType}`);
  }
  return response.result;
}

function requireSchema(tool, value, label) {
  const validate = compileSchema(tool.outputSchema);
  const ok = validate(value);
  if (!ok) {
    throw new Error(`${label}: structuredContent failed output schema — ${JSON.stringify(validate.errors?.[0] ?? {})}`);
  }
}

// ---------- tools/list ----------
const listing = await call("tools/list", {});
const tools = listing.tools;
const byName = new Map(tools.map((t) => [t.name, t]));
record("tools/list returns the three tools", tools.length === 3 && ["create_invoice", "pay_invoice", "check_invoice"].every((n) => byName.has(n)), tools.map((t) => t.name).join(", "));
for (const tool of tools) record(`schema compiles: ${tool.name}`, (() => { try { compileSchema(tool.inputSchema); compileSchema(tool.outputSchema); return true; } catch { return false; } })());

const sample = JSON.parse(await readFile(resolve(root, "paybox-plugin.json"), "utf8"));
const sampleTool = byName.get(sample.tool);
const sampleInput = compileSchema(sampleTool.inputSchema);
record("sample arguments match paybox-plugin.json tool schema", sampleInput(sample.arguments), JSON.stringify(sample.arguments));

// ---------- create_invoice (the configured sample call) ----------
const created = await call("tools/call", { name: sample.tool, arguments: sample.arguments });
if (created.isError === true) throw new Error(`sample call failed: ${JSON.stringify(created.content)}`);
requireSchema(sampleTool, created.structuredContent, "create_invoice");
const invoiceId = created.structuredContent.invoiceId;
record("create_invoice writes a real invoice", /^[0-9a-f]{12}$/.test(invoiceId), `id=${invoiceId} amount=$${created.structuredContent.amountUsd}`);
record("create_invoice returns live URLs", created.structuredContent.payUrl === `https://bill402.vercel.app/api/invoices/${invoiceId}` && created.structuredContent.receiptUrl === `https://bill402.vercel.app/r/${invoiceId}`, created.structuredContent.payUrl);

// ---------- check_invoice (pending) ----------
const checked = await call("tools/call", { name: "check_invoice", arguments: { invoiceId } });
requireSchema(byName.get("check_invoice"), checked.structuredContent, "check_invoice");
record("check_invoice reports pending with live requirements", checked.structuredContent.status === "pending" && checked.structuredContent.amountUsd === sample.arguments.amountUsd && /^0x[0-9a-fA-F]{40}$/.test(checked.structuredContent.payTo ?? ""), `payTo=${checked.structuredContent.payTo} network=${checked.structuredContent.network}`);

// ---------- pay_invoice (proposal) ----------
const proposed = await call("tools/call", { name: "pay_invoice", arguments: { invoiceId } });
requireSchema(byName.get("pay_invoice"), proposed.structuredContent, "pay_invoice");
const proposal = proposed.structuredContent["io.paybox/transactionProposal"];
record("pay_invoice returns an unsigned x402 proposal", proposal.kind === "x402" && proposal.chain === "eip155:8453", `${proposal.chain} ${proposal.request.method} ${proposal.request.url}`);
record("proposal requests the invoice URL over HTTPS 443", proposal.request.url === `https://bill402.vercel.app/api/invoices/${invoiceId}`, proposal.request.url);
const expectedUnits = String(Math.round(sample.arguments.amountUsd * 1e6));
record("proposal maxAmount matches the invoice amount", proposal.payment.maxAmount === expectedUnits, `maxAmount=${proposal.payment.maxAmount} (expected ${expectedUnits})`);
record("proposal uses the Base USDC asset", proposal.payment.asset.toLowerCase() === "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", proposal.payment.asset);
const expiresIn = Date.parse(proposal.expiresAt) - Date.now();
record("proposal expires within five minutes", expiresIn > 0 && expiresIn <= 300_000, `${Math.round(expiresIn / 1000)}s`);
record("proposal carries no wallet, key or signature fields", !("walletId" in proposal) && !("signature" in proposal) && !("privateKey" in proposal));

// ---------- error paths ----------
const missing = "0".repeat(12);
const missingCheck = await call("tools/call", { name: "check_invoice", arguments: { invoiceId: missing } });
const missingCheckText = JSON.stringify(missingCheck.content);
record("check_invoice fails cleanly for an unknown invoice", missingCheck.isError === true && /No invoice .* exists/.test(missingCheckText), missingCheckText.slice(0, 90));

const badAmount = await call("tools/call", { name: "create_invoice", arguments: { merchant: "Acme Coffee", description: "invalid amount", amountUsd: 0 } });
const badAmountText = JSON.stringify(badAmount.content);
record("create_invoice rejects an out-of-range amount", badAmount.isError === true && /validation error|HTTP 400/i.test(badAmountText), badAmountText.slice(0, 90));

const badId = await call("tools/call", { name: "pay_invoice", arguments: { invoiceId: "not-an-id" } });
record("pay_invoice rejects a malformed invoice id", badId.isError === true, JSON.stringify(badId.content).slice(0, 90));

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exitCode = failed.length === 0 ? 0 : 1;

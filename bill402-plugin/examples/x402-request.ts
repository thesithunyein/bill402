import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { x402OutputSchema, proposeX402 } from "./paybox.js";

const endpoint = z.url().max(2048);
const atomic = z.string().regex(/^[1-9][0-9]{0,19}$/);
serveStdio(() => {
  const server = new McpServer({ name: "x402-request", version: "1.0.0" }, { supportedProtocolVersions: ["2026-07-28"] });
  server.registerTool("propose_paid_request", {
    title: "Propose a paid API request",
    description: "Proposes a Base USDC x402 GET request. maxAmount is atomic USDC, not dollars.",
    inputSchema: z.object({ endpoint, maxAmount: atomic }).strict(),
    outputSchema: x402OutputSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  }, async ({ endpoint: url, maxAmount }) => proposeX402({
    chain: "eip155:8453", url, maxAmount,
  }));
  return server;
}, { legacy: "reject" });

import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { evmOutputSchema, proposeEvm } from "./paybox.js";

const address = z.string().regex(/^0x[0-9a-fA-F]{40}$/);
const amount = z.string().regex(/^(0|[1-9][0-9]{0,77})$/);
serveStdio(() => {
  const server = new McpServer({ name: "base-transfer", version: "1.0.0" }, { supportedProtocolVersions: ["2026-07-28"] });
  server.registerTool("propose_base_transfer", {
    title: "Propose a Base ETH transfer",
    description: "Builds an unsigned Base ETH transfer for PayBox approval. Amount is wei.",
    inputSchema: z.object({ recipient: address, amountWei: amount }).strict(),
    outputSchema: evmOutputSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  }, async ({ recipient, amountWei }) => proposeEvm({
    chain: "eip155:8453", to: recipient, value: amountWei,
  }));
  return server;
}, { legacy: "reject" });

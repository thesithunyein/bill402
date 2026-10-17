import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

const repository = z.object({ full_name: z.string(), stargazers_count: z.number().int().nonnegative() });
serveStdio(() => {
  const server = new McpServer({ name: "repository-info", version: "1.0.0" }, { supportedProtocolVersions: ["2026-07-28"] });
  server.registerTool("repository_info", {
    title: "Read MCP SDK repository information",
    description: "Reads the public MCP TypeScript SDK repository name and star count from GitHub.",
    inputSchema: z.object({}).strict(),
    outputSchema: z.object({ name: z.string(), stars: z.number().int().nonnegative() }).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  }, async () => {
    try {
      const response = await fetch("https://api.github.com/repos/modelcontextprotocol/typescript-sdk", {
        headers: { Accept: "application/vnd.github+json" },
        signal: AbortSignal.timeout(4_000), redirect: "error",
      });
      if (!response.ok) throw new Error("Upstream request failed");
      const data = repository.parse(await response.json());
      return {
        content: [{ type: "text", text: `${data.full_name}: ${data.stargazers_count} stars` }],
        structuredContent: { name: data.full_name, stars: data.stargazers_count },
      };
    } catch {
      return { isError: true, content: [{ type: "text", text: "GitHub is unavailable. Check network configuration and retry explicitly." }] };
    }
  });
  return server;
}, { legacy: "reject" });

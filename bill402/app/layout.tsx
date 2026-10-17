import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://bill402.vercel.app"),
  title: {
    default: "bill402 — invoices any AI agent can pay",
    template: "%s · bill402",
  },
  description:
    "Create an invoice, get an x402 URL. Any AI agent on PayBox can discover and pay it in USDC on Base. Webhooks and on-chain receipts included.",
  applicationName: "bill402",
  keywords: ["x402", "invoices", "AI agents", "PayBox", "USDC", "Base", "MoonPay"],
  openGraph: {
    title: "bill402 — invoices any AI agent can pay",
    description:
      "Create an invoice, get an x402 URL. Agents on PayBox discover it, you approve with a passkey, it settles in USDC on Base.",
    url: "https://bill402.vercel.app",
    siteName: "bill402",
    images: ["/brand/logo.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "bill402 — invoices any AI agent can pay",
    description:
      "x402 invoicing for the agent economy. Create an invoice, get a pay URL, settle in USDC on Base.",
    images: ["/brand/logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

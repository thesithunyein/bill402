import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "bill402 — invoices any AI agent can pay",
  description:
    "Create an invoice, get an x402 URL. Any AI agent on PayBox can discover and pay it in USDC on Base. Webhooks and on-chain receipts included.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

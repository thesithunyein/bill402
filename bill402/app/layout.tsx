import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://bill402.vercel.app";
const DESCRIPTION =
  "Create a USD invoice, get an x402 payment endpoint, and settle in USDC on Base. Webhooks and public on-chain receipts included.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "bill402 — invoices any AI agent can pay",
    template: "%s · bill402",
  },
  description: DESCRIPTION,
  applicationName: "bill402",
  keywords: ["x402", "invoicing", "AI agents", "USDC", "Base", "payments", "agentic commerce"],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "bill402 — invoices any AI agent can pay",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "bill402",
    images: [
      {
        url: "/brand/og.png",
        width: 1200,
        height: 630,
        alt: "bill402 — invoices any AI agent can pay",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "bill402 — invoices any AI agent can pay",
    description: DESCRIPTION,
    images: ["/brand/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

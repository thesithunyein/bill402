import type { Metadata } from "next";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { NewInvoiceForm } from "./NewInvoiceForm";

export const metadata: Metadata = {
  title: "Create an invoice",
  description:
    "Create a USD invoice and receive an x402 payment URL, a public receipt URL, and optional settlement webhook.",
};

export default function NewInvoicePage() {
  return (
    <>
      <SiteHeader />

      <main className="container">
        <p className="page-kicker">New invoice</p>
        <h1>Create an invoice</h1>
        <p className="sub">
          Enter the billing details below. You will receive an x402 payment URL and a public receipt
          URL for the invoice.
        </p>

        <NewInvoiceForm />
      </main>

      <SiteFooter />
    </>
  );
}

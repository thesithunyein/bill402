import Link from "next/link";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />

      <main className="container">
        <p className="page-kicker">404</p>
        <h1>Page not found</h1>
        <p className="sub">
          The page you requested does not exist. If you followed a link to an invoice, check the
          receipt URL from the merchant.
        </p>
        <div className="hero-actions">
          <Link href="/" className="btn btn-primary">
            Back to overview
          </Link>
          <Link href="/new" className="btn btn-ghost">
            Create an invoice
          </Link>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

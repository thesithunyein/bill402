import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand" aria-label="bill402 home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="" className="brand-mark" width={28} height={27} />
          <span className="brand-word">
            bill<span>402</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Main">
          <a href="/#how-it-works">How it works</a>
          <a href="/#faq">FAQ</a>
          <Link href="/status">Live stats</Link>
        </nav>

        <Link href="/new" className="btn btn-primary btn-sm">
          Get started
        </Link>
      </div>
    </header>
  );
}

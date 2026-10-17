import Link from "next/link";

const YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" className="brand" aria-label="bill402 home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt="" className="brand-mark" width={26} height={25} />
            <span className="brand-word">
              bill<span>402</span>
            </span>
          </Link>
          <p>
            Invoices any AI agent can pay. Built on x402, settled in USDC on Base.
          </p>
        </div>

        <div className="footer-col">
          <h4>Product</h4>
          <ul>
            <li>
              <Link href="/new">Create an invoice</Link>
            </li>
            <li>
              <Link href="/status">Live stats</Link>
            </li>
            <li>
              <a href="/#how-it-works">How it works</a>
            </li>
            <li>
              <a href="/#faq">FAQ</a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Developers</h4>
          <ul>
            <li>
              <a href="https://github.com/thesithunyein/bill402" target="_blank" rel="noreferrer">
                GitHub
              </a>
            </li>
            <li>
              <a href="https://github.com/thesithunyein/bill402/tree/main/bill402-plugin" target="_blank" rel="noreferrer">
                PayBox plugin
              </a>
            </li>
            <li>
              <a href="https://www.x402.org" target="_blank" rel="noreferrer">
                x402 protocol
              </a>
            </li>
            <li>
              <a href="https://github.com/thesithunyein/bill402#readme" target="_blank" rel="noreferrer">
                Docs
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Project</h4>
          <ul>
            <li>
              <a href="https://github.com/thesithunyein/bill402/blob/main/LICENSE" target="_blank" rel="noreferrer">
                License (MIT)
              </a>
            </li>
            <li>
              <a href="https://github.com/thesithunyein/bill402/blob/main/SECURITY.md" target="_blank" rel="noreferrer">
                Security
              </a>
            </li>
            <li>
              <a href="https://github.com/thesithunyein/bill402/blob/main/CODE_OF_CONDUCT.md" target="_blank" rel="noreferrer">
                Code of conduct
              </a>
            </li>
            <li>
              <a href="https://github.com/thesithunyein/bill402/issues" target="_blank" rel="noreferrer">
                Issues
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {YEAR} bill402 · MIT licensed</span>
        <span>Built for MoonPay Hackathons — PayBox Chapter 1</span>
      </div>
    </footer>
  );
}

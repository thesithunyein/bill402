# Contributing to bill402

Thanks for taking a look. bill402 is small on purpose: a Next.js service, an MCP plugin, and a design system that should stay legible. Contributions that keep it that way are very welcome.

## Getting set up

```bash
git clone https://github.com/thesithunyein/bill402.git
cd bill402/bill402
npm install
npm run dev
```

The app runs at <http://localhost:3000> with no environment variables. Invoices use an in-memory store locally; set `DATABASE_URL` to exercise the Postgres path.

Useful checks before opening a pull request:

```bash
npx tsc --noEmit     # typecheck
npm run build        # production build (also typechecks routes)
```

## Repository layout

| Path | Responsibility |
| --- | --- |
| `bill402/app/page.tsx` | Landing page — hero, how it works, FAQ, CTA |
| `bill402/app/new/page.tsx` | Invoice creation form (client component) |
| `bill402/app/api/invoices` | Create + x402 resource endpoints |
| `bill402/app/r/[id]` | Public receipt page |
| `bill402/app/status` | Live settled stats |
| `bill402/app/globals.css` | The whole design system — keep it boring and readable |
| `bill402/public/brand` | Logo, background, and step icons |
| `bill402/lib/x402.ts` | Network, facilitator, and payment configuration |
| `bill402/lib/store.ts` | Persistence abstraction (Postgres or memory) |
| `bill402-plugin/src` | PayBox MCP plugin tools |

## Design principles

1. **White, quiet, and explicit.** Default background is white. No gradients behind body copy, no decorative card stacks.
2. **One accent.** Indigo `#5B4CF5` for interactive and emphasis states, black for primary actions.
3. **Money paths stay obvious.** Never hide the amount, recipient, or network in a payment flow.
4. **No key material, ever.** Client code must not receive secrets; signing belongs to PayBox and the user's passkey.
5. **Small components.** Prefer a server component and plain CSS classes over new dependencies.

## Pull requests

- Keep the diff focused; one concern per PR.
- Describe the user-visible change and include a screenshot for anything visual.
- Add or update documentation when behaviour or configuration changes.
- Do not commit `.env` files, credentials, or generated build output.
- By contributing you agree your work is licensed under the repository's [MIT license](./LICENSE) and that you will follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Reporting bugs and security issues

- Functional bugs: open an issue with reproduction steps and the invoice id if relevant.
- Security issues: **do not open a public issue**. Follow [SECURITY.md](./SECURITY.md).

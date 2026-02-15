# Parrot Pay

Add Tempo payments to any site in one line. Built for **Tempo Testnet** (Canteen x Tempo Hackathon).

## Structure

- **`app/`** — Next.js app: landing, Stripe-like checkout, dashboard, payment links
- **`sdk/`** — Embeddable checkout widget (use locally without deploying)

## Quick Start

```bash
pnpm install
pnpm run build
pnpm run dev
```

App runs at http://localhost:3000

## Privy (Auth)

Uses [Privy](https://privy.io) for wallet + email login (replaces raw MetaMask connect).

1. Create an app at [dashboard.privy.io](https://dashboard.privy.io)
2. Add to `app/.env`:
   ```
   NEXT_PUBLIC_PRIVY_APP_ID=your-app-id
   ```

## Database (Prisma)

1. Set `DATABASE_URL` in `app/.env`
2. Run migrations:

```bash
cd app && pnpm db:push
# or
cd app && pnpm db:migrate
```

3. Generate client: `pnpm db:generate` (runs automatically on build)

## Features

- **Stripe-like checkout** — Modal widget, one-line embed
- **Payment links** — Create `/pay/[slug]` for one-time or subscription
- **Dashboard** — Pay (sent) / Paid (received) / Payment links
- **Prisma** — User, PaymentLink, Payment models

## Routes

- `/` — Landing, create payment links, demo checkout
- `/dashboard` — Pay, Paid, Payment links (connect wallet)
- `/pay/[slug]` — Stripe-like payment page
- `/docs` — API reference for programmatic access
- `/embed.js` — Embed script for any site (add to your deployed app)

## Embed (script tag)

Add payments to any site with one line. After deploying, add to your external site:

```html
<script src="https://YOUR_DEPLOYED_URL/embed.js" data-merchant="YOUR_PAYMENT_LINK_SLUG"></script>
```

Options: `data-base` (override base URL), `data-button` (button text), `data-target="self"` (same tab), `data-container` (CSS selector for button placement).

## API (programmatic)

See `/docs` for full reference. Key endpoints:

- `POST /api/payment-links` — Create payment link
- `GET /api/payment-links?address=0x...` — List links
- `GET /api/payment-links/[slug]` — Get link
- `GET /api/payments/[id]` — Get payment status
- `GET /api/payments/received?address=0x...` — List received
- `GET /api/payments/sent?address=0x...` — List sent

## Tempo Testnet

- **Chain ID:** 42431
- **RPC:** https://rpc.moderato.tempo.xyz
- **Faucet:** https://faucet.tempo.xyz
- **Explorer:** https://explore.tempo.xyz

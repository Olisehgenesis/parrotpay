'use client'

import Link from 'next/link'
import { AppHeader } from '@/app/components/app-header'
import { usePrivy } from '@privy-io/react-auth'

const BASE = typeof window !== 'undefined' ? window.location.origin : 'https://parrotpay.vercel.app'

export default function DocsPage() {
  const { authenticated } = usePrivy()

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f9fc]">
      <AppHeader authenticated={authenticated} showNavLinks />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-[#32325d] mb-2">API Reference</h1>
        <p className="text-[#6b7c93] mb-10">
          Integrate Parrot Pay into your backend. Create payment links, check status, and list payments programmatically.
        </p>

        {/* API Keys */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[#32325d] mb-3">API keys</h2>
          <p className="text-[#6b7c93] mb-4">
            Most API endpoints require authentication. Create an API key from your{' '}
            <Link href="/dashboard" className="text-[#635bff] hover:underline">Dashboard</Link> (API keys tab).
            Sign in with your wallet and create a key — you&apos;ll see the full key once; copy and store it securely.
          </p>
          <div className="border border-[#e6e9ec] bg-white p-4 mb-4">
            <p className="text-xs font-medium text-[#6b7c93] mb-2">Using your API key</p>
            <p className="text-sm text-[#32325d] mb-2">Send the key in one of these headers:</p>
            <pre className="text-sm text-[#32325d] overflow-x-auto">{`Authorization: Bearer YOUR_API_KEY
# or
x-api-key: YOUR_API_KEY`}</pre>
            <p className="text-sm text-[#6b7c93] mt-3">
              <strong>Security:</strong> Never expose your API key in client-side code or public repos. Use it only in server-side requests.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[#32325d] mb-4">Base URL</h2>
          <pre className="bg-[#32325d] text-[#e6ecf1] p-4 text-sm overflow-x-auto">
            {BASE}
          </pre>
          <p className="text-sm text-[#6b7c93] mt-2">Use your deployed URL (e.g. https://parrotpay.vercel.app)</p>
        </section>

        {/* Create Payment Link */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[#32325d] mb-3">Create payment link</h2>
          <p className="text-[#6b7c93] mb-4">Create a shareable payment link. Returns the link with slug for the pay URL.</p>
          <div className="border border-[#e6e9ec] bg-white p-4 mb-4">
            <p className="text-xs font-medium text-[#6b7c93] mb-1">POST /api/payment-links</p>
            <pre className="text-sm text-[#32325d] overflow-x-auto">{`curl -X POST ${BASE}/api/payment-links \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "title": "Lunch order",
    "amount": "10.00",
    "currency": "usd",
    "recipientAddress": "0xYourWalletAddress",
    "type": "ONE_TIME",
    "collectCustomerInfo": { "name": true, "email": true, "phone": false }
  }'`}</pre>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-[#32325d] mb-2">Request body</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#e6e9ec]">
                  <th className="text-left py-2 text-[#6b7c93] font-medium">Field</th>
                  <th className="text-left py-2 text-[#6b7c93] font-medium">Type</th>
                  <th className="text-left py-2 text-[#6b7c93] font-medium">Required</th>
                  <th className="text-left py-2 text-[#6b7c93] font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-[#32325d]">
                <tr className="border-b border-[#e6e9ec]">
                  <td className="py-2 font-mono text-xs">amount</td>
                  <td><code>string</code></td>
                  <td>Yes</td>
                  <td>Amount in USD (e.g. &quot;10.00&quot;)</td>
                </tr>
                <tr className="border-b border-[#e6e9ec]">
                  <td className="py-2 font-mono text-xs">recipientAddress</td>
                  <td><code>string</code></td>
                  <td>Yes</td>
                  <td>Your wallet address (0x...)</td>
                </tr>
                <tr className="border-b border-[#e6e9ec]">
                  <td className="py-2 font-mono text-xs">title</td>
                  <td><code>string</code></td>
                  <td>No</td>
                  <td>Link name shown on pay page</td>
                </tr>
                <tr className="border-b border-[#e6e9ec]">
                  <td className="py-2 font-mono text-xs">currency</td>
                  <td><code>string</code></td>
                  <td>No</td>
                  <td>Display currency (usd, eur, gbp, ngn, etc.)</td>
                </tr>
                <tr className="border-b border-[#e6e9ec]">
                  <td className="py-2 font-mono text-xs">type</td>
                  <td><code>string</code></td>
                  <td>No</td>
                  <td>ONE_TIME or SUBSCRIPTION</td>
                </tr>
                <tr className="border-b border-[#e6e9ec]">
                  <td className="py-2 font-mono text-xs">collectCustomerInfo</td>
                  <td><code>object</code></td>
                  <td>No</td>
                  <td>{`{ name: boolean, email: boolean, phone: boolean }`}</td>
                </tr>
                <tr className="border-b border-[#e6e9ec]">
                  <td className="py-2 font-mono text-xs">metadata</td>
                  <td><code>object</code></td>
                  <td>No</td>
                  <td>Custom fields. Use _redirectUrl for success redirect</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="border border-[#e6e9ec] bg-[#fafbfc] p-4">
            <p className="text-sm font-medium text-[#32325d] mb-2">Response</p>
            <pre className="text-xs text-[#6b7c93] overflow-x-auto">{`{
  "id": "...",
  "slug": "a1b2c3d4e5f6g7h8",
  "title": "Lunch order",
  "amount": "10.00",
  "currency": "USD",
  "recipientAddress": "0x...",
  "type": "ONE_TIME",
  ...
}

// Pay URL: ${BASE}/pay/{slug}`}</pre>
          </div>
        </section>

        {/* Get Payment Link */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[#32325d] mb-3">Get payment link</h2>
          <p className="text-[#6b7c93] mb-4">Fetch a payment link by slug (includes payments).</p>
          <div className="border border-[#e6e9ec] bg-white p-4">
            <p className="text-xs font-medium text-[#6b7c93] mb-1">GET /api/payment-links/[slug]</p>
            <pre className="text-sm text-[#32325d] overflow-x-auto">{`curl ${BASE}/api/payment-links/a1b2c3d4e5f6g7h8`}</pre>
          </div>
        </section>

        {/* List Payment Links */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[#32325d] mb-3">List payment links</h2>
          <p className="text-[#6b7c93] mb-4">List all payment links for a wallet address.</p>
          <div className="border border-[#e6e9ec] bg-white p-4">
            <p className="text-xs font-medium text-[#6b7c93] mb-1">GET /api/payment-links?address=0x...</p>
            <pre className="text-sm text-[#32325d] overflow-x-auto">{`curl "${BASE}/api/payment-links?address=0xYourWalletAddress"`}</pre>
          </div>
          <p className="text-sm text-[#6b7c93] mt-2">
            With an API key: <code className="bg-[#e6e9ec] px-1">GET /api/payment-links</code> returns links created by that key (no address param needed).
          </p>
        </section>

        {/* Get Payment Status */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[#32325d] mb-3">Get payment status</h2>
          <p className="text-[#6b7c93] mb-4">Fetch a single payment by ID. Use when you have the payment ID from the pay link response or webhook.</p>
          <div className="border border-[#e6e9ec] bg-white p-4 mb-4">
            <p className="text-xs font-medium text-[#6b7c93] mb-1">GET /api/payments/[id]</p>
            <pre className="text-sm text-[#32325d] overflow-x-auto">{`curl ${BASE}/api/payments/clxyz123...`}</pre>
          </div>
          <div className="border border-[#e6e9ec] bg-[#fafbfc] p-4">
            <p className="text-sm font-medium text-[#32325d] mb-2">Response</p>
            <pre className="text-xs text-[#6b7c93] overflow-x-auto">{`{
  "id": "...",
  "amount": "10.00",
  "txHash": "0x...",
  "status": "COMPLETED",
  "fromAddress": "0x...",
  "toAddress": "0x...",
  "customerName": "...",
  "customerEmail": "...",
  "createdAt": "2025-02-15T..."
}`}</pre>
          </div>
        </section>

        {/* List Payment Received */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[#32325d] mb-3">List payments received</h2>
          <p className="text-[#6b7c93] mb-4">List payments received by a wallet address.</p>
          <div className="border border-[#e6e9ec] bg-white p-4">
            <p className="text-xs font-medium text-[#6b7c93] mb-1">GET /api/payments/received?address=0x...</p>
            <pre className="text-sm text-[#32325d] overflow-x-auto">{`curl "${BASE}/api/payments/received?address=0xYourWalletAddress"`}</pre>
          </div>
        </section>

        {/* List Payments Sent */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[#32325d] mb-3">List payments sent</h2>
          <p className="text-[#6b7c93] mb-4">List payments sent from a wallet address.</p>
          <div className="border border-[#e6e9ec] bg-white p-4">
            <p className="text-xs font-medium text-[#6b7c93] mb-1">GET /api/payments/sent?address=0x...</p>
            <pre className="text-sm text-[#32325d] overflow-x-auto">{`curl "${BASE}/api/payments/sent?address=0xYourWalletAddress"`}</pre>
          </div>
        </section>

        {/* Record Payment */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[#32325d] mb-3">Record payment</h2>
          <p className="text-[#6b7c93] mb-4">Record a completed payment (e.g. after on-chain tx). Used by the checkout flow.</p>
          <div className="border border-[#e6e9ec] bg-white p-4">
            <p className="text-xs font-medium text-[#6b7c93] mb-1">POST /api/payments</p>
            <pre className="text-sm text-[#32325d] overflow-x-auto">{`curl -X POST ${BASE}/api/payments \\
  -H "Content-Type: application/json" \\
  -d '{
    "txHash": "0x...",
    "amount": "10.00",
    "fromAddress": "0x...",
    "toAddress": "0x...",
    "memo": "pay-abc123",
    "paymentLinkId": "clxyz...",
    "status": "COMPLETED",
    "customerName": "John",
    "customerEmail": "john@example.com"
  }'`}</pre>
          </div>
        </section>

        {/* Quick Example */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[#32325d] mb-3">Quick example</h2>
          <p className="text-[#6b7c93] mb-4">Create a link and share the pay URL (requires API key):</p>
          <pre className="bg-[#32325d] text-[#e6ecf1] p-4 text-sm overflow-x-auto">{`curl -X POST ${BASE}/api/payment-links \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"amount":"25.00","recipientAddress":"0xYourWallet"}' \\
  | jq -r '.slug' | xargs -I {} echo "Pay URL: ${BASE}/pay/{}"`}</pre>
        </section>

        <div className="pt-8 border-t border-[#e6e9ec]">
          <Link href="/" className="text-[#635bff] font-medium hover:underline">
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  )
}

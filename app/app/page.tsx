'use client'

import { useState, useCallback, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { usePrivyWallet } from '@/app/hooks/use-privy-wallet'
import { CheckoutWidget, ALPHA_USD } from 'parrotpay-sdk'
import { parseUnits } from 'viem'
import type { Address } from 'viem'
import { Button } from '@/components/ui/button'
import { useGaslessTransfer } from '@/app/hooks/use-gasless-transfer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import Link from 'next/link'
import { Key } from 'lucide-react'
import { AppHeader } from '@/app/components/app-header'
import { PaymentReceiptModal } from '@/app/components/payment-receipt-modal'

const DEMO_MERCHANT = '0x53eaF4CD171842d8144e45211308e5D90B4b0088' as Address

export default function Home() {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [lastTx, setLastTx] = useState<string | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [phoneToPay, setPhoneToPay] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [codeTab, setCodeTab] = useState('sdk')
  const [stats, setStats] = useState<{ totalAmount: string; paymentCount: number } | null>(null)

  const { login, authenticated } = usePrivy()

  useEffect(() => {
    fetch('/api/payments/stats')
      .then((r) => r.json())
      .then((d) => setStats(d.totalAmount != null ? d : null))
      .catch(() => {})
  }, [])
  const { address } = usePrivyWallet()
  const { sendPayment: gaslessSend } = useGaslessTransfer()

  const sendPayment = useCallback(
    async (config: { to: Address; amount: bigint; token: string; memo?: string }) => {
      setIsSending(true)
      try {
        const hash = await gaslessSend({
          to: config.to,
          amount: config.amount,
          token: config.token as `0x${string}`,
          memo: config.memo,
        })
        setLastTx(hash)
        return hash
      } finally {
        setIsSending(false)
      }
    },
    [gaslessSend]
  )

  const handlePayByPhone = async () => {
    setPhoneError(null)
    if (!phoneToPay.trim()) {
      setPhoneError('Enter a phone number')
      return
    }
    if (!authenticated || !address) {
      login()
      return
    }
    setIsSending(true)
    try {
      const res = await fetch('/api/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: phoneToPay.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.address) {
        setPhoneError(data.error || 'User not found. They need to sign in with Parrot Pay first.')
        return
      }
      await sendPayment({
        to: data.address as Address,
        amount: parseUnits('1', 6),
        token: ALPHA_USD,
        memo: 'pay-by-phone-demo',
      })
      setPhoneToPay('')
    } catch (e) {
      setPhoneError(e instanceof Error ? e.message : 'Payment failed')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f9fc]">
      <AppHeader authenticated={authenticated} onLogin={login} showNavLinks />

      <main className="max-w-6xl mx-auto px-6 py-12 pb-20">
        {/* Grid: left = content, right = sample form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left - Hero + content */}
          <div className="lg:col-span-7 order-1">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-[#32325d] mb-2 tracking-tight">
                Add Parrot Pay to any site in one line
              </h1>
              <p className="text-[#6b7c93] text-base mb-4">
                Drop in our checkout widget. No backend required. Built for Tempo Testnet.
              </p>
              {stats && (
                <div className="flex items-baseline gap-4 mb-8 text-sm">
                  <span className="text-[#32325d] font-semibold">
                    ${parseFloat(stats.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                  </span>
                  <span className="text-[#6b7c93]">
                    {stats.paymentCount} payment{stats.paymentCount !== 1 ? 's' : ''} handled
                  </span>
                </div>
              )}
              {!stats && <div className="mb-8" />}
            </div>

            {/* SDK / Embed / Metadata tabs */}
            <div>
              <Tabs value={codeTab} onValueChange={setCodeTab} className="w-full">
                <TabsList className="bg-[#e6e9ec]/60 p-1">
                  <TabsTrigger value="sdk" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">SDK</TabsTrigger>
                  <TabsTrigger value="embed" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Embed</TabsTrigger>
                  <TabsTrigger value="metadata" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Metadata</TabsTrigger>
                </TabsList>
                <TabsContent value="sdk" className="mt-3">
                  <pre className="bg-[#32325d] text-[#e6ecf1] p-4 text-sm overflow-x-auto font-mono">
                    {`import { CheckoutWidget } from 'parrotpay-sdk'`}
                  </pre>
                </TabsContent>
                <TabsContent value="embed" className="mt-3">
                  <pre className="bg-[#32325d] text-[#e6ecf1] p-4 text-sm overflow-x-auto font-mono">
                    {`<script src="${typeof window !== 'undefined' ? window.location.origin : 'https://parrotpay.vercel.app'}/embed.js" data-merchant="YOUR_SLUG"></script>`}
                  </pre>
                  <p className="text-xs text-[#6b7c93] mt-2">Replace YOUR_SLUG with your payment link slug. When deployed, the script uses your domain. Injects a &quot;Pay with Parrot Pay&quot; button.</p>
                </TabsContent>
                <TabsContent value="metadata" className="mt-3">
                  <pre className="bg-[#32325d] text-[#e6ecf1] p-4 text-sm overflow-x-auto font-mono text-xs">
                    {`// Payment link metadata
{
  "amount": "10.00",
  "currency": "usd",
  "recipient": "0x...",
  "memo": "invoice-123"
}`}
                  </pre>
                </TabsContent>
              </Tabs>
            </div>

            <p className="text-sm text-[#6b7c93] mt-4">
              One line. Payments. Done.{' '}
              <Link href="/docs" className="text-[#635bff] hover:underline">API docs</Link> for programmatic access.
            </p>

            <Card className="border-[#e6e9ec] mt-6 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API keys
                </CardTitle>
                <CardDescription>
                  Create keys in your dashboard to create payment links via API. Use <code className="bg-muted px-1 text-xs">Authorization: Bearer YOUR_KEY</code> in requests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">Create API key →</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pay by phone */}
            <Card className="border-[#e6e9ec] mt-8 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Pay by phone number</CardTitle>
                <CardDescription>We resolve to their wallet. Send 1 AlphaUSD to try.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="flex-1 pay-phone-input">
                    <PhoneInput
                      international
                      defaultCountry="US"
                      value={phoneToPay}
                      onChange={(v) => setPhoneToPay(v ?? '')}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <Button
                    onClick={handlePayByPhone}
                    disabled={isSending}
                    className="bg-[#635bff] hover:bg-[#5851ea] shrink-0"
                  >
                    {isSending ? 'Sending...' : 'Send'}
                  </Button>
                </div>
                {phoneError && (
                  <p className="mt-2 text-sm text-destructive">{phoneError}</p>
                )}
              </CardContent>
            </Card>

            {lastTx && (
              <Card className="border-[#16a34a]/30 bg-[#dcfce7]/50 mt-6">
                <CardContent className="flex items-center justify-between py-4">
                  <span className="text-[#166534] font-medium">Payment sent</span>
                  <a
                    href={`https://explore.tempo.xyz/tx/${lastTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#635bff] font-medium hover:underline text-sm"
                  >
                    View on Explorer
                  </a>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right - Sample pay form */}
          <div className="lg:col-span-5 order-2">
            <Card className="border-[#e6e9ec] shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Sample payment</CardTitle>
                <CardDescription>Try the checkout flow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="text" value="$10.00" readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Recipient</Label>
                  <Input type="text" value="Demo merchant" readOnly className="bg-muted/50" />
                </div>
                <Button
                  className="w-full bg-[#635bff] hover:bg-[#5851ea]"
                  onClick={() => setCheckoutOpen(true)}
                >
                  Try Checkout Demo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <CheckoutWidget
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        merchantId="demo"
        recipient={DEMO_MERCHANT}
        amount="10"
        token={ALPHA_USD}
        memo="parrot-pay-demo"
        onSuccess={async (tx) => {
          setLastTx(tx)
          setShowReceipt(true)
          if (address) {
            try {
              await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  txHash: tx,
                  amount: '10.00',
                  fromAddress: address.toLowerCase(),
                  toAddress: DEMO_MERCHANT.toLowerCase(),
                  memo: 'parrot-pay-demo',
                  status: 'COMPLETED',
                }),
              })
            } catch {
              // Payment succeeded on-chain; recording is best-effort
            }
          }
        }}
        connectWallet={login}
        sendPayment={sendPayment}
        isConnected={!!address}
        isWalletLoading={authenticated && !address}
        isSending={isSending}
      />

      <PaymentReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        payment={{
          amount: '10.00',
          currency: 'USD',
          fromAddress: address ?? undefined,
          toAddress: DEMO_MERCHANT,
          status: 'COMPLETED',
          txHash: lastTx,
          createdAt: new Date().toISOString(),
        }}
      />
    </div>
  )
}

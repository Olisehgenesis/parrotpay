'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'
import { CheckoutWidget, ALPHA_USD } from '@parrotpay/sdk'
import { stringToHex, pad, parseUnits } from 'viem'
import { createWalletClient, custom, http } from 'viem'
import { withFeePayer } from 'viem/tempo'
import { tempoModerato } from 'viem/chains'
import { tempoActions } from 'viem/tempo'
import type { Address } from 'viem'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { WalletHeaderButton } from '@/app/components/wallet-header-button'

const DEMO_MERCHANT = '0x031891A61200FedDd622EbACC10734BC90093B2A' as Address

export default function Home() {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [lastTx, setLastTx] = useState<string | null>(null)
  const [phoneToPay, setPhoneToPay] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [codeTab, setCodeTab] = useState('sdk')

  const { login, authenticated } = usePrivy()
  const { address } = useAccount()
  const { wallets } = useWallets()

  const sendPayment = async (config: {
    to: Address
    amount: bigint
    token: string
    memo?: string
  }) => {
    if (!address) throw new Error('Connect wallet first')
    setIsSending(true)
    try {
      const wallet = wallets.find((w) => w.walletClientType === 'privy') ?? wallets[0]
      if (!wallet?.address) throw new Error('No wallet found. Please connect with Privy.')

      if (typeof wallet.switchChain === 'function') {
        await wallet.switchChain(tempoModerato.id)
      }

      const provider = await wallet.getEthereumProvider()
      if (!provider) throw new Error('No wallet provider found')

      const client = createWalletClient({
        account: address,
        chain: tempoModerato,
        transport: withFeePayer(
          custom(provider),
          http('https://sponsor.moderato.tempo.xyz')
        ),
      }).extend(tempoActions())

      const memoHex = config.memo ? pad(stringToHex(config.memo.slice(0, 32)), { size: 32 }) : undefined

      const { receipt } = await client.token.transferSync({
        to: config.to,
        amount: config.amount,
        token: config.token as `0x${string}`,
        memo: memoHex,
        feePayer: true,
      })

      setLastTx(receipt.transactionHash)
      return receipt.transactionHash
    } finally {
      setIsSending(false)
    }
  }

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
    <div className="min-h-screen bg-[#f5f6fa] bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:24px_24px]">
      {/* Top bar - no header, minimal */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 no-underline group">
          <img src="/parrot-pay-logo.svg" alt="Parrot Pay" width={32} height={32} className="shrink-0" />
          <span className="text-lg font-bold text-[#111827] group-hover:text-[#6366F1] transition-colors">Parrot Pay</span>
        </Link>
        <div className="flex items-center gap-2">
          {authenticated && (
            <>
              <Link href="/create" className="text-sm text-[#6b7280] hover:text-[#111827] no-underline hidden sm:inline">
                Create link
              </Link>
              <Link href="/dashboard" className="text-sm text-[#6b7280] hover:text-[#111827] no-underline hidden sm:inline">
                Dashboard
              </Link>
            </>
          )}
          <WalletHeaderButton authenticated={authenticated} onLogin={login} />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        {/* Grid: left = content, right = sample form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left - Hero + content */}
          <div className="lg:col-span-7 order-1">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#111827] mb-2">
                Add Tempo payments to any site in one line
              </h1>
              <p className="text-[#6b7280] mb-6">
                Drop in our checkout widget. No backend required. Built for Tempo Testnet.
              </p>
            </div>

            {/* SDK / Embed / Metadata tabs */}
            <div>
              <Tabs value={codeTab} onValueChange={setCodeTab} className="w-full">
                <TabsList className="bg-[#e5e7eb]/50">
                  <TabsTrigger value="sdk">SDK</TabsTrigger>
                  <TabsTrigger value="embed">Embed</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>
                <TabsContent value="sdk" className="mt-3">
                  <pre className="bg-[#111827] text-[#e5e7eb] p-4 rounded-lg text-sm overflow-x-auto font-mono">
                    {`import { CheckoutWidget } from '@parrotpay/sdk'`}
                  </pre>
                </TabsContent>
                <TabsContent value="embed" className="mt-3">
                  <pre className="bg-[#111827] text-[#e5e7eb] p-4 rounded-lg text-sm overflow-x-auto font-mono">
                    {`<script src="https://parrotpay.xyz/embed.js" data-merchant="YOUR_ID"></script>`}
                  </pre>
                </TabsContent>
                <TabsContent value="metadata" className="mt-3">
                  <pre className="bg-[#111827] text-[#e5e7eb] p-4 rounded-lg text-sm overflow-x-auto font-mono text-xs">
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

            <p className="text-sm text-[#6b7280] mt-4">
              One line. Payments. Done.
            </p>

            {/* Pay by phone */}
            <Card className="border-[#e5e7eb] mt-6">
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
                    className="bg-[#6366F1] hover:bg-[#4F46E5] shrink-0"
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
              <Card className="border-green-200 bg-green-50 mt-6">
                <CardContent className="flex items-center justify-between py-4">
                  <span className="text-green-800 font-medium">✅ Payment sent!</span>
                  <a
                    href={`https://explore.tempo.xyz/tx/${lastTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6366F1] font-semibold hover:underline"
                  >
                    View on Explorer
                  </a>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right - Sample pay form */}
          <div className="lg:col-span-5 order-2">
            <Card className="border-[#e5e7eb] shadow-sm">
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
                  className="w-full bg-[#6366F1] hover:bg-[#4F46E5]"
                  onClick={() => setCheckoutOpen(true)}
                >
                  Try Checkout Demo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#e5e7eb] py-6 text-center bg-white/80 mt-12">
        <p className="text-sm text-[#6b7280]">Tempo Testnet • Canteen x Tempo Hackathon</p>
      </footer>

      <CheckoutWidget
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        merchantId="demo"
        recipient={DEMO_MERCHANT}
        amount="10"
        token={ALPHA_USD}
        memo="parrot-pay-demo"
        onSuccess={(tx) => setLastTx(tx)}
        connectWallet={login}
        sendPayment={sendPayment}
        isConnected={!!authenticated && !!address}
        isSending={isSending}
      />
    </div>
  )
}

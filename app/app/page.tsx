'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'
import { CheckoutWidget, ALPHA_USD } from '@parrotpay/sdk'
import { stringToHex, pad } from 'viem'
import { createWalletClient, custom, http } from 'viem'
import { withFeePayer } from 'viem/tempo'
import { tempoModerato } from 'viem/chains'
import { tempoActions } from 'viem/tempo'
import type { Address } from 'viem'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const DEMO_MERCHANT = '0x031891A61200FedDd622EbACC10734BC90093B2A' as Address

export default function Home() {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [lastTx, setLastTx] = useState<string | null>(null)

  const { login, logout, ready, authenticated } = usePrivy()
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
      // Prefer Privy embedded wallet (like privy-next-tempo reference)
      const wallet = wallets.find((w) => w.walletClientType === 'privy') ?? wallets[0]
      if (!wallet?.address) throw new Error('No wallet found. Please connect with Privy.')

      // Switch to Tempo Moderato before sending (reference pattern)
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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary no-underline">
            Parrot Pay
          </Link>
          <nav className="flex items-center gap-3">
            {authenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/create">Create payment link</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <span className="text-sm text-muted-foreground">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <Button variant="ghost" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={login}>
                Login
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative py-20 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-[#6C63FF] opacity-[0.06]" />
          <h2 className="relative text-3xl md:text-4xl font-bold text-foreground mb-4">
            Add Tempo payments to any site in one line
          </h2>
          <p className="relative text-lg text-muted-foreground mb-8 max-w-[500px] mx-auto">
            Drop in our checkout widget. No backend required. Built for Tempo Testnet.
          </p>
          <div className="relative">
            <Button size="lg" onClick={() => setCheckoutOpen(true)}>
              Try Checkout Demo
            </Button>
          </div>
        </section>

        <section className="bg-muted/50 py-16 px-6">
          <div className="max-w-[1100px] mx-auto">
            <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">
              One line. Payments. Done.
            </h3>
            <pre className="bg-foreground text-muted-foreground p-5 rounded-lg text-sm overflow-x-auto mb-4">
              {`<script src="https://parrotpay.xyz/embed.js" data-merchant="YOUR_ID"></script>`}
            </pre>
            <p className="text-muted-foreground text-center text-sm">
              Or with React: <code className="bg-muted px-2 py-0.5 rounded text-xs">{"import { CheckoutWidget } from '@parrotpay/sdk'"}</code>
            </p>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-[1100px] mx-auto">
            <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">
              Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="text-3xl mb-2">⚡</div>
                  <CardTitle>Gasless</CardTitle>
                  <CardDescription>Fee sponsorship — users pay zero gas</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="text-3xl mb-2">🔗</div>
                  <CardTitle>Embeddable</CardTitle>
                  <CardDescription>Add to any site with one script tag</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="text-3xl mb-2">📝</div>
                  <CardTitle>Memos</CardTitle>
                  <CardDescription>Reconciliation with invoice IDs</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {lastTx && (
          <section className="py-8 px-6">
            <div className="max-w-[1100px] mx-auto">
              <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
                <CardContent className="flex items-center justify-between py-4">
                  <span>✅ Payment sent!</span>
                  <a
                    href={`https://explore.tempo.xyz/tx/${lastTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-semibold hover:underline"
                  >
                    View on Explorer
                  </a>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t py-6 text-center">
        <p className="text-sm text-muted-foreground">Tempo Testnet • Canteen x Tempo Hackathon</p>
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

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { usePrivyWallet } from '@/app/hooks/use-privy-wallet'
import { ALPHA_USD } from 'parrotpay-sdk'
import type { Address } from 'viem'
import Link from 'next/link'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDisplayAmount } from '@/app/hooks/use-display-amount'
import { useGaslessTransfer } from '@/app/hooks/use-gasless-transfer'
import { AppHeader } from '@/app/components/app-header'
import { PaymentReceiptModal } from '@/app/components/payment-receipt-modal'

type PaymentLink = {
  id: string
  slug: string
  title: string | null
  amount: string
  currency: string
  recipientAddress: string
  type: string
  memo: string | null
  meal?: string | null
  phone?: string | null
  metadata?: Record<string, unknown> | null
}

function isUserRejection(msg: string): boolean {
  const lower = msg.toLowerCase()
  return lower.includes('user rejected') || lower.includes('user cancel') || lower.includes('rejected the request') || lower.includes('user denied')
}

export default function PayPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const [link, setLink] = useState<PaymentLink | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successTxHash, setSuccessTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  const { login, authenticated } = usePrivy()
  const { address } = usePrivyWallet()
  const { sendPayment: gaslessSend } = useGaslessTransfer()

  const displayAmount = useDisplayAmount(link?.amount ?? '0', link?.currency || 'usd')

  const collectInfo = (link?.metadata && typeof link.metadata === 'object' && (link.metadata as Record<string, unknown>)._collectCustomerInfo) as { name?: boolean; email?: boolean; phone?: boolean } | undefined
  const collect = collectInfo || {}
  const needsName = !!collect.name
  const needsEmail = !!collect.email
  const needsPhone = !!collect.phone
  const redirectUrl = (link?.metadata && typeof link.metadata === 'object' && (link.metadata as Record<string, unknown>)._redirectUrl) as string | undefined

  useEffect(() => {
    if (!slug) return
    fetch(`/api/payment-links/${slug}`)
      .then((r) => r.json())
      .then(setLink)
      .catch(() => setLink(null))
      .finally(() => setLoading(false))
  }, [slug])

  const sendPayment = async () => {
    if (!address || !link) {
      login()
      return
    }

    if (needsName && !customerName.trim()) {
      setError('Please enter your full name')
      return
    }
    if (needsEmail && !customerEmail.trim()) {
      setError('Please enter your email')
      return
    }
    if (needsPhone && !customerPhone.trim()) {
      setError('Please enter your phone number')
      return
    }

    setError(null)
    setIsSending(true)
    try {
      const memo = link.memo || `pay-${link.slug}`
      const amountWei = BigInt(Math.floor(parseFloat(link.amount) * 1e6))

      const txHash = await gaslessSend({
        to: link.recipientAddress as Address,
        amount: amountWei,
        token: ALPHA_USD as `0x${string}`,
        memo,
      })

      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash,
          amount: parseFloat(link.amount).toFixed(2),
          fromAddress: address.toLowerCase(),
          toAddress: link.recipientAddress.toLowerCase(),
          memo,
          paymentLinkId: link.id,
          status: 'COMPLETED',
          customerName: needsName ? customerName.trim() : undefined,
          customerEmail: needsEmail ? customerEmail.trim() : undefined,
          customerPhone: needsPhone ? customerPhone.trim() : undefined,
        }),
      })

      setSuccess(true)
      setSuccessTxHash(txHash)
      const url = redirectUrl && typeof redirectUrl === 'string' ? redirectUrl.trim() : ''
      if (url) {
        if (url.startsWith('http://') || url.startsWith('https://')) {
          window.location.href = url
        } else if (url.startsWith('/')) {
          router.push(url)
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Payment failed'
      setError(isUserRejection(msg) ? 'Transaction was cancelled. You can try again when ready.' : msg)
    } finally {
      setIsSending(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!authenticated || !address) {
      login()
      return
    }
    sendPayment()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!link) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Payment link not found.</p>
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f9fc]">
      <AppHeader authenticated={authenticated} onLogin={login} showNavLinks={false} />

      <main className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-[480px] bg-white shadow-sm border border-[#e6e9ec] overflow-hidden">
          {/* Order summary - Stripe style */}
          <div className="px-6 py-6 border-b border-[#e6e9ec]">
            <h1 className="text-xl font-bold text-[#32325d] mb-1 uppercase tracking-wide">
              {link.title || 'Payment'}
            </h1>
            <p className="text-sm text-muted-foreground mb-4">
              {link.type === 'SUBSCRIPTION' ? 'Subscription' : 'One-time payment'}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#32325d]">{displayAmount}</span>
              <span className="text-sm text-muted-foreground">AlphaUSD</span>
            </div>
          </div>

          {/* Single form - Stripe embedded style */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
            {/* Customer info fields */}
            {(needsName || needsEmail || needsPhone) && (
              <div className="space-y-4">
                <h2 className="text-sm font-medium text-[#32325d]">Contact information</h2>
                {needsName && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[13px] text-[#6b7c93]">
                      Full name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-11 border-[#e6e9ec] focus-visible:ring-[#635bff] focus-visible:border-[#635bff]"
                    />
                  </div>
                )}
                {needsEmail && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[13px] text-[#6b7c93]">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="h-11 border-[#e6e9ec] focus-visible:ring-[#635bff] focus-visible:border-[#635bff]"
                    />
                  </div>
                )}
                {needsPhone && (
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[13px] text-[#6b7c93]">
                      Phone number
                    </Label>
                    <div className="pay-phone-input">
                      <PhoneInput
                        id="phone"
                        international
                        defaultCountry="US"
                        value={customerPhone}
                        onChange={(v) => setCustomerPhone(v ?? '')}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment section */}
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-[#32325d]">Payment</h2>
              <p className="text-[13px] text-[#6b7c93]">
                Pay to {link.recipientAddress.slice(0, 8)}...{link.recipientAddress.slice(-6)} via Tempo
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2">
                {error}
              </p>
            )}

            {/* Single CTA - Stripe style */}
            <Button
              type="submit"
              size="lg"
              className={`w-full h-12 text-base font-medium disabled:opacity-70 ${success ? 'bg-[#16a34a] hover:bg-[#16a34a] text-white' : 'bg-[#635bff] hover:bg-[#5851ea]'}`}
              disabled={isSending || success}
            >
              {success ? (
                <>
                  <span className="mr-2">✓</span>
                  Payment successful
                </>
              ) : isSending ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : !authenticated || !address ? (
                'Connect wallet to pay'
              ) : (
                `Pay ${displayAmount}`
              )}
            </Button>
          </form>
        </div>
      </main>

      {!redirectUrl?.trim() && (
        <PaymentReceiptModal
          isOpen={success}
          onClose={() => {
            setSuccess(false)
            setSuccessTxHash(null)
          }}
          payment={{
            amount: link?.amount ?? '0',
            currency: link?.currency || 'USD',
            fromAddress: address ?? undefined,
            toAddress: link?.recipientAddress,
            status: 'COMPLETED',
            txHash: successTxHash,
            customerName: needsName ? customerName : undefined,
            customerEmail: needsEmail ? customerEmail : undefined,
            customerPhone: needsPhone ? customerPhone : undefined,
            createdAt: new Date().toISOString(),
          }}
        />
      )}
    </div>
  )
}

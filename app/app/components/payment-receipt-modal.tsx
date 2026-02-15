'use client'

import { Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { QRCodeSVG } from 'qrcode.react'

const EXPLORER_BASE = 'https://explore.tempo.xyz'

export type PaymentReceiptData = {
  amount: string
  currency?: string
  fromAddress?: string
  toAddress?: string
  status: string
  txHash?: string | null
  customerName?: string | null
  customerEmail?: string | null
  customerPhone?: string | null
  createdAt?: string
  memo?: string | null
}

type PaymentReceiptModalProps = {
  isOpen: boolean
  onClose: () => void
  payment: PaymentReceiptData
}

function formatAddress(addr: string) {
  if (!addr) return '—'
  return `${addr.slice(0, 10)}...${addr.slice(-8)}`
}

export function PaymentReceiptModal({ isOpen, onClose, payment }: PaymentReceiptModalProps) {
  if (!isOpen) return null

  const explorerUrl = payment.txHash ? `${EXPLORER_BASE}/tx/${payment.txHash}` : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] bg-white shadow-xl border border-[#e6e9ec] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Tempo Pay branding */}
        <div className="px-6 py-5 border-b border-[#e6e9ec] bg-[#f6f9fc]">
          <div className="flex items-center gap-2 mb-1">
            <img src="/parrot-pay-logo.svg" alt="" width={24} height={24} className="shrink-0" />
            <span className="text-sm font-semibold text-[#32325d]">Tempo Pay</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16a34a]/10">
              <Check className="h-5 w-5 text-[#16a34a]" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#32325d]">Payment receipt</h3>
              <p className="text-xs text-[#6b7c93]">
                {payment.status === 'COMPLETED' ? 'Completed' : payment.status}
              </p>
            </div>
          </div>
        </div>

        {/* Receipt body */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-[#6b7c93]">Amount</span>
            <span className="text-xl font-bold text-[#32325d]">
              ${parseFloat(payment.amount).toFixed(2)} {payment.currency || 'USD'}
            </span>
          </div>

          {payment.fromAddress && (
            <div className="flex justify-between gap-4">
              <span className="text-sm text-[#6b7c93] shrink-0">From</span>
              <span className="font-mono text-xs text-[#32325d] text-right break-all">
                {formatAddress(payment.fromAddress)}
              </span>
            </div>
          )}
          {payment.toAddress && (
            <div className="flex justify-between gap-4">
              <span className="text-sm text-[#6b7c93] shrink-0">To</span>
              <span className="font-mono text-xs text-[#32325d] text-right break-all">
                {formatAddress(payment.toAddress)}
              </span>
            </div>
          )}

          {(payment.customerName || payment.customerEmail || payment.customerPhone) && (
            <div className="pt-2 border-t border-[#e6e9ec] space-y-1">
              {payment.customerName && (
                <p className="text-sm text-[#32325d]">{payment.customerName}</p>
              )}
              {payment.customerEmail && (
                <p className="text-xs text-[#6b7c93]">{payment.customerEmail}</p>
              )}
              {payment.customerPhone && (
                <p className="text-xs text-[#6b7c93]">{payment.customerPhone}</p>
              )}
            </div>
          )}

          {payment.createdAt && (
            <div className="flex justify-between text-sm">
              <span className="text-[#6b7c93]">Date</span>
              <span className="text-[#32325d]">
                {new Date(payment.createdAt).toLocaleString()}
              </span>
            </div>
          )}

          {/* Verify on chain - link + QR */}
          {explorerUrl && (
            <div className="pt-4 border-t border-[#e6e9ec]">
              <p className="text-xs font-medium text-[#6b7c93] mb-3">Verify on chain</p>
              <div className="flex gap-4 items-start">
                <div className="shrink-0 p-2 bg-white border border-[#e6e9ec]">
                  <QRCodeSVG value={explorerUrl} size={100} level="M" />
                </div>
                <div className="flex-1 min-w-0">
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#635bff] hover:underline break-all"
                  >
                    {explorerUrl}
                  </a>
                  <p className="text-xs text-[#6b7c93] mt-1">
                    Scan QR or open link to view transaction on Tempo Explorer
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e6e9ec] bg-[#fafbfc] flex flex-col gap-2">
          {explorerUrl && (
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                View on Explorer
              </a>
            </Button>
          )}
          <Button onClick={onClose} className="w-full bg-[#635bff] hover:bg-[#5851ea]">
            Done
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="text-[#6b7c93]">
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

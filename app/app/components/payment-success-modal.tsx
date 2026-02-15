'use client'

import { Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type PaymentSuccessModalProps = {
  isOpen: boolean
  onClose: () => void
  amount: string
  txHash?: string | null
}

export function PaymentSuccessModal({ isOpen, onClose, amount, txHash }: PaymentSuccessModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] bg-white shadow-xl border border-[#e6e9ec] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center bg-[#16a34a]/10">
            <Check className="h-8 w-8 text-[#16a34a]" strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-bold text-[#32325d] mb-1">Payment successful</h3>
          <p className="text-[#6b7c93] mb-6">
            {amount} AlphaUSD has been sent.
          </p>
          <div className="flex flex-col gap-2">
            {txHash && (
              <a
                href={`https://explore.tempo.xyz/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[#635bff] hover:underline"
              >
                View on Explorer
              </a>
            )}
            <Button
              onClick={onClose}
              className="w-full bg-[#635bff] hover:bg-[#5851ea]"
            >
              Done
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/" className="text-[#6b7c93]">
                Back to home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

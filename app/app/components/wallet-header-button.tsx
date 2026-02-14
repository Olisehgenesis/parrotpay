'use client'

import { useState } from 'react'
import { Copy, Check, ChevronDown, Wallet } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useWalletBalances } from '@/app/hooks/use-wallet-balances'
import { WalletModal } from './wallet-modal'

type WalletHeaderButtonProps = {
  onLogin?: () => void
  authenticated?: boolean
  className?: string
}

export function WalletHeaderButton({ onLogin, authenticated, className = '' }: WalletHeaderButtonProps) {
  const { address } = useAccount()
  const { balances, loading } = useWalletBalances(address ?? undefined)
  const [modalOpen, setModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyAddress = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const alphaBalance = balances.find((b) => b.symbol === 'AlphaUSD')?.balance ?? '0'
  const displayBalance = parseFloat(alphaBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  if (!authenticated || !address) {
    return (
      <button
        type="button"
        onClick={onLogin}
        className={`inline-flex items-center gap-2 rounded-lg border border-[#e6e9ec] bg-white px-4 py-2 text-sm font-medium text-[#32325d] hover:bg-[#f6f9fc] ${className}`}
      >
        <Wallet className="h-4 w-4" />
        Sign in
      </button>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`inline-flex items-center gap-3 rounded-lg border border-[#e6e9ec] bg-[#fafbfc] px-4 py-2 text-sm hover:bg-[#f6f9fc] transition-colors ${className}`}
      >
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[#32325d]">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={copyAddress}
              onKeyDown={(e) => e.key === 'Enter' && copyAddress(e as unknown as React.MouseEvent)}
              className="rounded p-0.5 hover:bg-[#e6e9ec] text-muted-foreground"
              aria-label="Copy address"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
            </span>
          </div>
          <span className="text-xs text-[#6b7c93]">
            {loading ? '...' : `${displayBalance} AlphaUSD`}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-[#6b7c93]" />
      </button>
      <WalletModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}

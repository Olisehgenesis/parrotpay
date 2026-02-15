'use client'

import { useState } from 'react'
import { Copy, Check, ChevronDown, Wallet } from 'lucide-react'
import { usePrivyWallet } from '@/app/hooks/use-privy-wallet'
import { useWalletBalances } from '@/app/hooks/use-wallet-balances'
import { WalletModal } from './wallet-modal'

type WalletHeaderButtonProps = {
  onLogin?: () => void
  authenticated?: boolean
  className?: string
}

export function WalletHeaderButton({ onLogin, authenticated, className = '' }: WalletHeaderButtonProps) {
  const { address, ready } = usePrivyWallet()
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

  // Not authenticated: show connect button
  if (!authenticated) {
    return (
      <button
        type="button"
        onClick={onLogin}
        className={`inline-flex items-center gap-2 bg-[#635bff] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5851ea] ${className}`}
      >
        <Wallet className="h-4 w-4" />
        Connect wallet
      </button>
    )
  }

  // Authenticated but no address yet (Privy loading or wallet being created)
  if (!address) {
    return (
      <div className={`inline-flex items-center gap-2 border border-[#e6e9ec] bg-[#fafbfc] px-4 py-2.5 text-sm text-[#6b7c93] ${className}`}>
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#e6e9ec] border-t-[#635bff]" />
        {ready ? 'Setting up wallet...' : 'Loading...'}
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`inline-flex items-center gap-3 border border-[#e6e9ec] bg-white px-4 py-2.5 text-sm transition-colors hover:border-[#c4cdd5] hover:bg-[#fafbfc] ${className}`}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center bg-[#635bff]/10 text-[#635bff]">
            <span className="text-xs font-semibold">
              {address.slice(2, 4).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="font-mono text-xs font-medium text-[#32325d]">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <span className="text-xs text-[#6b7c93]">
              {loading ? '...' : `${displayBalance} aUSD`}
            </span>
          </div>
        </div>
        <span
          role="button"
          tabIndex={0}
          onClick={copyAddress}
          onKeyDown={(e) => e.key === 'Enter' && copyAddress(e as unknown as React.MouseEvent)}
          className="p-1.5 text-[#6b7c93] transition-colors hover:bg-[#e6e9ec] hover:text-[#32325d] shrink-0"
          aria-label="Copy address"
        >
          {copied ? <Check className="h-4 w-4 text-[#16a34a]" /> : <Copy className="h-4 w-4" />}
        </span>
        <ChevronDown className="h-4 w-4 text-[#6b7c93]" />
      </button>
      <WalletModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}

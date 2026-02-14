'use client'

import { useState } from 'react'
import { useWallets } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'
import { Copy, Check, Wallet, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWalletBalances } from '@/app/hooks/use-wallet-balances'

type WalletModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { address } = useAccount()
  const { wallets } = useWallets()
  const { balances, loading } = useWalletBalances(address ?? undefined)
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-xl border border-[#e6e9ec] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e6e9ec]">
          <h3 className="font-semibold text-[#32325d]">Wallet</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#f6f9fc] text-muted-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Wallets list */}
          <div>
            <h4 className="text-sm font-medium text-[#6b7c93] mb-2">Connected wallets</h4>
            <div className="space-y-2">
              {wallets.map((w) => (
                <div
                  key={w.address}
                  className="flex items-center gap-3 rounded-lg border border-[#e6e9ec] px-4 py-3 bg-[#fafbfc]"
                >
                  <Wallet className="h-5 w-5 text-[#635bff]" />
                  <span className="font-mono text-sm text-[#32325d] truncate flex-1">
                    {w.address?.slice(0, 10)}...{w.address?.slice(-8)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Address + copy */}
          {address && (
            <div>
              <h4 className="text-sm font-medium text-[#6b7c93] mb-2">Address</h4>
              <div className="flex items-center gap-2 rounded-lg border border-[#e6e9ec] px-4 py-3 bg-[#fafbfc]">
                <span className="font-mono text-sm text-[#32325d] truncate flex-1">{address}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={copyAddress}
                  aria-label="Copy address"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* Token balances */}
          <div>
            <h4 className="text-sm font-medium text-[#6b7c93] mb-2">Token balances</h4>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <div className="space-y-2">
                {balances.map((b) => (
                  <div
                    key={b.address}
                    className="flex items-center justify-between rounded-lg border border-[#e6e9ec] px-4 py-3 bg-[#fafbfc]"
                  >
                    <span className="font-medium text-[#32325d]">{b.symbol}</span>
                    <span className="font-mono text-sm text-[#6b7c93]">
                      {parseFloat(b.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

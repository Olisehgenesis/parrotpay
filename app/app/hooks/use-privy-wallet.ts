'use client'

import { usePrivy, useWallets } from '@privy-io/react-auth'
import type { Address } from 'viem'

/**
 * Get the wallet address from Privy.
 * Uses connected wallets (useWallets) when ready; falls back to linked wallets (user.linkedAccounts)
 * when authenticated but connected wallets haven't loaded yet (e.g. embedded wallet iframe).
 * Combines Privy ready + wallets ready for full initialization state.
 * @see https://docs.privy.io/wallets/wallets/get-a-wallet/get-connected-wallet
 */
export function usePrivyWallet(): { address: Address | undefined; ready: boolean } {
  const { user, ready: privyReady } = usePrivy()
  const { wallets } = useWallets()

  // Use privyReady only; walletsReady can stay false with embedded-only (no external connectors)
  const ready = privyReady

  // Prefer connected wallet (for signing/transactions)
  const connectedWallet = wallets.find((w) => w.walletClientType === 'privy') ?? wallets[0]
  const connectedAddress = connectedWallet?.address as Address | undefined

  // Fallback: when authenticated but wallets not ready, use linked wallet address for display
  const linkedWallet = user?.linkedAccounts?.find(
    (a) => a.type === 'wallet' || a.type === 'smart_wallet'
  ) as { address: string } | undefined
  const linkedAddress = linkedWallet?.address as Address | undefined

  const address = connectedAddress ?? linkedAddress

  return { address, ready }
}

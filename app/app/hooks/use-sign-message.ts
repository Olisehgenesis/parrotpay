'use client'

import { useCallback } from 'react'
import { useWallets } from '@privy-io/react-auth'
import { usePrivyWallet } from '@/app/hooks/use-privy-wallet'
import { createWalletClient, custom, walletActions } from 'viem'
import { tempoChain } from '@/privy'

export function useSignMessage() {
  const { address } = usePrivyWallet()
  const { wallets } = useWallets()

  const signMessage = useCallback(
    async (message: string): Promise<`0x${string}`> => {
      if (!address) throw new Error('Connect wallet first')

      const wallet = wallets.find((w) => w.walletClientType === 'privy') ?? wallets[0]
      if (!wallet?.address) throw new Error('No wallet found')

      const provider = await wallet.getEthereumProvider()
      if (!provider) throw new Error('No wallet provider')

      const client = createWalletClient({
        account: address,
        chain: tempoChain,
        transport: custom(provider),
      }).extend(walletActions)

      return client.signMessage({ message })
    },
    [address, wallets]
  )

  return { signMessage }
}

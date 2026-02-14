import type { PrivyClientConfig } from '@privy-io/react-auth'
import { tempoModerato } from 'viem/chains'

export const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'placeholder'
if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID && typeof window !== 'undefined') {
  console.warn('NEXT_PUBLIC_PRIVY_APP_ID is not set. Get one at https://dashboard.privy.io')
}

export const privyConfig: PrivyClientConfig = {
  defaultChain: tempoModerato,
  supportedChains: [tempoModerato],
  appearance: {
    showWalletLoginFirst: true,
  },
  loginMethods: ['wallet', 'email'],
}

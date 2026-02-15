import type { PrivyClientConfig } from '@privy-io/react-auth'
import { tempoModerato } from 'viem/chains'

export const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'placeholder'
if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID && typeof window !== 'undefined') {
  console.warn('NEXT_PUBLIC_PRIVY_APP_ID is not set. Get one at https://dashboard.privy.io')
}

// Extend chain per privy-next-tempo: nativeCurrency.decimals: 6 + feeToken for correct fee display
// https://github.com/aashidham/privy-next-tempo
export const tempoChain = tempoModerato.extend({
  nativeCurrency: { name: 'AlphaUSD', symbol: 'aUSD', decimals: 6 },
  feeToken: '0x20c0000000000000000000000000000000000001' as const,
})

export const privyConfig: PrivyClientConfig = {
  defaultChain: tempoChain,
  supportedChains: [tempoChain],
  appearance: {
    showWalletLoginFirst: false,
  },
  loginMethods: ['email'],
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'all-users', // Create wallet for every user on login (including new users)
    },
  },
  externalWallets: {
    // Embedded wallet may reject Tempo's custom tx type (0x76). MetaMask can be used as fallback.
    disableAllExternalWallets: false,
  },
}

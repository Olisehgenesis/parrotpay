import { createConfig } from '@privy-io/wagmi'
import { http } from 'wagmi'
import { tempoModerato } from 'viem/chains'

export const config = createConfig({
  chains: [tempoModerato],
  transports: {
    [tempoModerato.id]: http(),
  },
})

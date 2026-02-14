'use client'

import { useState, useEffect } from 'react'
import { createPublicClient, http } from 'viem'
import { tempoModerato } from 'viem/chains'
import { tempoActions } from 'viem/tempo'
import { formatUnits } from 'viem'

const TEMPO_TOKENS = [
  { address: '0x20c0000000000000000000000000000000000001' as const, symbol: 'AlphaUSD' },
  { address: '0x20c0000000000000000000000000000000000002' as const, symbol: 'BetaUSD' },
  { address: '0x20c0000000000000000000000000000000000003' as const, symbol: 'ThetaUSD' },
  { address: '0x20c0000000000000000000000000000000000000' as const, symbol: 'pathUSD' },
]

export type TokenBalance = { address: string; symbol: string; balance: string }

const publicClient = createPublicClient({
  chain: tempoModerato,
  transport: http('https://rpc.moderato.tempo.xyz'),
}).extend(tempoActions())

export function useWalletBalances(account: string | undefined) {
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!account) {
      setBalances([])
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all(
      TEMPO_TOKENS.map(async (t) => {
        try {
          const bal = await publicClient.token.getBalance({
            account: account as `0x${string}`,
            token: t.address,
          })
          return { address: t.address, symbol: t.symbol, balance: formatUnits(bal, 6) }
        } catch {
          return { address: t.address, symbol: t.symbol, balance: '0' }
        }
      })
    )
      .then(setBalances)
      .finally(() => setLoading(false))
  }, [account])

  return { balances, loading }
}

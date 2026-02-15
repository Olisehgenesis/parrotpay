'use client'

import { useCallback } from 'react'
import { useWallets } from '@privy-io/react-auth'
import { usePrivyWallet } from '@/app/hooks/use-privy-wallet'
import {
  createWalletClient,
  custom,
  walletActions,
  encodeFunctionData,
  parseAbiItem,
} from 'viem'
import { tempoChain } from '@/privy'
import { tempoActions } from 'viem/tempo'
import { stringToHex, pad } from 'viem'
import type { Address } from 'viem'

function isGasError(msg: string): boolean {
  const lower = msg.toLowerCase()
  return (
    lower.includes('gas') ||
    lower.includes('insufficient funds') ||
    lower.includes('balance') ||
    lower.includes('fee')
  )
}

/** Privy embedded wallet rejects Tempo tx type (0x76). Detects that error. */
function isPrivyTxRejection(msg: string): boolean {
  const lower = msg.toLowerCase()
  return (
    lower.includes('invalid literal value') ||
    lower.includes('expected 0') ||
    lower.includes('expected 1') ||
    lower.includes('expected 2') ||
    lower.includes('expected 4') ||
    lower.includes('unrecognized key') ||
    lower.includes('chain_type')
  )
}

const ERC20_TRANSFER = parseAbiItem('function transfer(address to, uint256 amount) returns (bool)')

/**
 * Privy's embedded wallet only supports standard Ethereum transaction types (0, 1, 2, 4).
 * Tempo uses type 0x76 (custom). We try Tempo transfer first, then fallback to standard
 * ERC20 transfer (TIP-20 is ERC20-compatible) which Privy accepts.
 */
export function useGaslessTransfer() {
  const { address } = usePrivyWallet()
  const { wallets } = useWallets()

  const sendPayment = useCallback(
    async (config: {
      to: Address
      amount: bigint
      token: `0x${string}`
      memo?: string
    }): Promise<string> => {
      if (!address) throw new Error('Connect wallet first')

      const wallet = wallets.find((w) => w.walletClientType === 'privy') ?? wallets[0]
      if (!wallet?.address) throw new Error('No wallet found. Please connect with Privy.')

      if (typeof wallet.switchChain === 'function') {
        await wallet.switchChain(tempoChain.id)
      }

      const provider = await wallet.getEthereumProvider()
      if (!provider) throw new Error('No wallet provider found')

      const client = createWalletClient({
        account: address,
        chain: tempoChain,
        transport: custom(provider),
      })
        .extend(walletActions)
        .extend(tempoActions())

      const memoHex = config.memo ? pad(stringToHex(config.memo.slice(0, 32)), { size: 32 }) : undefined

      try {
        const { receipt } = await client.token.transferSync({
          to: config.to,
          amount: config.amount,
          token: config.token,
          memo: memoHex,
        })
        return receipt.transactionHash
      } catch (tempoErr) {
        const message = tempoErr instanceof Error ? tempoErr.message : String(tempoErr)
        if (isGasError(message)) {
          throw new Error(
            'Insufficient balance for gas. You need AlphaUSD to pay transaction fees.'
          )
        }
        if (isPrivyTxRejection(message)) {
          try {
            const hash = await client.sendTransaction({
              to: config.token,
              data: encodeFunctionData({
                abi: [ERC20_TRANSFER],
                functionName: 'transfer',
                args: [config.to, config.amount],
              }),
              value: BigInt(0),
            })
            return hash
          } catch (erc20Err) {
            throw new Error(
              'Transaction failed. Try connecting with MetaMask instead of the embedded wallet.'
            )
          }
        }
        throw tempoErr
      }
    },
    [address, wallets]
  )

  return { sendPayment }
}

/**
 * Send 1000 AlphaUSD from admin wallet to a recipient.
 * Run: npx tsx scripts/send-tip.ts
 * Or: node --env-file=.env --import=tsx scripts/send-tip.ts
 *
 * Requires ADMIN (private key) in .env
 */

import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { tempoModerato } from 'viem/chains'
import { tempoActions } from 'viem/tempo'
import { withFeePayer } from 'viem/tempo'
import { parseUnits } from 'viem'
import { config } from 'dotenv'

config({ path: '.env' })

const ALPHA_USD = '0x20c0000000000000000000000000000000000001' as const
const RECIPIENT = '0x63E4f535722c20ba3587f403554fbb37b747Cda6' as const
const AMOUNT_USD = 1000

async function main() {
  const adminKey = process.env.ADMIN
  if (!adminKey) {
    console.error('Missing ADMIN in .env')
    process.exit(1)
  }

  const account = privateKeyToAccount(adminKey as `0x${string}`)
  const amountWei = parseUnits(AMOUNT_USD.toString(), 6)

  const client = createWalletClient({
    account,
    chain: tempoModerato,
    transport: withFeePayer(
      http('https://rpc.moderato.tempo.xyz'),
      http('https://sponsor.moderato.tempo.xyz')
    ),
  }).extend(tempoActions())

  console.log(`Sending ${AMOUNT_USD} AlphaUSD to ${RECIPIENT}...`)

  const { receipt } = await client.token.transferSync({
    to: RECIPIENT,
    amount: amountWei,
    token: ALPHA_USD,
    feePayer: true,
  })

  console.log('Done! Tx:', receipt.transactionHash)
  console.log('Explorer:', `https://explore.tempo.xyz/tx/${receipt.transactionHash}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

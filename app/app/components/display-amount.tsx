'use client'

import { useDisplayAmount } from '@/app/hooks/use-display-amount'

export function DisplayAmount({ usdAmount, currency }: { usdAmount: string; currency: string }) {
  return <>{useDisplayAmount(usdAmount, currency || 'usd')}</>
}

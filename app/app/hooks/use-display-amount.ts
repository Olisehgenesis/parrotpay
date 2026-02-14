'use client'

import { useState, useEffect } from 'react'
import { formatAmount } from '@/lib/currency'

/**
 * Convert stored USD amount to display currency and format.
 * Uses fawazahmed0 exchange API.
 */
export function useDisplayAmount(usdAmount: string, displayCurrency: string): string {
  const code = (displayCurrency || 'usd').toLowerCase()
  const normalized = code === 'alphausd' ? 'usd' : code
  const [display, setDisplay] = useState<string>(() => {
    const num = parseFloat(usdAmount)
    if (isNaN(num)) return '—'
    if (normalized === 'usd') return formatAmount(num, 'usd')
    return `$${num.toFixed(2)}` // fallback while loading
  })

  useEffect(() => {
    const num = parseFloat(usdAmount)
    if (isNaN(num)) {
      setDisplay('—')
      return
    }
    if (normalized === 'usd') {
      setDisplay(formatAmount(num, 'usd'))
      return
    }
    fetch('/api/currency-rates')
      .then((r) => r.json())
      .then((data) => {
        const rate = data?.usd?.[normalized]
        if (!rate) {
          setDisplay(formatAmount(num, 'usd'))
          return
        }
        const converted = num * rate
        setDisplay(formatAmount(converted, normalized))
      })
      .catch(() => setDisplay(formatAmount(num, 'usd')))
  }, [usdAmount, displayCurrency, normalized])

  return display
}

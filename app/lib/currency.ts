/**
 * Currency conversion using fawazahmed0/exchange-api
 * https://github.com/fawazahmed0/exchange-api
 * Store amounts in USD, display in user's preferred currency
 */

const API_BASE = 'https://latest.currency-api.pages.dev/v1/currencies'
const FALLBACK_BASE = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies'

export type CurrencyCode = string // usd, eur, gbp, ngn, jpy, etc.

interface RatesResponse {
  date: string
  usd: Record<string, number>
}

let cachedRates: RatesResponse | null = null
let cacheTime = 0
const CACHE_MS = 60 * 60 * 1000 // 1 hour

async function fetchRates(): Promise<RatesResponse> {
  if (cachedRates && Date.now() - cacheTime < CACHE_MS) {
    return cachedRates
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    let res = await fetch(`${API_BASE}/usd.json`, { signal: controller.signal })
    if (!res.ok) res = await fetch(`${FALLBACK_BASE}/usd.json`, { signal: controller.signal })
    if (!res.ok) throw new Error('Currency API unavailable')
    const data = await res.json()
    if (!data?.usd || typeof data.usd !== 'object') throw new Error('Invalid API response')
    cachedRates = data
    cacheTime = Date.now()
    return data
  } catch (err) {
    if (cachedRates) return cachedRates
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Convert amount from USD to target currency.
 * API returns: 1 USD = X targetCurrency (e.g. 1 USD = 0.84 EUR)
 */
export async function usdToCurrency(usdAmount: number, targetCurrency: CurrencyCode): Promise<number> {
  if (targetCurrency.toLowerCase() === 'usd') return usdAmount
  const { usd: rates } = await fetchRates()
  const code = targetCurrency.toLowerCase()
  const rate = rates[code]
  if (!rate) return usdAmount // fallback to USD if unknown currency
  return usdAmount * rate
}

/**
 * Convert amount from source currency to USD.
 * API returns: 1 USD = X sourceCurrency, so 1 sourceCurrency = 1/X USD
 */
export async function currencyToUsd(amount: number, sourceCurrency: CurrencyCode): Promise<number> {
  if (sourceCurrency.toLowerCase() === 'usd') return amount
  const { usd: rates } = await fetchRates()
  const code = sourceCurrency.toLowerCase()
  const rate = rates[code]
  if (!rate) return amount
  return amount / rate
}

/**
 * Format amount with currency symbol/code
 */
export function formatAmount(amount: number, currency: CurrencyCode): string {
  const code = currency.toUpperCase()
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    NGN: '₦',
    JPY: '¥',
    INR: '₹',
    CNY: '¥',
    KRW: '₩',
  }
  const symbol = symbols[code] || `${code} `
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

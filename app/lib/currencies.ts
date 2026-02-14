/**
 * Common currencies for payment links - codes match fawazahmed0/exchange-api
 */
export const CURRENCIES = [
  { code: 'usd', name: 'US Dollar', symbol: '$' },
  { code: 'eur', name: 'Euro', symbol: '€' },
  { code: 'gbp', name: 'British Pound', symbol: '£' },
  { code: 'ngn', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'jpy', name: 'Japanese Yen', symbol: '¥' },
  { code: 'inr', name: 'Indian Rupee', symbol: '₹' },
  { code: 'cny', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'cad', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'aud', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'chf', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'brl', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'mxn', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'zar', name: 'South African Rand', symbol: 'R' },
  { code: 'kes', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'ghs', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'egp', name: 'Egyptian Pound', symbol: 'E£' },
  { code: 'try', name: 'Turkish Lira', symbol: '₺' },
  { code: 'krw', name: 'South Korean Won', symbol: '₩' },
  { code: 'sgd', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'aed', name: 'UAE Dirham', symbol: 'د.إ' },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]['code']

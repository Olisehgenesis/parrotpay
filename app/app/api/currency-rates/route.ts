import { NextResponse } from 'next/server'

const API_BASE = 'https://latest.currency-api.pages.dev/v1/currencies'
const FALLBACK_BASE = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies'

export async function GET() {
  try {
    let res = await fetch(`${API_BASE}/usd.json`)
    if (!res.ok) res = await fetch(`${FALLBACK_BASE}/usd.json`)
    if (!res.ok) throw new Error('Currency API unavailable')
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 502 })
  }
}

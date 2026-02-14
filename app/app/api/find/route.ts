import { NextRequest, NextResponse } from 'next/server'

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET

export async function POST(req: NextRequest) {
  try {
    const { identifier } = await req.json()
    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json({ error: 'identifier required' }, { status: 400 })
    }

    if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
      return NextResponse.json({ error: 'Privy not configured' }, { status: 500 })
    }

    const auth = Buffer.from(`${PRIVY_APP_ID}:${PRIVY_APP_SECRET}`).toString('base64')

    const isEmail = identifier.includes('@')
    const url = isEmail
      ? 'https://api.privy.io/v1/users/email/address'
      : 'https://api.privy.io/v1/users/phone/number'

    const body = isEmail
      ? JSON.stringify({ address: identifier })
      : JSON.stringify({ number: identifier })

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'privy-app-id': PRIVY_APP_ID,
        Authorization: `Basic ${auth}`,
      },
      body,
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = await res.json()
    const wallet = user.linked_accounts?.find(
      (a: { type: string; chain_type?: string }) =>
        a.type === 'wallet' && (a.chain_type === 'ethereum' || !a.chain_type)
    )

    if (!wallet?.address) {
      return NextResponse.json({ error: 'No wallet found for user' }, { status: 404 })
    }

    return NextResponse.json({ address: wallet.address })
  } catch (e) {
    console.error('Find user error:', e)
    return NextResponse.json({ error: 'Failed to find user' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currencyToUsd } from '@/lib/currency'
import { randomBytes } from 'crypto'
import { extractApiKey, hashFromRaw } from '@/lib/api-key'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const address = searchParams.get('address')?.toLowerCase()
    const rawKey = extractApiKey(req)
    const keyHash = rawKey ? hashFromRaw(rawKey) : null

    let where: Record<string, unknown> = {}
    if (keyHash) {
      const apiKey = await prisma.apiKey.findUnique({
        where: { keyHash },
      })
      if (!apiKey) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
      }
      where = {
        OR: [
          { apiKeyId: apiKey.id },
          { creatorAddress: apiKey.walletAddress },
          { recipientAddress: apiKey.walletAddress },
        ],
      }
    } else if (address) {
      where = { recipientAddress: address }
    } else {
      return NextResponse.json({ error: 'address query param or API key required' }, { status: 400 })
    }

    const links = await prisma.paymentLink.findMany({
      where,
      include: { payments: true, apiKey: { select: { keyPrefix: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(links)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch payment links' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, amount, currency, recipientAddress, type, memo, userId, meal, phone, metadata, collectCustomerInfo, creatorAddress } = body

    if (!amount || !recipientAddress) {
      return NextResponse.json({ error: 'amount and recipientAddress required' }, { status: 400 })
    }

    const amountNum = parseFloat(String(amount))
    if (isNaN(amountNum)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const rawKey = extractApiKey(req)
    const keyHash = rawKey ? hashFromRaw(rawKey) : null
    let apiKeyId: string | undefined
    let creatorAddr: string | undefined = creatorAddress?.toLowerCase()

    if (keyHash) {
      const apiKey = await prisma.apiKey.findUnique({
        where: { keyHash },
      })
      if (!apiKey) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
      }
      apiKeyId = apiKey.id
      creatorAddr = apiKey.walletAddress
    }

    const currencyCode = (currency || 'usd').toLowerCase()
    let amountUsd: number
    try {
      amountUsd = await currencyToUsd(amountNum, currencyCode)
    } catch (err) {
      console.error('Currency conversion failed, using amount as USD:', err)
      amountUsd = currencyCode === 'usd' ? amountNum : amountNum
    }
    const amountUsdStr = amountUsd.toFixed(2)

    const slug = randomBytes(8).toString('hex')

    // Store collectCustomerInfo in metadata (avoids schema migration)
    const meta = metadata && typeof metadata === 'object' ? { ...metadata } : {}
    if (collectCustomerInfo && typeof collectCustomerInfo === 'object') {
      ;(meta as Record<string, unknown>)._collectCustomerInfo = collectCustomerInfo
    }
    const finalMetadata = Object.keys(meta).length > 0 ? meta : undefined

    const link = await prisma.paymentLink.create({
      data: {
        slug,
        title: title || null,
        amount: amountUsdStr,
        currency: currencyCode.toUpperCase(),
        recipientAddress: recipientAddress.toLowerCase(),
        type: type || 'ONE_TIME',
        memo: memo || null,
        meal: meal || null,
        phone: phone || null,
        metadata: finalMetadata,
        userId: userId || undefined,
        apiKeyId: apiKeyId || undefined,
        creatorAddress: creatorAddr || undefined,
      },
    })

    return NextResponse.json(link)
  } catch (e) {
    console.error('Payment link create error:', e)
    const message = e instanceof Error ? e.message : 'Failed to create payment link'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateApiKey } from '@/lib/api-key'
import { verifyMessage } from 'viem'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')?.toLowerCase()
  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 })
  }
  try {
    const keys = await prisma.apiKey.findMany({
      where: { walletAddress: address },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        walletAddress: true,
        createdAt: true,
        _count: { select: { paymentLinks: true } },
      },
    })
    return NextResponse.json(keys)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, walletAddress, signature, message } = body

    if (!walletAddress || !signature || !message) {
      return NextResponse.json(
        { error: 'walletAddress, signature, and message required' },
        { status: 400 }
      )
    }

    const addr = walletAddress.toLowerCase()
    const isValid = await verifyMessage({
      address: addr as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    })
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { raw, hash, prefix } = generateApiKey()

    const key = await prisma.apiKey.create({
      data: {
        name: name || null,
        keyHash: hash,
        keyPrefix: prefix,
        walletAddress: addr,
      },
    })

    return NextResponse.json({
      id: key.id,
      name: key.name,
      keyPrefix: prefix,
      key: raw,
      createdAt: key.createdAt,
      warning: 'Store this key securely. It will not be shown again.',
    })
  } catch (e) {
    console.error(e)
    const msg = e instanceof Error ? e.message : 'Failed to create API key'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

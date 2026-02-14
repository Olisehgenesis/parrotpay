import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')
  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 })
  }
  try {
    const payments = await prisma.payment.findMany({
      where: { fromAddress: address.toLowerCase() },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json(payments)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { paymentLink: true },
    })
    if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(payment)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 })
  }
}

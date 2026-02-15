import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const completed = await prisma.payment.findMany({
      where: { status: 'COMPLETED' },
      select: { amount: true },
    })
    const totalAmount = completed.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0)
    return NextResponse.json({
      totalAmount: totalAmount.toFixed(2),
      paymentCount: completed.length,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

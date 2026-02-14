import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { txHash, amount, fromAddress, toAddress, memo, paymentLinkId, status, customerName, customerEmail, customerPhone } = body

    if (!fromAddress || !toAddress || !amount) {
      return NextResponse.json({ error: 'fromAddress, toAddress, amount required' }, { status: 400 })
    }

    const payment = await prisma.payment.create({
      data: {
        txHash: txHash || null,
        amount: String(amount),
        fromAddress,
        toAddress,
        memo: memo || null,
        paymentLinkId: paymentLinkId || null,
        status: status || 'COMPLETED',
        customerName: customerName || null,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
      },
    })

    return NextResponse.json(payment)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const link = await prisma.paymentLink.findFirst({
      where: { slug, active: true },
      include: { payments: true },
    })
    if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(link)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch payment link' }, { status: 500 })
  }
}

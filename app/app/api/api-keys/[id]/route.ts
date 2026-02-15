import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const address = searchParams.get('address')?.toLowerCase()
    if (!address) {
      return NextResponse.json({ error: 'address query param required' }, { status: 400 })
    }
    const key = await prisma.apiKey.findUnique({
      where: { id },
    })
    if (!key) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (key.walletAddress !== address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    await prisma.apiKey.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getCapture } from '@/lib/inspector-db'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ reqId: string }> },
) {
  const { reqId } = await params
  const detail = getCapture(reqId)
  if (!detail) {
    return NextResponse.json({ error: 'Capture not found' }, { status: 404 })
  }
  return NextResponse.json(detail)
}

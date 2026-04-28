import { NextResponse } from 'next/server'
import { inspectorAvailable, listCapturesBySession } from '@/lib/inspector-db'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  if (!inspectorAvailable()) {
    return NextResponse.json({ available: false, captures: [] })
  }
  const captures = listCapturesBySession(id)
  return NextResponse.json({ available: true, captures })
}

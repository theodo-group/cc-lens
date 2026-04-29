import { NextResponse } from 'next/server'
import { inspectorAvailable, listRecentCaptures } from '@/lib/inspector-db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? '100'), 500)
  if (!inspectorAvailable()) {
    return NextResponse.json({ available: false, captures: [] })
  }
  const captures = listRecentCaptures(limit)
  return NextResponse.json({ available: true, captures })
}

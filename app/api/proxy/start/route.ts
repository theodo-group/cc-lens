import { NextResponse } from 'next/server'
import { startProxy } from '@/lib/proxy-control'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const state = await startProxy()
    return NextResponse.json({ running: true, ...state })
  } catch (e) {
    return NextResponse.json(
      { running: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    )
  }
}

import { NextResponse } from 'next/server'
import { stopProxy } from '@/lib/proxy-control'

export const dynamic = 'force-dynamic'

export async function POST() {
  const result = stopProxy()
  return NextResponse.json(result)
}

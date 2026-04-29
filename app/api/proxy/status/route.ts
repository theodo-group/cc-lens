import { NextResponse } from 'next/server'
import { getStatus } from '@/lib/proxy-control'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(getStatus())
}

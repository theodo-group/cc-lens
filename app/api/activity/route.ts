import { NextResponse } from 'next/server'
import { readStatsCache, readAllSessionMeta } from '@/lib/claude-reader'

export const dynamic = 'force-dynamic'

function computeStreaks(dates: Set<string>): { current: number; longest: number } {
  const sorted = [...dates].sort()
  if (sorted.length === 0) return { current: 0, longest: 0 }

  let longest = 1
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diff = (curr.getTime() - prev.getTime()) / 86_400_000
    if (diff === 1) {
      streak++
      if (streak > longest) longest = streak
    } else {
      streak = 1
    }
  }

  // Current streak (from today backwards)
  const today = new Date().toISOString().slice(0, 10)
  let current = 0
  const d = new Date(today)
  while (dates.has(d.toISOString().slice(0, 10))) {
    current++
    d.setDate(d.getDate() - 1)
  }

  return { current, longest }
}

export async function GET() {
  const [stats, sessions] = await Promise.all([readStatsCache(), readAllSessionMeta()])

  if (!stats) {
    return NextResponse.json({ error: 'stats-cache.json not found' }, { status: 404 })
  }

  // Day-of-week counts from session timestamps
  const dowCounts: number[] = [0, 0, 0, 0, 0, 0, 0] // Sun=0..Sat=6
  const activeDates = new Set<string>()

  for (const s of sessions) {
    const d = new Date(s.start_time)
    dowCounts[d.getDay()]++
    activeDates.add(s.start_time.slice(0, 10))
  }

  // Also accumulate from message_hours
  for (const s of sessions) {
    for (const ts of s.user_message_timestamps ?? []) {
      const d = new Date(ts)
      dowCounts[d.getDay()]++
    }
  }

  const streaks = computeStreaks(activeDates)

  // Most active day
  let mostActiveDay = ''
  let mostActiveMsgs = 0
  for (const da of stats.dailyActivity ?? []) {
    if (da.messageCount > mostActiveMsgs) {
      mostActiveMsgs = da.messageCount
      mostActiveDay = da.date
    }
  }

  const hourCountsArr = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: (stats.hourCounts ?? {})[String(i)] ?? 0,
  }))

  return NextResponse.json({
    daily_activity: stats.dailyActivity ?? [],
    hour_counts: hourCountsArr,
    dow_counts: dowCounts.map((count, i) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      count,
    })),
    streaks,
    most_active_day: mostActiveDay,
    most_active_day_msgs: mostActiveMsgs,
    total_active_days: activeDates.size,
  })
}

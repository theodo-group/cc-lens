'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { BarChart3, PieChart } from 'lucide-react'
import { UsageOverTimeChart } from '@/components/overview/usage-over-time-chart'
import { ModelBreakdownDonut } from '@/components/overview/model-breakdown-donut'
import { ProjectActivityDonut } from '@/components/overview/project-activity-donut'
import { PeakHoursChart } from '@/components/overview/peak-hours-chart'
import { OverviewConversationTable } from '@/components/overview/conversation-table'
import { formatTokens, formatBytes } from '@/lib/decode'
import type { StatsCache } from '@/types/claude'
import type { SessionWithFacet } from '@/types/claude'
import type { ProjectSummary } from '@/types/claude'
import { format, subDays } from 'date-fns'

interface ApiResponse {
  stats: StatsCache
  computed: {
    totalCost: number
    totalCacheSavings: number
    totalTokens: number
    totalInputTokens: number
    totalOutputTokens: number
    totalCacheReadTokens: number
    totalCacheWriteTokens: number
    totalToolCalls: number
    activeDays: number
    avgSessionMinutes: number
    sessionsThisMonth: number
    sessionsThisWeek: number
    storageBytes: number
    sessionCount: number
  }
}

const fetcher = (url: string) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error(`API error ${r.status}`)
    return r.json()
  })

function TStat({
  label,
  value,
  sub,
  color,
  size = 'lg',
}: {
  label: string
  value: string
  sub?: string
  color?: string
  size?: 'lg' | 'sm'
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5 shrink-0">
      <span className="text-[13px] text-muted-foreground font-mono">{label}:</span>
      <span
        className="font-bold tabular-nums font-mono leading-none text-foreground"
        style={{ color: color ?? undefined, fontSize: size === 'lg' ? '26px' : '16px' }}
      >
        {value}
      </span>
      {sub && (
        <span className="text-[12px] text-muted-foreground/60 font-mono">{sub}</span>
      )}
    </span>
  )
}

function ChartCard({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="border border-border rounded-lg bg-card p-5">
      <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-[0.18em] mb-4 font-mono text-muted-foreground uppercase">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  )
}

export function OverviewClient() {
  const [dateFrom, setDateFrom] = useState(() => format(subDays(new Date(), 7), 'MM/dd/yyyy'))
  const [dateTo, setDateTo] = useState(() => format(new Date(), 'MM/dd/yyyy'))

  const { data, error, isLoading } = useSWR<ApiResponse>('/api/stats', fetcher, {
    refreshInterval: 5_000,
  })
  const { data: sessionsData } = useSWR<{ sessions: SessionWithFacet[] }>('/api/sessions', fetcher, {
    refreshInterval: 5_000,
  })
  const { data: projectsData } = useSWR<{ projects: ProjectSummary[] }>('/api/projects', fetcher, {
    refreshInterval: 5_000,
  })

  const sessions = sessionsData?.sessions ?? []
  const projects = projectsData?.projects ?? []
  const projectCount = projects.length

  const chartDays = useMemo(() => {
    if (!dateFrom || !dateTo) return 90
    try {
      const from = new Date(dateFrom)
      const to = new Date(dateTo)
      if (isNaN(from.getTime()) || isNaN(to.getTime())) return 90
      const diff = Math.ceil((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000))
      return Math.max(1, Math.min(365, diff))
    } catch {
      return 90
    }
  }, [dateFrom, dateTo])

  if (error) {
    return (
      <div className="px-8 py-6 text-destructive text-sm font-mono">
        ✗ error loading data: {String(error)}
      </div>
    )
  }

  if (isLoading || !data || !data.computed) {
    return (
      <div className="px-8 py-6 space-y-6">
        <div className="h-8 w-2/3 bg-card rounded animate-pulse" />
        <div className="h-5 w-1/2 bg-card rounded animate-pulse" />
        <div className="grid grid-cols-[1fr_300px] gap-4 mt-8">
          <div className="h-56 bg-card rounded animate-pulse" />
          <div className="h-56 bg-card rounded animate-pulse" />
        </div>
      </div>
    )
  }

  const { stats, computed } = data

  const total =
    computed.totalInputTokens +
    computed.totalOutputTokens +
    computed.totalCacheReadTokens +
    computed.totalCacheWriteTokens

  const tokenSegs = [
    { label: 'input',       value: computed.totalInputTokens,      color: '#60a5fa' },
    { label: 'output',      value: computed.totalOutputTokens,     color: '#d97706' },
    { label: 'cache_read',  value: computed.totalCacheReadTokens,  color: '#34d399' },
    { label: 'cache_write', value: computed.totalCacheWriteTokens, color: '#a78bfa' },
  ]

  return (
    <div className="px-8 py-6 space-y-8 bg-background">

      {/* ── Primary stats row ── */}
      <div className="flex flex-wrap gap-x-10 gap-y-3 items-baseline">
        <TStat
          label="conversations"
          value={stats.totalMessages.toLocaleString()}
          color={undefined}
        />
        <TStat
          label="claude sessions"
          value={computed.sessionCount.toLocaleString()}
          sub={`this month: ${computed.sessionsThisMonth} · this week: ${computed.sessionsThisWeek}`}
          color={undefined}
        />
        <TStat
          label="tokens"
          value={formatTokens(computed.totalTokens)}
          color="#fbbf24"
        />
        <TStat
          label="projects"
          value={String(projectCount)}
          color={undefined}
        />
        <TStat
          label="storage"
          value={formatBytes(computed.storageBytes)}
          color={undefined}
        />
      </div>

      {/* ── Date range ── */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <label className="text-[13px] text-muted-foreground font-mono">from:</label>
          <input
            type="text"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="MM/DD/YYYY"
            className="bg-muted border border-border rounded px-3 py-1.5 text-sm font-mono text-foreground w-28 focus:outline-none focus:border-primary/50"
          />
          <label className="text-[13px] text-muted-foreground font-mono">to:</label>
          <input
            type="text"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="MM/DD/YYYY"
            className="bg-muted border border-border rounded px-3 py-1.5 text-sm font-mono text-foreground w-28 focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* ── Charts row 1: Token usage + Project activity ── */}
      <div className="grid grid-cols-[1fr_320px] gap-6">
        <ChartCard icon={<BarChart3 className="w-4 h-4" />} title="Token usage over time">
          <UsageOverTimeChart
            data={stats.dailyActivity}
            days={chartDays}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
        </ChartCard>
        <ChartCard icon={<PieChart className="w-4 h-4" />} title="Project activity distribution">
          <ProjectActivityDonut projects={projects} />
        </ChartCard>
      </div>

      {/* ── Peak hours + model breakdown ── */}
      <div className="grid grid-cols-2 gap-6">
        <ChartCard title="Peak hours">
          <PeakHoursChart hourCounts={stats.hourCounts ?? {}} />
        </ChartCard>

        <ChartCard title="Model distribution">
          <ModelBreakdownDonut modelUsage={stats.modelUsage} />
        </ChartCard>
      </div>

      {/* ── Token breakdown ── */}
      <div className="space-y-2 py-2">
        <div className="flex h-[3px] rounded overflow-hidden w-full">
          {tokenSegs.map(({ label, value, color }) => (
            <div
              key={label}
              style={{ width: `${(value / total) * 100}%`, backgroundColor: color }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-1 items-baseline">
          {tokenSegs.map(({ label, value, color }) => (
            <span key={label} className="inline-flex items-baseline gap-1.5">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full self-center shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-[12px] text-muted-foreground font-mono">{label}:</span>
              <span className="text-[13px] font-bold tabular-nums font-mono" style={{ color }}>
                {formatTokens(value)}
              </span>
              <span className="text-[12px] text-muted-foreground/60 font-mono">
                {Math.round((value / total) * 100)}%
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Conversations table ── */}
      <ChartCard title="Recent conversations">
        <OverviewConversationTable sessions={sessions} />
      </ChartCard>
    </div>
  )
}

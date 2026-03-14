'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { mutate } from 'swr'
import { Star } from 'lucide-react'

interface TopBarProps {
  title: string
  subtitle?: string
  showStarButton?: boolean
}

const GITHUB_REPO = 'https://github.com/Arindam200/cc-lens'

function formatTimestamp(d: Date) {
  return d.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function TopBar({ title, subtitle, showStarButton = false }: TopBarProps) {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [now, setNow] = useState<string>('')

  useEffect(() => {
    setNow(formatTimestamp(new Date()))
    const id = setInterval(() => setNow(formatTimestamp(new Date())), 1000)
    return () => clearInterval(id)
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    await mutate(() => true, undefined, { revalidate: true })
    router.refresh()
    setTimeout(() => setRefreshing(false), 800)
  }

  const displayTime = now || '—'

  return (
    <header className="sticky top-0 z-30 border-b border-[#1e2230] bg-[#0f1117]/95 backdrop-blur px-8 py-5 flex items-start justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <span className="text-[#d97706] text-lg leading-none">●</span>
          <h1 className="text-lg font-bold text-[#e8eaed] tracking-tight font-mono">{title}</h1>
        </div>
        {subtitle && (
          <p className="text-base text-[#94a3b8] font-mono pl-6">{subtitle}</p>
        )}
        <p className="text-sm text-[#5a6474] font-mono pl-6">
          last update: {displayTime}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleRefresh}
          className={[
            'flex items-center gap-2 px-5 py-2 text-base font-mono border rounded',
            refreshing
              ? 'text-[#d97706] border-[#d97706]/50'
              : 'text-[#94a3b8] border-[#262a36] hover:text-[#e8eaed] hover:border-[#d97706]/40',
            'transition-colors cursor-pointer',
          ].join(' ')}
        >
          {refreshing ? '↻ refreshing...' : 'refresh charts'}
        </button>
        {showStarButton && (
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2 text-base font-mono border border-[#fbbf24]/60 rounded text-[#fbbf24] bg-[#fbbf24]/10 hover:bg-[#fbbf24]/20 hover:border-[#fbbf24] transition-colors"
          >
            <Star className="w-4 h-4" />
            Star on GitHub
          </a>
        )}
      </div>
    </header>
  )
}

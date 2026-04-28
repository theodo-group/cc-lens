'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import type { CaptureDetail, CaptureSummary } from '@/types/inspector'
import { CapturesEmptyState } from './empty-state'
import { CaptureList } from './capture-list'
import { AnatomyView } from './anatomy-view'
import { Skeleton } from '@/components/ui/skeleton'

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error(`API error ${r.status}`)
  return r.json()
})

interface ListResponse {
  available: boolean
  captures: CaptureSummary[]
}

export function RawApiTab({ sessionId }: { sessionId: string }) {
  const { data, isLoading } = useSWR<ListResponse>(
    `/api/sessions/${sessionId}/captures`,
    fetcher,
    { refreshInterval: 5000 },
  )

  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Auto-select the first capture when the list arrives.
  useEffect(() => {
    if (!selectedId && data?.captures && data.captures.length > 0) {
      setSelectedId(data.captures[0].request_id)
    }
  }, [data?.captures, selectedId])

  const { data: detail, isLoading: detailLoading } = useSWR<CaptureDetail>(
    selectedId ? `/api/captures/${selectedId}` : null,
    fetcher,
  )

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-10 rounded-md" />
        <Skeleton className="h-10 rounded-md" />
        <Skeleton className="h-10 rounded-md" />
      </div>
    )
  }
  if (!data) {
    return <CapturesEmptyState available={false} />
  }
  if (!data.available) {
    return <CapturesEmptyState available={false} />
  }
  if (data.captures.length === 0) {
    return <CapturesEmptyState available={true} />
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-4">
      <CaptureList
        captures={data.captures}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <div className="flex-1 min-h-0">
        {detailLoading && !detail ? (
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-32" />
            <Skeleton className="h-64" />
          </div>
        ) : detail ? (
          <AnatomyView detail={detail} />
        ) : null}
      </div>
    </div>
  )
}

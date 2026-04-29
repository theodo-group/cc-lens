import { TopBar } from '@/components/layout/top-bar'
import { LiveTail } from '@/components/live/live-tail'

export const dynamic = 'force-dynamic'

export default function LivePage() {
  return (
    <div className="flex flex-col h-screen">
      <TopBar title="Live" subtitle="Real-time API capture" />
      <div className="flex-1 min-h-0 overflow-hidden">
        <LiveTail />
      </div>
    </div>
  )
}

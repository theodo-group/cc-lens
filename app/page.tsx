import { TopBar } from '@/components/layout/top-bar'
import { OverviewClient } from './overview-client'

export default function OverviewPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Claude Code Analytics"
        subtitle="Real-time monitoring dashboard for Claude Code"
        showStarButton
      />
      <OverviewClient />
    </div>
  )
}

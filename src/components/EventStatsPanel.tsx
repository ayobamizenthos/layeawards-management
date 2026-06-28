import { formatNaira } from '../lib/format'
import type { LiveStats } from '../lib/liveStats'

interface EventStatsPanelProps {
  stats: LiveStats | null
  ready: boolean
  error: string | null
}

export function EventStatsPanel({ stats, ready, error }: EventStatsPanelProps) {
  if (!ready && !stats) {
    return (
      <section className="panel">
        <div className="empty">Loading live figures…</div>
      </section>
    )
  }

  if (!stats) {
    return (
      <section className="panel">
        <div className="empty">{error ?? 'Could not load the live figures.'}</div>
      </section>
    )
  }

  return (
    <section className="panel">
      <div className="panel__head">
        <div>
          <h2>Voter &amp; Nominee Stats</h2>
          <p>Live figures from the voting site. Updated automatically.</p>
        </div>
        <span className="live-tag">
          <span className="live-tag__dot" />
          Live
        </span>
      </div>

      <div className="metric-grid metric-grid--three">
        <LiveMetric label="Nominees onboarded" value={stats.nominees_count.toLocaleString()} />
        <LiveMetric label="Total votes" value={stats.total_votes.toLocaleString()} />
        <LiveMetric label="Vote revenue" value={formatNaira(stats.vote_revenue)} />
      </div>
    </section>
  )
}

function LiveMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric metric--live">
      <label>{label}</label>
      <div className="metric__value">{value}</div>
    </div>
  )
}

import { useMemo } from 'react'
import type { Task } from '../types'

export function StatsOverview({ tasks }: { tasks: Task[] }) {
  const summary = useMemo(() => {
    const completed = tasks.filter(task => task.status === 'done').length
    const ongoing = tasks.filter(task => task.status === 'ongoing').length
    const pending = tasks.filter(task => task.status === 'pending').length

    return {
      total: tasks.length,
      completed,
      ongoing,
      pending,
    }
  }, [tasks])

  return (
    <div className="stat-row">
      <StatCard label="Total Tasks" value={summary.total} />
      <StatCard label="Completed" value={summary.completed} />
      <StatCard label="In Progress" value={summary.ongoing} />
      <StatCard label="Pending" value={summary.pending} />
    </div>
  )
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string
  value: number | string
  accent?: boolean
}) {
  return (
    <div className={accent ? 'stat-card stat-card--accent' : 'stat-card'}>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
    </div>
  )
}

import { useState } from 'react'
import { Header } from './components/Header'
import { StatsOverview } from './components/StatsOverview'
import { TaskTable } from './components/TaskTable'
import { SponsorTable } from './components/SponsorTable'
import { EventStatsPanel } from './components/EventStatsPanel'
import { SetupNotice } from './components/SetupNotice'
import { UndoToast } from './components/UndoToast'
import { useRealtimeTable } from './hooks/useRealtimeTable'
import { useLiveStats } from './hooks/useLiveStats'
import { isConfigured } from './lib/supabase'
import type { Sponsor, Task } from './types'

type Tab = 'tasks' | 'sponsors' | 'stats'

const TABS: { id: Tab; label: string }[] = [
  { id: 'tasks', label: 'Tasks' },
  { id: 'sponsors', label: 'Sponsors' },
  { id: 'stats', label: 'Voters & Nominees' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('tasks')
  const taskStore = useRealtimeTable<Task>('tasks')
  const sponsorStore = useRealtimeTable<Sponsor>('sponsors')
  const liveStats = useLiveStats()

  if (!isConfigured) {
    return (
      <div className="shell">
        <Header />
        <SetupNotice />
      </div>
    )
  }

  const error = taskStore.error ?? sponsorStore.error

  return (
    <div className="shell">
      <Header />

      {error && (
        <div className="error-bar" role="alert">
          <span>{error}</span>
          <button
            onClick={() => {
              taskStore.dismissError()
              sponsorStore.dismissError()
            }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      <StatsOverview tasks={taskStore.rows} />

      <nav className="tabs">
        {TABS.map(entry => (
          <button
            key={entry.id}
            className={tab === entry.id ? 'tab tab--active' : 'tab'}
            onClick={() => setTab(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </nav>

      {tab === 'tasks' && (
        <TaskTable
          tasks={taskStore.rows}
          ready={taskStore.ready}
          insert={taskStore.insert}
          update={taskStore.update}
          remove={taskStore.remove}
        />
      )}
      {tab === 'sponsors' && (
        <SponsorTable
          sponsors={sponsorStore.rows}
          ready={sponsorStore.ready}
          insert={sponsorStore.insert}
          update={sponsorStore.update}
          remove={sponsorStore.remove}
        />
      )}
      {tab === 'stats' && (
        <EventStatsPanel stats={liveStats.stats} ready={liveStats.ready} error={liveStats.error} />
      )}

      {taskStore.pendingDelete && (
        <UndoToast key={taskStore.pendingDelete.id} label="Task" onUndo={taskStore.undoDelete} />
      )}
      {sponsorStore.pendingDelete && (
        <UndoToast
          key={sponsorStore.pendingDelete.id}
          label="Sponsor"
          onUndo={sponsorStore.undoDelete}
        />
      )}
    </div>
  )
}

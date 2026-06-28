import { useEffect, useState } from 'react'
import { fetchLiveStats, type LiveStats } from '../lib/liveStats'

const REFRESH_MS = 8000

// Polls live voting figures on an interval.
export function useLiveStats() {
  const [stats, setStats] = useState<LiveStats | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const tick = async () => {
      try {
        const next = await fetchLiveStats()
        if (!active) return
        setStats(next)
        setError(null)
      } catch (cause) {
        if (active)
          setError(cause instanceof Error ? cause.message : 'Could not reach the voting site.')
      } finally {
        if (active) setReady(true)
      }
    }

    tick()
    const interval = setInterval(tick, REFRESH_MS)
    const onFocus = () => tick()
    window.addEventListener('focus', onFocus)

    return () => {
      active = false
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  return { stats, ready, error }
}

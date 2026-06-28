import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { deleteRow, insertRow, selectAll, updateRow } from '../lib/rest'

interface Row {
  id: string
  created_at?: string
}

// Loads a table over REST, syncs via realtime, and exposes optimistic
// insert/update/remove. Deletes are deferred 5s to allow undo.
export function useRealtimeTable<T extends Row>(table: string) {
  const [rows, setRows] = useState<T[]>([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<T | null>(null)
  const deleteTimer = useRef<{ item: T; timer: ReturnType<typeof setTimeout> } | null>(null)

  const load = useCallback(async () => {
    try {
      setRows(await selectAll<T>(table))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load data.')
    } finally {
      setReady(true)
    }
  }, [table])

  const commitPending = useCallback(() => {
    const pending = deleteTimer.current
    if (!pending) return
    clearTimeout(pending.timer)
    deleteTimer.current = null
    deleteRow(table, pending.item.id).catch(() => undefined)
  }, [table])

  useEffect(() => {
    load()

    const channel = supabase
      .channel(`realtime:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, payload => {
        setRows(current => {
          if (payload.eventType === 'INSERT') {
            const incoming = payload.new as T
            if (current.some(row => row.id === incoming.id)) return current
            return [...current, incoming]
          }
          if (payload.eventType === 'UPDATE') {
            const incoming = payload.new as T
            return current.map(row => (row.id === incoming.id ? incoming : row))
          }
          return current.filter(row => row.id !== (payload.old as T).id)
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      commitPending()
    }
  }, [table, load, commitPending])

  const insert = useCallback(
    async (values: Partial<T>) => {
      const tempId = crypto.randomUUID()
      const optimistic = {
        ...values,
        id: tempId,
        created_at: new Date().toISOString(),
      } as unknown as T
      setRows(current => [...current, optimistic])

      try {
        const saved = await insertRow<T>(table, values as Record<string, unknown>)
        setRows(current => current.map(row => (row.id === tempId ? saved : row)))
      } catch (cause) {
        setRows(current => current.filter(row => row.id !== tempId))
        setError(cause instanceof Error ? cause.message : 'Could not save. Check your connection.')
      }
    },
    [table]
  )

  const update = useCallback(
    async (id: string, changes: Partial<T>) => {
      setRows(current => current.map(row => (row.id === id ? { ...row, ...changes } : row)))
      try {
        await updateRow(table, id, changes as Record<string, unknown>)
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Could not save your change.')
      }
    },
    [table]
  )

  const remove = useCallback(
    (id: string) => {
      const target = rows.find(row => row.id === id)
      if (!target) return
      commitPending()

      setRows(current => current.filter(row => row.id !== id))
      setPendingDelete(target)

      const timer = setTimeout(() => {
        deleteTimer.current = null
        setPendingDelete(null)
        deleteRow(table, id).catch(() => undefined)
      }, 5000)
      deleteTimer.current = { item: target, timer }
    },
    [rows, table, commitPending]
  )

  const undoDelete = useCallback(() => {
    const pending = deleteTimer.current
    if (!pending) return
    clearTimeout(pending.timer)
    deleteTimer.current = null
    const restored = pending.item
    setRows(current =>
      [...current, restored].sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''))
    )
    setPendingDelete(null)
  }, [])

  return {
    rows,
    ready,
    error,
    dismissError: () => setError(null),
    insert,
    update,
    remove,
    pendingDelete,
    undoDelete,
  }
}

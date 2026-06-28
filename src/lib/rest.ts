import { supabaseUrl, supabaseAnonKey } from './supabase'

// Direct PostgREST calls with ASCII headers to avoid a supabase-js header issue.
const base = `${supabaseUrl}/rest/v1`
const authHeaders: Record<string, string> = {
  apikey: supabaseAnonKey,
  Authorization: `Bearer ${supabaseAnonKey}`,
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${base}/${path}`, {
    ...init,
    headers: { ...authHeaders, 'Content-Type': 'application/json', ...init.headers },
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Request failed (${response.status})`)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export function selectAll<T>(table: string, order = 'created_at.asc'): Promise<T[]> {
  return request<T[]>(`${table}?select=*&order=${order}`, { method: 'GET' })
}

export async function insertRow<T>(table: string, values: Record<string, unknown>): Promise<T> {
  const rows = await request<T[]>(table, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(values),
  })
  return rows[0]
}

export function updateRow(
  table: string,
  id: string,
  changes: Record<string, unknown>
): Promise<void> {
  return request<void>(`${table}?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  })
}

export function deleteRow(table: string, id: string): Promise<void> {
  return request<void>(`${table}?id=eq.${id}`, { method: 'DELETE' })
}

// Read-only aggregate stats from the public voting site. Anon key only.
const LIVE_URL = 'https://xulhnbldvotnqwbxfpht.supabase.co'
const LIVE_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bGhuYmxkdm90bnF3YnhmcGh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2OTYwODYsImV4cCI6MjA5NTI3MjA4Nn0.pP5pmcE_HLkN9IXQi8hzAu3rgztczWqkc2_MM4zxpvc'

export interface LiveStats {
  nominees_count: number
  total_votes: number
  vote_revenue: number
}

export async function fetchLiveStats(): Promise<LiveStats> {
  const response = await fetch(`${LIVE_URL}/rest/v1/rpc/layeawards_public_stats`, {
    method: 'POST',
    headers: {
      apikey: LIVE_ANON,
      Authorization: `Bearer ${LIVE_ANON}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  })
  if (!response.ok) throw new Error(`Live figures unavailable (${response.status})`)
  const [row] = (await response.json()) as LiveStats[]
  return {
    nominees_count: Number(row.nominees_count),
    total_votes: Number(row.total_votes),
    vote_revenue: Number(row.vote_revenue),
  }
}

export type TaskOwner = 'CEO' | 'Marketing' | 'Developer'
export type TaskStatus = 'done' | 'ongoing' | 'pending'

export interface Task {
  id: string
  name: string
  owner: TaskOwner
  deadline: string | null
  status: TaskStatus
  notes: string | null
  created_at: string
}

export type SponsorStatus = 'pending' | 'in_discussion' | 'converted' | 'declined'

export interface Sponsor {
  id: string
  name: string
  proposal_sent: boolean
  proposal_date: string | null
  status: SponsorStatus
  amount: number
  notes: string | null
  created_at: string
}

export interface EventStats {
  id: string
  nominees_count: number
  voters_count: number
  votes_revenue: number
  projected_revenue: number
  projected_costs: number
  updated_at: string
}

export const TASK_OWNERS: TaskOwner[] = ['CEO', 'Marketing', 'Developer']

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'done', label: 'Done' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'pending', label: 'Pending' },
]

export const SPONSOR_STATUSES: { value: SponsorStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_discussion', label: 'In Discussion' },
  { value: 'converted', label: 'Converted' },
  { value: 'declined', label: 'Declined' },
]

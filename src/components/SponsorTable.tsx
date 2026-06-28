import { useEffect, useRef, useState } from 'react'
import { SPONSOR_STATUSES, type Sponsor } from '../types'
import { formatNaira } from '../lib/format'
import { PasswordPrompt } from './PasswordPrompt'
import { playDone, playSuccess } from '../lib/sound'

interface SponsorTableProps {
  sponsors: Sponsor[]
  ready: boolean
  insert: (values: Partial<Sponsor>) => void
  update: (id: string, changes: Partial<Sponsor>) => void
  remove: (id: string) => void
}

export function SponsorTable({ sponsors, ready, insert, update, remove }: SponsorTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const pledged = sponsors
    .filter(sponsor => sponsor.status === 'converted')
    .reduce((sum, sponsor) => sum + Number(sponsor.amount || 0), 0)

  const addSponsor = () => {
    playSuccess()
    insert({
      name: '',
      proposal_sent: false,
      proposal_date: null,
      status: 'pending',
      amount: 0,
      notes: null,
    })
  }

  const changeStatus = (sponsor: Sponsor, status: Sponsor['status']) => {
    if (status === 'converted' && sponsor.status !== 'converted') playDone()
    update(sponsor.id, { status })
  }

  return (
    <section className="panel">
      <div className="panel__head">
        <div>
          <h2>Sponsor Pipeline</h2>
          <p>Track every proposal from first contact to confirmed sponsorship.</p>
        </div>
        <div className="panel__head-actions">
          <div className="progress__value">Confirmed: {formatNaira(pledged)}</div>
          <button className="btn btn--primary btn--sm" onClick={addSponsor}>
            + Add sponsor
          </button>
        </div>
      </div>

      <div className="table-scroll">
        <table className="grid grid--sponsors">
          <thead>
            <tr>
              <th className="col-sponsor">Sponsor</th>
              <th className="col-sentdate">Sent date</th>
              <th className="col-status">Status</th>
              <th className="col-amount">Amount (₦)</th>
              <th className="col-actions" aria-label="Remove" />
            </tr>
          </thead>
          <tbody>
            {sponsors.map(sponsor => (
              <tr key={sponsor.id}>
                <td data-label="Sponsor">
                  <SponsorNameField
                    value={sponsor.name}
                    onCommit={name => update(sponsor.id, { name })}
                  />
                </td>
                <td data-label="Sent date">
                  <input
                    className="cell-input"
                    type="date"
                    title="Proposal sent date"
                    value={sponsor.proposal_date ?? ''}
                    onChange={event =>
                      update(sponsor.id, { proposal_date: event.target.value || null })
                    }
                  />
                </td>
                <td data-label="Status">
                  <select
                    className={`badge-select badge--${sponsor.status}`}
                    title="Sponsor status"
                    value={sponsor.status}
                    onChange={event =>
                      changeStatus(sponsor, event.target.value as Sponsor['status'])
                    }
                  >
                    {SPONSOR_STATUSES.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td data-label="Amount (₦)" className="col-amount">
                  <AmountField
                    value={sponsor.amount}
                    onCommit={amount => update(sponsor.id, { amount })}
                  />
                </td>
                <td className="col-remove">
                  <button
                    type="button"
                    className="row-remove"
                    onClick={() =>
                      sponsor.name.trim() ? setDeleteId(sponsor.id) : remove(sponsor.id)
                    }
                    aria-label="Remove sponsor"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
            {ready && sponsors.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="empty">No sponsors tracked yet. Add your first prospect.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteId && (
        <PasswordPrompt
          message="Enter the project manager's password to delete this sponsor."
          onConfirm={() => {
            remove(deleteId)
            setDeleteId(null)
          }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </section>
  )
}

// Auto-growing field so long company names wrap and stay fully visible.
function SponsorNameField({
  value,
  onCommit,
}: {
  value: string
  onCommit: (name: string) => void
}) {
  const fieldRef = useRef<HTMLTextAreaElement>(null)

  const fitToContent = () => {
    const field = fieldRef.current
    if (!field) return
    field.style.height = 'auto'
    field.style.height = `${field.scrollHeight}px`
  }

  useEffect(fitToContent, [value])

  return (
    <textarea
      ref={fieldRef}
      className="cell-input cell-input--title"
      rows={1}
      placeholder="Company or brand"
      defaultValue={value}
      onInput={fitToContent}
      onBlur={event => onCommit(event.target.value)}
    />
  )
}

// Shows thousands separators while typing; stores a plain number.
function AmountField({ value, onCommit }: { value: number; onCommit: (amount: number) => void }) {
  const [text, setText] = useState(formatAmount(value))

  useEffect(() => {
    setText(formatAmount(value))
  }, [value])

  return (
    <input
      className="cell-input"
      inputMode="numeric"
      title="Amount in naira"
      placeholder="0"
      value={text}
      onChange={event => setText(formatAmount(event.target.value))}
      onBlur={() => onCommit(parseAmount(text))}
    />
  )
}

function formatAmount(input: string | number): string {
  const digits = String(input).replace(/\D/g, '')
  return digits ? Number(digits).toLocaleString('en-NG') : ''
}

function parseAmount(input: string): number {
  return Number(input.replace(/\D/g, '')) || 0
}

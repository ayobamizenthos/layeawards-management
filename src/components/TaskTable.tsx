import { useEffect, useRef, useState } from 'react'
import { TASK_OWNERS, TASK_STATUSES, type Task } from '../types'
import { PasswordPrompt } from './PasswordPrompt'
import { playDone, playSuccess } from '../lib/sound'

interface TaskTableProps {
  tasks: Task[]
  ready: boolean
  insert: (values: Partial<Task>) => void
  update: (id: string, changes: Partial<Task>) => void
  remove: (id: string) => void
}

export function TaskTable({ tasks, ready, insert, update, remove }: TaskTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const completed = tasks.filter(task => task.status === 'done').length
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0

  const addTask = () => {
    playSuccess()
    insert({ name: '', owner: 'CEO', status: 'pending', deadline: null, notes: null })
  }

  const changeStatus = (task: Task, status: Task['status']) => {
    if (status === 'done' && task.status !== 'done') playDone()
    update(task.id, { status })
  }

  return (
    <section className="panel">
      <div className="panel__head">
        <div>
          <h2>Task Tracker</h2>
          <p>Who owns what, by when. Edits save automatically for the whole team.</p>
        </div>
        <div className="panel__head-actions">
          <div className="progress" aria-label={`${progress}% of tasks complete`}>
            <div className="progress__track">
              <div className="progress__fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress__value">{progress}% done</span>
          </div>
          <button className="btn btn--primary btn--sm" onClick={addTask}>
            + Add task
          </button>
        </div>
      </div>

      <div className="table-scroll">
        <table className="grid grid--tasks">
          <thead>
            <tr>
              <th className="col-task">Task</th>
              <th className="col-dept">
                <span className="dept-label--full">Department</span>
                <span className="dept-label--short">Dept</span>
              </th>
              <th className="col-status">Status</th>
              <th className="col-deadline">Deadline</th>
              <th className="col-actions" aria-label="Remove" />
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td data-label="Task">
                  <TaskNameField value={task.name} onCommit={name => update(task.id, { name })} />
                </td>
                <td data-label="Department">
                  <select
                    className="cell-select"
                    title="Department"
                    value={task.owner}
                    onChange={event =>
                      update(task.id, { owner: event.target.value as Task['owner'] })
                    }
                  >
                    {TASK_OWNERS.map(owner => (
                      <option key={owner} value={owner}>
                        {owner}
                      </option>
                    ))}
                  </select>
                </td>
                <td data-label="Status">
                  <select
                    className={`badge-select badge--${task.status}`}
                    title="Task status"
                    value={task.status}
                    onChange={event => changeStatus(task, event.target.value as Task['status'])}
                  >
                    {TASK_STATUSES.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td data-label="Deadline">
                  <input
                    className="cell-input"
                    type="date"
                    title="Deadline"
                    value={task.deadline ?? ''}
                    onChange={event => update(task.id, { deadline: event.target.value || null })}
                  />
                </td>
                <td className="col-remove">
                  <button
                    type="button"
                    className="row-remove"
                    onClick={() => (task.name.trim() ? setDeleteId(task.id) : remove(task.id))}
                    aria-label="Remove task"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
            {ready && tasks.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="empty">No tasks yet. Add the first one to get started.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteId && (
        <PasswordPrompt
          message="Enter the project manager's password to delete this task."
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

// Auto-growing field so long task names wrap and stay fully visible.
function TaskNameField({ value, onCommit }: { value: string; onCommit: (name: string) => void }) {
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
      placeholder="Describe the task"
      defaultValue={value}
      onInput={fitToContent}
      onBlur={event => onCommit(event.target.value)}
    />
  )
}

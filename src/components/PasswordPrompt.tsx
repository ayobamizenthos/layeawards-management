import { useState } from 'react'
import { verifyManager } from '../lib/access'

interface PasswordPromptProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function PasswordPrompt({ message, onConfirm, onCancel }: PasswordPromptProps) {
  const [value, setValue] = useState('')
  const [wrong, setWrong] = useState(false)

  const submit = () => {
    if (verifyManager(value)) onConfirm()
    else setWrong(true)
  }

  return (
    <div className="pw-backdrop" onClick={onCancel}>
      <div className="pw-card" onClick={event => event.stopPropagation()}>
        <h3 className="pw-title">Manager approval needed</h3>
        <p className="pw-message">{message}</p>
        <input
          className={wrong ? 'pw-input pw-input--error' : 'pw-input'}
          type="password"
          autoFocus
          placeholder="Project manager's password"
          value={value}
          onChange={event => {
            setValue(event.target.value)
            setWrong(false)
          }}
          onKeyDown={event => event.key === 'Enter' && submit()}
        />
        {wrong && <span className="pw-error">Incorrect password. Try again.</span>}
        <div className="pw-actions">
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn--danger" onClick={submit}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

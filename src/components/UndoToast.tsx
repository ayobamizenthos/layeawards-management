interface UndoToastProps {
  label: string
  onUndo: () => void
}

export function UndoToast({ label, onUndo }: UndoToastProps) {
  return (
    <div className="undo-toast" role="status">
      <span className="undo-toast__text">{label} deleted</span>
      <button className="undo-toast__action" onClick={onUndo}>
        Undo
      </button>
      <span className="undo-toast__timer" aria-hidden="true" />
    </div>
  )
}

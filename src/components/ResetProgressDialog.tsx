type ResetProgressDialogProps = {
  readonly open: boolean
  readonly onCancel: () => void
  readonly onConfirm: () => void
}

export function ResetProgressDialog({
  open,
  onCancel,
  onConfirm,
}: ResetProgressDialogProps) {
  if (!open) {
    return null
  }

  return (
    <div className="reset-dialog-backdrop">
      <section
        className="reset-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
      >
        <p>Demo Mode</p>
        <h2 id="reset-dialog-title">Reset all progress?</h2>
        <p id="reset-dialog-description">
          This returns the local demo to Day 1. Content definitions stay intact.
        </p>
        <div className="reset-dialog-actions">
          <button type="button" onClick={onCancel} autoFocus>
            Cancel
          </button>
          <button type="button" onClick={onConfirm}>
            Reset Progress
          </button>
        </div>
      </section>
    </div>
  )
}
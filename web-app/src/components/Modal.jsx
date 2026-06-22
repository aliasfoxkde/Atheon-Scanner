// Shared modal wrapper — handles backdrop, keyboard (Escape), focus trap, and aria props
import { useEffect, useRef } from 'react'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function Modal({ id, label, children, onClose, size = 'max-w-4xl' }) {
  const panelRef = useRef(null)

  useEffect(() => {
    const prev = document.activeElement
    const panel = panelRef.current
    if (!panel) return

    // Move focus inside the modal
    const focusable = panel.querySelectorAll(FOCUSABLE)
    if (focusable.length) focusable[0].focus()

    const close = (e) => { if (e.key === 'Escape') onClose?.() }
    // Attach to panel so only the focused/topmost modal responds to Escape,
    // not all stacked modals simultaneously
    panel.addEventListener('keydown', close)
    document.body.style.overflow = 'hidden'

    // Focus trap
    const trap = (e) => {
      if (e.key !== 'Tab') return
      const els = [...panel.querySelectorAll(FOCUSABLE)].filter(el => !el.disabled && el.offsetParent != null)
      if (!els.length) return
      const first = els[0], last = els[els.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    panel.addEventListener('keydown', trap)

    return () => {
      panel.removeEventListener('keydown', close)
      panel.removeEventListener('keydown', trap)
      document.body.style.overflow = ''
      prev?.focus()
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        className={`bg-gray-800 rounded-lg border border-gray-700 w-full ${size} max-h-[90vh] overflow-hidden flex flex-col`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        id={id}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

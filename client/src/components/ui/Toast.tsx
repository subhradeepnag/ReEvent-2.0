'use client'

import { useEffect } from 'react'
import { cn } from '@/utils/cn'

export type ToastSeverity = 'success' | 'error' | 'info' | 'warning'

const tones: Record<ToastSeverity, { ring: string; icon: string; path: string }> = {
  success: { ring: 'text-success', icon: 'bg-success/12', path: 'M20 6 9 17l-5-5' },
  error: { ring: 'text-danger', icon: 'bg-danger/12', path: 'M18 6 6 18M6 6l12 12' },
  warning: { ring: 'text-warning', icon: 'bg-warning/12', path: 'M12 8v5M12 17h.01' },
  info: { ring: 'text-brand', icon: 'bg-brand/12', path: 'M12 16v-5M12 8h.01' },
}

type ToastProps = {
  open: boolean
  message: string
  severity?: ToastSeverity
  onClose: () => void
  duration?: number
}

// Bottom-left toast that slides up on entry. Rendered only while open, so the
// enter animation replays on every new message instead of firing once.
export default function Toast({ open, message, severity = 'success', onClose, duration = 3500 }: ToastProps) {
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [open, message, duration, onClose])

  if (!open) return null

  const tone = tones[severity]

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-6 z-50 flex justify-center sm:left-6 sm:right-auto sm:justify-start">
      <div className="pointer-events-auto flex max-w-md animate-slide-up items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-lift">
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', tone.icon, tone.ring)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d={tone.path} />
          </svg>
        </span>

        <p className="text-sm text-fg">{message}</p>

        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="ml-2 rounded-lg p-1 text-faint transition-colors duration-250 hover:bg-surface-2 hover:text-fg"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

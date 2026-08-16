'use client'

import { cn } from '@/utils/cn'
import type { ToastSeverity } from './Toast'

const tones: Record<ToastSeverity, string> = {
  success: 'border-success/30 bg-success/10 text-success',
  error: 'border-danger/30 bg-danger/10 text-danger',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  info: 'border-brand/30 bg-brand/10 text-brand',
}

// Inline message block for validation and status text that belongs in the flow
// of a form or card, as opposed to the transient Toast.
export default function Alert({
  severity = 'info',
  children,
  className,
}: {
  severity?: ToastSeverity
  children: React.ReactNode
  className?: string
}) {
  return (
    <div role="alert" className={cn('animate-fade-in rounded-xl border px-4 py-3 text-sm', tones[severity], className)}>
      {children}
    </div>
  )
}

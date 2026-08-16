'use client'

import { forwardRef, useId } from 'react'
import { cn } from '@/utils/cn'

// Shared control surface — inputs, selects and textareas all sit on the same
// background, border and focus treatment so a form reads as one block.
export const controlStyles = cn(
  'w-full rounded-xl border border-line bg-surface px-3.5 text-sm text-fg',
  'placeholder:text-faint',
  'transition-[border-color,box-shadow,background-color] duration-250 ease-smooth',
  'hover:border-faint',
  'focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

type FieldShellProps = {
  id: string
  label?: string
  error?: string
  hint?: string
  className?: string
  children: React.ReactNode
}

function FieldShell({ id, label, error, hint, className, children }: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </label>
      )}

      {children}

      {/* Reserve nothing when empty, but animate the message in so the layout shift is soft */}
      {(error || hint) && (
        <p className={cn('animate-fade-in text-xs', error ? 'text-danger' : 'text-faint')} role={error ? 'alert' : undefined}>
          {error || hint}
        </p>
      )}
    </div>
  )
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
  /** Leading icon or symbol rendered inside the control. */
  adornment?: React.ReactNode
  wrapperClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, adornment, className, wrapperClassName, id, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <FieldShell id={inputId} label={label} error={error} hint={hint} className={wrapperClassName}>
      <div className="relative">
        {adornment && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">{adornment}</span>}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          className={cn(controlStyles, 'h-11', adornment && 'pl-10', error && 'border-danger focus:border-danger focus:ring-danger/15', className)}
          {...props}
        />
      </div>
    </FieldShell>
  )
})

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
  hint?: string
  wrapperClassName?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, wrapperClassName, id, rows = 4, ...props },
  ref,
) {
  const generatedId = useId()
  const textareaId = id ?? generatedId

  return (
    <FieldShell id={textareaId} label={label} error={error} hint={hint} className={wrapperClassName}>
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={cn(controlStyles, 'resize-y py-2.5 leading-relaxed', error && 'border-danger focus:border-danger focus:ring-danger/15', className)}
        {...props}
      />
    </FieldShell>
  )
})

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  hint?: string
  adornment?: React.ReactNode
  wrapperClassName?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, adornment, className, wrapperClassName, id, children, ...props },
  ref,
) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <FieldShell id={selectId} label={label} error={error} hint={hint} className={wrapperClassName}>
      <div className="relative">
        {adornment && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">{adornment}</span>}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          className={cn(
            controlStyles,
            'h-11 cursor-pointer appearance-none pr-10',
            adornment && 'pl-10',
            error && 'border-danger focus:border-danger focus:ring-danger/15',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </FieldShell>
  )
})

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  id?: string
}

export function Switch({ checked, onChange, label, description, id }: SwitchProps) {
  const generatedId = useId()
  const switchId = id ?? generatedId

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        id={switchId}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-250 ease-smooth',
          checked ? 'bg-brand' : 'bg-line',
        )}
      >
        <span
          className={cn(
            'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm',
            'transition-transform duration-250 ease-smooth',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>

      {(label || description) && (
        <label htmlFor={switchId} className="cursor-pointer select-none">
          {label && <span className="block text-sm font-medium text-fg">{label}</span>}
          {description && <span className="block text-xs text-faint">{description}</span>}
        </label>
      )}
    </div>
  )
}

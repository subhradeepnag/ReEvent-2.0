'use client'

import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-brand-fg shadow-soft hover:shadow-glow hover:brightness-110',
  secondary: 'border border-line bg-surface text-fg hover:border-brand/50 hover:bg-surface-2 hover:text-brand',
  ghost: 'text-muted hover:bg-surface-2 hover:text-fg',
  danger: 'bg-danger text-white shadow-soft hover:brightness-110',
  success: 'bg-success text-white shadow-soft hover:brightness-110',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 rounded-lg px-3 text-sm',
  md: 'h-11 gap-2 rounded-xl px-5 text-sm',
  lg: 'h-14 gap-2 rounded-2xl px-7 text-base',
}

// Shared look for anything that should read as a button, including next/link anchors
export function buttonStyles({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
} = {}) {
  return cn(
    'inline-flex select-none items-center justify-center whitespace-nowrap font-medium',
    // One easing + a slight press-down is what makes every control feel like one system
    'transition-all duration-250 ease-smooth active:scale-[0.97]',
    'disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className,
  )
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, fullWidth, loading = false, disabled, className, children, ...props },
  ref,
) {
  return (
    <button ref={ref} disabled={disabled || loading} className={buttonStyles({ variant, size, fullWidth, className })} {...props}>
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  )
})

export default Button

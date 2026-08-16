'use client'

import { cn } from '@/utils/cn'
import { ThemePreference, useTheme } from './ThemeProvider'

const options: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
  {
    value: 'light',
    label: 'Light',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    ),
  },
  {
    value: 'system',
    label: 'System',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    ),
  },
]

// Three-way theme picker. The selected pill is a single element that slides between
// slots, which reads far smoother than fading a background in and out per button.
export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, mounted } = useTheme()

  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === theme),
  )

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn('relative flex items-center gap-0.5 rounded-full border border-line/80 bg-surface-2/80 p-1', className)}
    >
      {/* Sliding indicator — hidden until mount so it never animates from a wrong slot */}
      <span
        aria-hidden
        className={cn(
          'absolute left-1 top-1 h-8 w-8 rounded-full bg-surface shadow-soft ring-1 ring-line/60',
          'transition-[transform,opacity] duration-400 ease-smooth',
          mounted ? 'opacity-100' : 'opacity-0',
        )}
        style={{ transform: `translateX(${activeIndex * 2.125}rem)` }}
      />

      {options.map((option) => {
        const isActive = mounted && theme === option.value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${option.label} theme`}
            title={`${option.label} theme`}
            onClick={() => setTheme(option.value)}
            className={cn(
              'relative z-10 flex h-8 w-8 items-center justify-center rounded-full',
              'transition-colors duration-250 ease-smooth',
              isActive ? 'text-brand' : 'text-faint hover:text-fg',
            )}
          >
            {option.icon}
          </button>
        )
      })}
    </div>
  )
}

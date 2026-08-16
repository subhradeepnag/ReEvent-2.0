'use client'

import { useState } from 'react'
import { cn } from '@/utils/cn'

const sizes = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-base',
  lg: 'h-24 w-24 text-2xl',
}

type AvatarProps = {
  src?: string | null
  name?: string | null
  size?: keyof typeof sizes
  className?: string
}

function initials(name?: string | null) {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

// Falls back to initials on a brand-tinted disc rather than a placeholder file,
// so a missing or broken avatar URL never shows a broken-image icon.
export default function Avatar({ src, name, size = 'sm', className }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full',
        'bg-brand-soft font-semibold text-brand ring-1 ring-line',
        sizes[size],
        className,
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src as string} alt={name ?? 'Avatar'} onError={() => setFailed(true)} className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  )
}

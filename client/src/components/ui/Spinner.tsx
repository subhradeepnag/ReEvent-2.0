import { cn } from '@/utils/cn'

export default function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <svg role="status" aria-label={label} viewBox="0 0 24 24" fill="none" className={cn('h-6 w-6 animate-spin text-brand', className)}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

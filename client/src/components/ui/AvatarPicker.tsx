'use client'

import { cn } from '@/utils/cn'
import { compressImage } from '@/utils/image'
import Avatar from './Avatar'

type AvatarPickerProps = {
  /** Currently shown image (data URL or remote URL). */
  value?: string
  name?: string
  /** Receives the compressed data URL once a file is picked. */
  onChange: (dataUrl: string) => void
  size?: 'md' | 'lg'
  className?: string
}

// Avatar with a camera badge that opens the file picker. Shared by signup and profile.
export default function AvatarPicker({ value, name, onChange, size = 'lg', className }: AvatarPickerProps) {
  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      onChange(await compressImage(file, 100))
    } catch (error) {
      console.error('Failed to process image', error)
    }
  }

  return (
    <div className={cn('group relative inline-block', className)}>
      <Avatar
        src={value}
        name={name}
        size={size === 'lg' ? 'lg' : 'md'}
        className="transition-transform duration-400 ease-smooth group-hover:scale-105"
      />

      <label
        className={cn(
          'absolute -bottom-0.5 -right-0.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full',
          'bg-brand text-brand-fg shadow-soft ring-4 ring-surface',
          'transition-transform duration-250 ease-smooth hover:scale-110 active:scale-95',
        )}
        title="Change photo"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M3 8a2 2 0 0 1 2-2h1.5l1.2-2h6.6l1.2 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <circle cx="12" cy="13" r="3.2" />
        </svg>
        <input type="file" accept="image/*" hidden onChange={handleChange} />
      </label>
    </div>
  )
}

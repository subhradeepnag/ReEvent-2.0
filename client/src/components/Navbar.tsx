'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { signOut } from 'next-auth/react'
import { useAppDispatch, useAppSelector, RootState } from '@/store'
import { logout } from '@/store/slices/authSlice'
import { cn } from '@/utils/cn'
import Avatar from './ui/Avatar'
import Button, { buttonStyles } from './ui/Button'
import ThemeToggle from './theme/ThemeToggle'

const pages = [
  { name: 'Activities', path: '/activities' },
  { name: 'Create Activity', path: '/activities/create' },
]

const Navbar = () => {
  const [mounted, setMounted] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn)
  const dispatch = useAppDispatch()
  const profile = useSelector((state: RootState) => state.profile.profile)
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Any navigation should leave the mobile sheet closed behind it
  React.useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  function handleLogout() {
    dispatch(logout())
    localStorage.removeItem('token')
    // Also drop the NextAuth session, otherwise a Google login outlives the logout.
    signOut({ redirect: false })
    router.push('/')
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-40 border-b glass">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-fg shadow-soft transition-transform duration-400 ease-smooth group-hover:rotate-6 group-hover:scale-105">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <rect x="3" y="5" width="18" height="16" rx="3" />
              <path d="M8 3v4M16 3v4M3 11h18" />
            </svg>
          </span>
          <span className="font-mono text-lg font-bold tracking-[0.18em] text-fg transition-colors duration-250 group-hover:text-brand">ReEvent</span>
        </Link>

        {/* Primary links — desktop */}
        <div className="hidden flex-1 items-center gap-1 md:flex">
          {mounted &&
            isLoggedIn &&
            pages.map((page) => (
              <Link
                key={page.name}
                href={page.path}
                className={cn(
                  'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-250 ease-smooth',
                  isActive(page.path) ? 'text-brand' : 'text-muted hover:bg-surface-2 hover:text-fg',
                )}
              >
                {page.name}
                <span
                  className={cn(
                    'absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand',
                    'origin-left transition-transform duration-400 ease-smooth',
                    isActive(page.path) ? 'scale-x-100' : 'scale-x-0',
                  )}
                />
              </Link>
            ))}
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <ThemeToggle />

          {/* Auth controls stay invisible until mount so persisted state can't flash the wrong set */}
          <div className={cn('hidden items-center gap-2 transition-opacity duration-400 md:flex', mounted ? 'opacity-100' : 'opacity-0')}>
            {mounted && !isLoggedIn && (
              <>
                <Link href="/login" className={buttonStyles({ variant: 'ghost', size: 'sm' })}>
                  Login
                </Link>
                <Link href="/signup" className={buttonStyles({ variant: 'primary', size: 'sm' })}>
                  Sign up
                </Link>
              </>
            )}

            {mounted && isLoggedIn && (
              <>
                <Link
                  href="/profile"
                  title="View profile"
                  className="rounded-full ring-2 ring-transparent transition-all duration-250 ease-smooth hover:ring-brand/40 active:scale-95"
                >
                  <Avatar src={profile?.avatar} name={profile?.name} size="sm" />
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="rounded-lg p-2 text-muted transition-colors duration-250 hover:bg-surface-2 hover:text-fg md:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-5 w-5">
              {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile sheet — animates its own height so opening and closing both glide */}
      <div
        className={cn(
          'grid overflow-hidden border-t border-line/70 transition-[grid-template-rows,opacity] duration-400 ease-smooth md:hidden',
          menuOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="min-h-0">
          <div className="flex flex-col gap-1 px-4 py-3">
            {mounted && isLoggedIn ? (
              <>
                {pages.map((page) => (
                  <Link
                    key={page.name}
                    href={page.path}
                    className={cn(
                      'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-250',
                      isActive(page.path) ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-surface-2 hover:text-fg',
                    )}
                  >
                    {page.name}
                  </Link>
                ))}
                <Link href="/profile" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors duration-250 hover:bg-surface-2 hover:text-fg">
                  <Avatar src={profile?.avatar} name={profile?.name} size="xs" />
                  Profile
                </Link>
                <Button variant="secondary" size="sm" fullWidth className="mt-1" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className={buttonStyles({ variant: 'secondary', size: 'sm', fullWidth: true })}>
                  Login
                </Link>
                <Link href="/signup" className={buttonStyles({ variant: 'primary', size: 'sm', fullWidth: true, className: 'mt-1' })}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar

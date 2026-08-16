'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAppSelector } from '@/store'
import { buttonStyles } from '@/components/ui/Button'

const highlights = [
  {
    title: 'Discover',
    body: 'Browse activities happening near you, filtered by city and date.',
    path: 'M21 21l-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
  },
  {
    title: 'Join',
    body: 'Reserve your spot in seconds — free events instantly, paid ones securely.',
    path: 'M20 6 9 17l-5-5',
  },
  {
    title: 'Host',
    body: 'Publish your own activity, set a ticket price, and track every attendee.',
    path: 'M12 5v14M5 12h14',
  },
]

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="relative overflow-hidden">
      {/* Ambient background wash — drifts slowly so the page never feels static */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 animate-float rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute -right-32 top-40 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <section className="mx-auto flex max-w-4xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32">
        <span className="animate-fade-up rounded-full border border-line bg-surface/60 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted backdrop-blur">
          Activities, everywhere
        </span>

        <h1 className="mt-8 animate-fade-up text-5xl font-bold tracking-tight text-fg sm:text-6xl" style={{ animationDelay: '80ms' }}>
          Welcome to{' '}
          <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">ReEvent</span>
        </h1>

        <p className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-muted" style={{ animationDelay: '160ms' }}>
          Discover, join, and create exciting activities around you. Stay connected, expand your network, and never miss out on the fun.
        </p>

        {/* Reserve the row's height so the CTA appearing after mount doesn't shift the page */}
        <div className="mt-10 flex min-h-[3.5rem] flex-col items-center gap-3 sm:flex-row">
          {mounted && isLoggedIn && (
            <Link href="/activities" className={buttonStyles({ size: 'lg', className: 'animate-scale-in' })}>
              Go to Activities
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          )}

          {mounted && !isLoggedIn && (
            <>
              <Link href="/login" className={buttonStyles({ size: 'lg', className: 'animate-scale-in' })}>
                Login
              </Link>
              <Link href="/signup" className={buttonStyles({ variant: 'secondary', size: 'lg', className: 'animate-scale-in' })}>
                Create an account
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-4 pb-24 sm:grid-cols-3 sm:px-6">
        {highlights.map((item, index) => (
          <div
            key={item.title}
            className="group animate-fade-up rounded-2xl border border-line bg-surface p-6 shadow-soft transition-all duration-400 ease-smooth hover:-translate-y-1 hover:border-brand/40 hover:shadow-lift"
            style={{ animationDelay: `${240 + index * 90}ms` }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand transition-transform duration-400 ease-smooth group-hover:scale-110">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d={item.path} />
              </svg>
            </span>
            <h2 className="mt-4 text-base font-semibold text-fg">{item.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.body}</p>
          </div>
        ))}
      </section>

      <footer className="pb-12 text-center text-xs text-faint">Built with ❤️ using Next.js, NestJS, and Tailwind CSS</footer>
    </div>
  )
}

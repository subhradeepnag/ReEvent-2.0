'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Activity } from '@/models'
import indianCities from '../data/indianCities.json'
import { cn } from '@/utils/cn'
import Avatar from './ui/Avatar'
import Button from './ui/Button'
import { Input, Select } from './ui/Field'

type Props = {
  activities: Activity[]
}

const CalendarIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M8 3v4M16 3v4M3 11h18" />
  </svg>
)

const PinIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

// Component to display a list of activities with filtering options for date and city. It shows a card for each activity with its details and a link to view more information about the activity. If no activities are found, it displays a message indicating that there are no activities available.
export default function ActivityList({ activities }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)

  // Filter activities to only include those that are in the future (or on the selected date) and match the selected city (if any)
  const futureActivities = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return activities.filter((activity) => {
      if (!activity.date) return false

      const activityDate = new Date(activity.date)
      activityDate.setHours(0, 0, 0, 0)

      const matchesDate = selectedDate ? activityDate.getTime() === new Date(selectedDate).setHours(0, 0, 0, 0) : activityDate >= today

      const matchesCity = selectedCity ? activity.city === selectedCity : true

      return matchesDate && matchesCity
    })
  }, [activities, selectedDate, selectedCity])

  const hasActivities = futureActivities.length > 0
  const hasFilters = Boolean(selectedDate || selectedCity)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="animate-fade-up text-center">
        <h1 className="text-4xl font-bold tracking-tight text-fg sm:text-5xl">Explore Activities</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">Find something happening near you — filter by date or city to narrow it down.</p>
      </header>

      {/* Filter bar */}
      <div
        className="mt-10 animate-fade-up rounded-2xl border border-line bg-surface p-4 shadow-soft sm:p-5"
        style={{ animationDelay: '100ms' }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Input
            type="date"
            label="Filter by date"
            adornment={CalendarIcon}
            value={selectedDate ?? ''}
            onChange={(e) => setSelectedDate(e.target.value || null)}
            wrapperClassName="flex-1"
          />

          <Select
            label="Filter by city"
            adornment={PinIcon}
            value={selectedCity ?? ''}
            onChange={(e) => setSelectedCity(e.target.value || null)}
            wrapperClassName="flex-1"
          >
            <option value="">All cities</option>
            {indianCities.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name}
              </option>
            ))}
          </Select>

          {/* Only offered once there is something to clear, so the bar stays quiet by default */}
          <div className={cn('transition-all duration-400 ease-smooth', hasFilters ? 'opacity-100' : 'pointer-events-none opacity-0')}>
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedDate(null)
                setSelectedCity(null)
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-faint">
        {futureActivities.length} {futureActivities.length === 1 ? 'activity' : 'activities'} found
      </p>

      {!hasActivities ? (
        <div className="mt-6 flex animate-fade-up flex-col items-center justify-center rounded-2xl border border-dashed border-line py-24 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-faint">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.4-3.4" />
            </svg>
          </span>
          <h2 className="mt-4 text-lg font-semibold text-fg">No activities found</h2>
          <p className="mt-1 text-sm text-muted">{hasFilters ? 'Try widening your filters.' : 'Check back soon — new activities are added often.'}</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {futureActivities.map((activity, index) => {
            const formattedDate = new Date(activity.date).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })

            return (
              <Link
                key={activity.id}
                href={`/activities/${activity.id}`}
                // The whole card is the link, so hover lifts one surface rather than a button inside it
                className={cn(
                  'group flex animate-fade-up flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-soft',
                  'transition-all duration-400 ease-smooth hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-lift',
                )}
                // Cap the stagger so a long list doesn't leave later cards blank for seconds
                style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activity.imageUrl || 'https://picsum.photos/800/600'}
                    alt={activity.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[600ms] ease-smooth group-hover:scale-105"
                  />

                  <span
                    className={cn(
                      'absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-md',
                      activity.isPaid ? 'bg-fg/75 text-bg' : 'bg-success/90 text-white',
                    )}
                  >
                    {activity.isPaid ? `₹${activity.price}` : 'Free'}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h2 className="line-clamp-2 text-base font-semibold text-fg transition-colors duration-250 group-hover:text-brand">{activity.title}</h2>

                  <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted">
                    <span className="flex items-center gap-2">
                      <span className="text-faint">{CalendarIcon}</span>
                      {formattedDate}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-faint">{PinIcon}</span>
                      <span className="truncate">{activity.venue}</span>
                    </span>
                  </div>

                  <div className="mt-auto flex items-center gap-2 border-t border-line pt-4">
                    <Avatar src={activity?.host?.image} name={activity?.hostName} size="xs" />
                    <span className="truncate text-xs text-muted">
                      Hosted by <span className="font-medium text-fg">{activity?.hostName}</span>
                    </span>

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-auto h-4 w-4 shrink-0 text-faint transition-all duration-400 ease-smooth group-hover:translate-x-1 group-hover:text-brand"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

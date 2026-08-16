'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ActivitiesService } from '@/api/activities'
import { Attendee } from '@/models'
import Avatar from './ui/Avatar'
import Alert from './ui/Alert'
import Spinner from './ui/Spinner'
import { Input } from './ui/Field'

interface ActivityAttendeesProps {
  activityId: string
}

export default function ActivityAttendees({ activityId }: ActivityAttendeesProps) {
  const router = useRouter()
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Fetch attendees when component mounts or activityId changes
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await ActivitiesService.getAttendees(activityId)
        setAttendees(data)
      } catch {
        setError('Failed to load attendees')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [activityId])

  // Filter attendees based on search query
  const filtered = attendees.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Alert severity="error">{error}</Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <button
        onClick={() => router.back()}
        className="group mb-6 inline-flex animate-fade-in items-center gap-2 text-sm text-muted transition-colors duration-250 hover:text-fg"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform duration-250 ease-smooth group-hover:-translate-x-1">
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        Back
      </button>

      <header className="flex animate-fade-up flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-fg">Attendees</h1>
          <p className="mt-1 text-sm text-muted">
            {attendees.length} {attendees.length === 1 ? 'person' : 'people'} registered
          </p>
        </div>

        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          wrapperClassName="w-full sm:w-72"
          adornment={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.4-3.4" />
            </svg>
          }
        />
      </header>

      {filtered.length === 0 ? (
        <div className="mt-8 animate-fade-up rounded-2xl border border-dashed border-line py-20 text-center text-sm text-muted">No attendees found.</div>
      ) : (
        <div className="mt-8 animate-fade-up overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
          {/* Table scrolls inside its own container so narrow screens never scroll the page sideways */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-line bg-surface-2/60">
                <tr className="text-xs font-medium uppercase tracking-wide text-faint">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((attendee, idx) => (
                  <tr key={attendee.id} className="transition-colors duration-250 hover:bg-surface-2/60">
                    <td className="px-5 py-3 text-faint">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2.5">
                        <Avatar name={attendee.name} size="xs" />
                        <span className="font-medium text-fg">{attendee.name}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted">{attendee.email}</td>
                    <td className="px-5 py-3 text-muted">{attendee.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

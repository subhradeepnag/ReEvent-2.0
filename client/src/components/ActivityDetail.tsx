'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { Activity } from '@/models/activity'
import { ActivitiesService } from '@/api/activities'
import { ActivityRegistration, Attendee } from '@/models'
import { openRazorpayCheckout, PaymentCancelledError } from '@/utils/razorpay'
import { useTheme } from './theme/ThemeProvider'
import Avatar from './ui/Avatar'
import Button from './ui/Button'
import Alert from './ui/Alert'
import Spinner from './ui/Spinner'
import Toast, { ToastSeverity } from './ui/Toast'

type ActivityDetailProps = {
  activity: Activity
}

// Small labelled cell used for the venue/city/host/email grid
function Detail({ label, value, icon }: { label: string; value?: string; icon: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2/50 px-4 py-3">
      <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-faint">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <path d={icon} />
        </svg>
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium text-fg">{value || '—'}</dd>
    </div>
  )
}

export default function ActivityDetail({ activity }: ActivityDetailProps) {
  const router = useRouter()
  const profile = useSelector((state: RootState) => state.profile.profile)
  const { resolvedTheme } = useTheme()
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<ToastSeverity>('success')
  const [isClient, setIsClient] = useState(false)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [registration, setRegistration] = useState<ActivityRegistration | null>(null)
  const [isJoining, setIsJoining] = useState(false)

  const notify = (message: string, severity: ToastSeverity = 'success') => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setSnackbarOpen(true)
  }

  // Function to fetch attendees for the activity
  const fetchAttendees = async () => {
    try {
      const data = await ActivitiesService.getAttendees(activity.id)
      setAttendees(data)
    } catch (error) {
      console.error('Failed to fetch attendees', error)
    }
  }

  // Function to fetch the logged-in user's registration for this activity, so we know whether payment is still pending
  const fetchRegistration = async () => {
    if (!profile?.id) return
    try {
      const data = await ActivitiesService.getRegistrationStatus(activity.id, profile.id)
      setRegistration(data ?? null)
    } catch (error) {
      console.error('Failed to fetch registration status', error)
    }
  }

  // Set isClient to true when component mounts to avoid hydration issues, and fetch attendees for the activity
  useEffect(() => {
    setIsClient(true)
    fetchAttendees()
    fetchRegistration()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])

  // If we're still on the server, show the loading state rather than nothing, so the page never jumps from blank to full
  if (!isClient) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  // Helper function to check if the logged-in user is the host of the activity
  const isUserActivity = () => {
    return profile?.email === activity.hostEmail
  }

  // Helper function to check if the logged-in user is already attending the activity
  const isAlreadyAttending = () => {
    return attendees.some((a) => a.id === profile?.id)
  }

  // A PENDING registration means the user started a paid checkout but never finished it
  const isPaymentPending = () => {
    return registration?.status === 'PENDING'
  }

  const joinButtonLabel = () => {
    if (!activity.isPaid) return 'Attend Activity'
    if (isPaymentPending()) return `Complete Payment · ₹${activity.price}`
    return `Pay ₹${activity.price} & Join`
  }

  // Handler for Edit button click - navigates to the edit page for the activity
  const handleEdit = (id: string): void => {
    router.push(`${id}/edit`)
  }

  // Handler for the Join/Pay button - asks the server to register the user. Free activities are done in one call;
  // paid ones come back with a Razorpay order that we hand to the checkout widget, then verify the signature server-side.
  const joinActivity = async () => {
    if (!profile?.id) {
      notify('Please log in to join this activity', 'error')
      return
    }

    setIsJoining(true)
    try {
      const result = await ActivitiesService.joinActivity(activity.id, profile.id)

      if (result.type === 'free') {
        notify('You have successfully joined the activity')
      } else {
        const { order } = result

        const payment = await openRazorpayCheckout({
          key: order.key,
          amount: order.amount,
          currency: order.currency,
          name: order.activityTitle,
          description: `Registration for ${order.activityTitle}`,
          order_id: order.id,
          prefill: {
            name: profile.name,
            email: profile.email,
            contact: profile.phone,
          },
          // Match the checkout widget to the active theme so it doesn't glare on a dark page
          theme: { color: resolvedTheme === 'dark' ? '#817aff' : '#4f46e5' },
        })

        await ActivitiesService.verifyPayment(payment.razorpay_order_id, payment.razorpay_payment_id, payment.razorpay_signature)

        notify('Payment successful — you are registered for this activity')
      }

      await Promise.all([fetchAttendees(), fetchRegistration()])
    } catch (error) {
      // A dismissed checkout modal is not a failure — the registration just stays pending
      if (error instanceof PaymentCancelledError) {
        notify('Payment cancelled. You can complete it later.', 'info')
        await fetchRegistration()
      } else {
        notify(`Something went wrong - ${error instanceof Error ? error.message : error}`, 'error')
      }
    } finally {
      setIsJoining(false)
    }
  }

  // Handler for Leave button click - calls the API to leave the activity, shows a message, and refreshes the attendees list
  const leaveActivity = async () => {
    try {
      await ActivitiesService.removeAttendee(activity.id, String(profile?.id))
      notify('You have left the activity')
      await Promise.all([fetchAttendees(), fetchRegistration()])
    } catch (error) {
      notify(`Something went wrong - ${error}`, 'error')
    }
  }

  // Handler for Delete button click - shows a confirmation dialog, calls the API to delete the activity if confirmed, shows a message, and navigates back to the activities list
  const handleDelete = async (id: string): Promise<void> => {
    const confirmed = confirm('Are you sure you want to delete this activity?')
    if (!confirmed) return

    try {
      await ActivitiesService.remove(id)
      notify('Activity deleted successfully')

      setTimeout(() => {
        router.push('/activities')
      }, 1000)
    } catch (error) {
      notify(`Failed to delete activity - ${error}`, 'error')
    }
  }

  const formattedDate = activity.date
    ? new Date(activity.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <button
        onClick={() => router.push('/activities')}
        className="group mb-6 inline-flex animate-fade-in items-center gap-2 text-sm text-muted transition-colors duration-250 hover:text-fg"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform duration-250 ease-smooth group-hover:-translate-x-1">
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        Back to activities
      </button>

      <article className="animate-fade-up overflow-hidden rounded-3xl border border-line bg-surface shadow-lift">
        <div className="relative aspect-[16/7] bg-surface-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={activity.imageUrl || 'https://picsum.photos/1200/600'} alt={activity.title} className="h-full w-full object-cover" />
          {/* Scrim keeps the overlaid title readable whatever the photo looks like */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">{activity.category}</span>
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">{activity.city}</span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{activity.title}</h1>
            </div>

            <span className="rounded-full bg-white/95 px-3.5 py-1.5 text-sm font-bold text-gray-900 shadow-soft">
              {activity.isPaid ? `₹${activity.price}` : 'Free'}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {isUserActivity() && (
            <div className="mb-6 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleEdit(activity.id)}>
                Edit
              </Button>
              <Button variant="secondary" size="sm" className="text-danger hover:border-danger/50 hover:text-danger" onClick={() => handleDelete(activity.id)}>
                Delete
              </Button>
            </div>
          )}

          {formattedDate && (
            <p className="flex items-center gap-2 text-sm font-medium text-brand">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <rect x="3" y="5" width="18" height="16" rx="2.5" />
                <path d="M8 3v4M16 3v4M3 11h18" />
              </svg>
              {formattedDate}
            </p>
          )}

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <Detail label="Venue" value={activity.venue} icon="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" />
            <Detail label="City" value={activity.city} icon="M3 21h18M6 21V8l6-4 6 4v13M10 21v-5h4v5" />
            <Detail label="Host" value={activity.hostName} icon="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
            <Detail label="Email" value={activity.hostEmail} icon="M4 6h16v12H4zM4 7l8 6 8-6" />
          </dl>

          {activity.description && <p className="mt-6 whitespace-pre-line leading-relaxed text-muted">{activity.description}</p>}

          <div className="mt-6 flex items-center justify-between rounded-2xl border border-line bg-surface-2/50 px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Overlapping stack of the first few attendees, with a count for the rest */}
              <div className="flex -space-x-2">
                {attendees.slice(0, 4).map((attendee) => (
                  <Avatar key={attendee.id} name={attendee.name} size="xs" className="ring-2 ring-surface" />
                ))}
                {attendees.length === 0 && <span className="text-sm text-faint">Nobody yet</span>}
              </div>
              <span className="text-sm text-muted">
                <span className="font-semibold text-fg">{attendees.length}</span> attending
                {activity.maxAttendees ? ` · ${activity.maxAttendees} max` : ''}
              </span>
            </div>
          </div>

          {/* A pending registration means a Razorpay order was created but the payment never completed */}
          {isPaymentPending() && (
            <Alert severity="warning" className="mt-4">
              Your payment for this activity is still pending. Use the button below to complete it.
            </Alert>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {!isUserActivity() &&
              (isAlreadyAttending() ? (
                <Button variant="danger" fullWidth onClick={leaveActivity} disabled={isJoining}>
                  Leave Activity
                </Button>
              ) : (
                <Button variant="success" fullWidth loading={isJoining} onClick={joinActivity}>
                  {isJoining ? 'Processing…' : joinButtonLabel()}
                </Button>
              ))}

            {isUserActivity() && (
              <Button fullWidth onClick={() => router.push(`/activities/${activity.id}/attendees`)}>
                View attendees
              </Button>
            )}
          </div>
        </div>
      </article>

      <Toast open={snackbarOpen} message={snackbarMessage} severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)} />
    </div>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardActions, Typography, Button, Snackbar, Alert, CardMedia } from '@mui/material'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import { Activity } from '@/models/activity'
import { useEffect, useState } from 'react'
import { ActivitiesService } from '@/api/activities'
import { useSelector } from 'react-redux'
import { ActivityRegistration, Attendee } from '@/models'
import { openRazorpayCheckout, PaymentCancelledError } from '@/utils/razorpay'

type ActivityDetailProps = {
  activity: Activity
}

export default function ActivityDetail({ activity }: ActivityDetailProps) {
  const router = useRouter()
  const profile = useSelector((state: RootState) => state.profile.profile)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success')
  const [isClient, setIsClient] = useState(false)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [registration, setRegistration] = useState<ActivityRegistration | null>(null)
  const [isJoining, setIsJoining] = useState(false)

  const notify = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
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

  // If we're still on the server, don't render anything to avoid hydration mismatch
  if (!isClient) {
    return null
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
          theme: { color: '#1976d2' },
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

  // Handler for Leave button click - calls the API to leave the activity, shows a snackbar message, and refreshes the attendees list
  const leaveActivity = async () => {
    try {
      await ActivitiesService.removeAttendee(activity.id, String(profile?.id))
      notify('You have left the activity')
      await Promise.all([fetchAttendees(), fetchRegistration()])
    } catch (error) {
      notify(`Something went wrong - ${error}`, 'error')
    }
  }

  // Handler for Delete button click - shows a confirmation dialog, calls the API to delete the activity if confirmed, shows a snackbar message, and navigates back to the activities list
  const handleDelete = async (id: string): Promise<void> => {
    const confirmed = confirm('Are you sure you want to delete this activity?')
    if (!confirmed) return

    try {
      await ActivitiesService.remove(id)
      setSnackbarMessage('Activity deleted successfully')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)

      setTimeout(() => {
        router.push('/activities')
      }, 1000)
    } catch (error) {
      setSnackbarMessage(`Failed to delete activity - ${error}`)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <Card className="w-full max-w-xl shadow-lg rounded-2xl overflow-hidden">
        {/* Image */}
        <CardMedia component="img" height="220" image={activity.imageUrl || '/placeholder-event.jpg'} alt={activity.title} sx={{ objectFit: 'cover' }} />

        {/* Header */}
        <CardHeader
          title={
            <Typography variant="h5" fontWeight={600}>
              {activity.title}
            </Typography>
          }
          subheader={
            <Typography variant="subtitle2" color="text.secondary">
              {activity.city} • {activity.category}
            </Typography>
          }
          action={
            isUserActivity() && (
              <div className="space-x-2">
                <Button variant="outlined" size="small" onClick={() => handleEdit(activity.id)}>
                  Edit
                </Button>
                <Button variant="outlined" size="small" color="error" onClick={() => handleDelete(activity.id)}>
                  Delete
                </Button>
              </div>
            )
          }
        />

        {/* Content */}
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Typography variant="body2">
              <strong>Venue:</strong> {activity.venue}
            </Typography>
            <Typography variant="body2">
              <strong>City:</strong> {activity.city}
            </Typography>
            <Typography variant="body2">
              <strong>Host:</strong> {activity.hostName}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {activity.hostEmail}
            </Typography>
          </div>

          <Typography variant="body1" sx={{ mt: 3 }}>
            {activity.description}
          </Typography>

          <div className="flex justify-between items-center mt-4 p-3 bg-gray-50 rounded-lg">
            <Typography variant="h6">👥 Attendees: {attendees.length}</Typography>
            <Typography variant="h6">{activity.isPaid ? `₹${activity.price}` : 'Free'}</Typography>
          </div>

          {/* A pending registration means a Razorpay order was created but the payment never completed */}
          {isPaymentPending() && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Your payment for this activity is still pending. Use the button below to complete it.
            </Alert>
          )}
        </CardContent>

        {/* Actions */}
        <CardActions sx={{ gap: 2, px: 2, pb: 2 }}>
          <Button variant="outlined" fullWidth onClick={() => router.push('/activities')}>
            ← Back to Activities
          </Button>

          {!isUserActivity() &&
            (isAlreadyAttending() ? (
              <Button variant="contained" color="error" fullWidth onClick={leaveActivity} disabled={isJoining}>
                Leave Activity
              </Button>
            ) : (
              <Button variant="contained" color="success" fullWidth onClick={joinActivity} disabled={isJoining}>
                {isJoining ? 'Processing…' : joinButtonLabel()}
              </Button>
            ))}

          {isUserActivity() && (
            <>
              {/* <Button variant="contained" color="secondary" fullWidth onClick={() => dispatch(decrement())}>
                Cancel Activity
              </Button> */}
              <Button variant="contained" color="info" fullWidth onClick={() => router.push(`/activities/${activity.id}/attendees`)}>
                👥 View Attendees
              </Button>
            </>
          )}
        </CardActions>
      </Card>

      {/* Snackbar */}
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  )
}

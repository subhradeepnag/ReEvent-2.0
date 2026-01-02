'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Button,
  Snackbar,
  Alert,
  CardMedia,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { RootState, useAppDispatch, useAppSelector } from '@/store'
import { Activity } from '@/models/activity'
import { decrement } from '@/store/slices/counterSlice'
import { useEffect, useState } from 'react'
import { ActivitiesService } from '@/api/activities'
import { useSelector } from 'react-redux'

type ActivityDetailProps = {
  activity: Activity
}

export default function ActivityDetail({ activity }: ActivityDetailProps) {
  const router = useRouter()
  const count = useAppSelector((state) => state.counter.value)
  const profile = useSelector((state: RootState) => state.profile.profile)
  const dispatch = useAppDispatch()

  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  const isUserActivity = () => {
    return profile?.email === activity.hostEmail
  }

  const handleEdit = (id: string): void => {
    router.push(`${id}/edit`)
  }

  const attendActivity = async () => {
    try {
      await ActivitiesService.attend(activity.id, profile?.id)
      setSnackbarMessage('You have successfully joined the activity')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch (error) {
      setSnackbarMessage(`Something went wrong - ${error}`)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

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
        <CardMedia
          component="img"
          height="220"
          image={activity.imageUrl || '/placeholder-event.jpg'}
          alt={activity.title}
          sx={{ objectFit: 'cover' }}
        />

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
            <Typography variant="h6">👥 Attendees: {count}</Typography>
          </div>
        </CardContent>

        {/* Actions */}
        <CardActions sx={{ gap: 2, px: 2, pb: 2 }}>
          <Button variant="outlined" fullWidth onClick={() => router.push('/activities')}>
            ← Back to Activities
          </Button>

          {!isUserActivity() && (
            <Button variant="contained" color="success" fullWidth onClick={attendActivity}>
              Attend Activity
            </Button>
          )}

          {isUserActivity() && (
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={() => dispatch(decrement())}
            >
              Cancel Activity
            </Button>
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

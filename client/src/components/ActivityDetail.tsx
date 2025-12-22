'use client'

import { Card, CardContent, CardHeader, CardActions, Typography, Button, Snackbar, Alert } from '@mui/material'
import { useRouter } from 'next/navigation'
import { RootState, useAppDispatch, useAppSelector } from '@/store'
import { Activity } from '@/models/activity'
import { decrement } from '@/store/slices/counterSlice'
import { useState } from 'react'
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

  const isUserActivity = () => {
    return profile?.email === activity.hostEmail
  }

  const handleEdit = (id: string): void => {
    router.push(`${id}/edit`)
  }

  const attendActivity = async () => {
    try {
      await ActivitiesService.attend(activity.id, profile?.id)
    } catch (error) {
      console.error(`Something went wrong - ${error}`)
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
        <CardHeader
          title={
            <Typography variant="h5" component="div">
              {activity.title}
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
        <CardContent>
          <Typography variant="body1" color="textSecondary">
            <strong>Venue:</strong> {activity.venue}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            <strong>Category:</strong> {activity.category}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            <strong>City:</strong> {activity.city}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            <strong>Host Name:</strong> {activity.hostName}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            <strong>Host Email:</strong> {activity.hostEmail}
          </Typography>
          <Typography variant="body2" color="textPrimary" sx={{ mt: 2 }}>
            {activity.description}
          </Typography>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mt-4">
            <Typography variant="h6" color="textPrimary">
              Attendees: {count}
            </Typography>
          </div>
        </CardContent>

        <CardActions className="flex justify-between p-4">
          <Button variant="outlined" color="primary" fullWidth onClick={() => router.push('/activities')}>
            ← Back
          </Button>
          {!isUserActivity() && (
            <Button variant="contained" color="primary" fullWidth onClick={attendActivity}>
              Attend
            </Button>
          )}
          {isUserActivity() && (
            <Button variant="contained" color="secondary" fullWidth onClick={() => dispatch(decrement())}>
              Cancel Activity
            </Button>
          )}
        </CardActions>
      </Card>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  )
}

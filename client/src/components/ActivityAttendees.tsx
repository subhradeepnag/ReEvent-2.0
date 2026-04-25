'use client'

import { useEffect, useState } from 'react'
import { ActivitiesService } from '@/api/activities'
import { Attendee } from '@/models'
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, CircularProgress, Alert, TextField, Box
} from '@mui/material'

interface ActivityAttendeesProps {
  activityId: string
}

export default function ActivityAttendees({ activityId }: ActivityAttendeesProps) {
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
  const filtered = attendees.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 6 }} />
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={600} mb={1}>Attendees</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {attendees.length} registered
      </Typography>

      <TextField
        size="small"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3, width: 300 }}
      />

      {filtered.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No attendees found.</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((attendee, idx) => (
                <TableRow key={attendee.id} hover>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{attendee.name}</TableCell>
                  <TableCell>{attendee.email}</TableCell>
                  <TableCell>{attendee.phone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

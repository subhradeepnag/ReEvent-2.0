'use client'

import { Avatar, Button, Card, CardContent, CardMedia, Typography, Grid, Box, TextField, MenuItem, Paper, InputAdornment } from '@mui/material'
import { CalendarToday, LocationOn } from '@mui/icons-material'
import Link from 'next/link'
import { Activity } from '@/models'
import { useState } from 'react'
import indianCities from '../data/indianCities.json'

type Props = {
  activities: Activity[]
}

export default function ActivityList({ activities }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const futureActivities = activities.filter((activity) => {
    if (!activity.date) return false

    const activityDate = new Date(activity.date)
    activityDate.setHours(0, 0, 0, 0)

    const matchesDate = selectedDate ? activityDate.getTime() === new Date(selectedDate).setHours(0, 0, 0, 0) : activityDate >= today

    const matchesCity = selectedCity ? activity.city === selectedCity : true

    return matchesDate && matchesCity
  })

  const hasActivities = futureActivities.length > 0

  return (
    <Box
      sx={{
        backgroundColor: '#f7f7f7',
        minHeight: '100vh',
        width: '100%',
        py: 6,
        px: 4,
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontWeight: 'bold',
          mb: 6,
          textAlign: 'center',
          color: 'text.primary',
        }}
      >
        Explore Activities
      </Typography>

      <Box
        component={Paper}
        elevation={3}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 2,
          alignItems: 'center',
          p: 2,
          mb: 5,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(240,248,255,0.95))',
          boxShadow: '0 14px 40px rgba(15, 23, 42, 0.12)',
        }}
      >
        <TextField
          type="date"
          label="Filter by date"
          InputLabelProps={{ shrink: true }}
          value={selectedDate ?? ''}
          onChange={(e) => setSelectedDate(e.target.value || null)}
          sx={{ minWidth: 240, flex: '1 1 240px', backgroundColor: '#fff', borderRadius: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarToday color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          label="Filter by city"
          value={selectedCity ?? ''}
          onChange={(e) => setSelectedCity(e.target.value || null)}
          sx={{ minWidth: 240, flex: '1 1 240px', backgroundColor: '#fff', borderRadius: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn color="action" />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="">All Cities</MenuItem>
          {indianCities.map((city) => (
            <MenuItem key={city.name} value={city.name}>
              {city.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {!hasActivities ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '40vh',
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No Activities Found
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {futureActivities.map((activity) => {
            const formattedDate = new Date(activity.date).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })

            return (
              <Grid item xs={12} sm={6} md={4} key={activity.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    boxShadow: 4,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.03)',
                    },
                  }}
                >
                  <CardMedia component="img" height="240" image={activity.imageUrl || 'https://picsum.photos/800/600'} alt={activity.title} />

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {activity.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      📅 {formattedDate}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      📍 {activity.venue}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar src={activity?.host?.image} alt={activity?.host?.displayName} sx={{ width: 30, height: 30 }} />
                      <Typography variant="body2" color="text.secondary">
                        Host: {activity?.hostName}
                      </Typography>
                    </Box>
                  </CardContent>

                  <Box sx={{ p: 2 }}>
                    <Link href={`/activities/${activity.id}`} passHref>
                      <Button variant="contained" fullWidth>
                        View Activity
                      </Button>
                    </Link>
                  </Box>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Box>
  )
}

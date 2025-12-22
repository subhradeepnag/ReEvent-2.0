'use client'

import { Avatar, Button, Card, CardContent, CardMedia, Typography, Grid, Box } from '@mui/material'
import Link from 'next/link'
import { Activity } from '@/models'

type Props = {
  activities: Activity[]
}

export default function ActivityList({ activities }: Props) {
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

      <Grid container spacing={4}>
        {activities.map((activity) => (
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
                <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {activity.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Venue: {activity.venue}
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
                  <Button variant="contained" color="primary" fullWidth>
                    View Activity
                  </Button>
                </Link>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

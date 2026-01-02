'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { Avatar, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'

export default function ProfilePage() {
  const router = useRouter()
  const token = useSelector((state: RootState) => state.auth.token)
  const profile = useSelector((state: RootState) => state.profile.profile)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    if (!token) {
      router.push('/login')
    }
  }, [token, router])

  // Wait until client mount to render
  if (!isClient) {
    return null
  }

  if (!profile) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <Typography variant="h6">Profile not found.</Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f7f9fc',
      }}
    >
      <Card sx={{ width: 400, p: 4, boxShadow: 4, textAlign: 'center' }}>
        <CardContent>
          <Avatar src={profile.image || '/default-avatar.png'} sx={{ width: 100, height: 100, margin: '0 auto', mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {profile.name}
          </Typography>
          <Stack spacing={1} sx={{ my: 2 }}>
            <Typography variant="body1" color="text.secondary">
              📧 {profile.email}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              📱 {profile.phone}
            </Typography>
          </Stack>
          <Button variant="contained" color="primary" fullWidth onClick={() => router.push('/activities')}>
            Back to Activities
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}

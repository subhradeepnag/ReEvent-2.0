'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { AccountsService } from '@/api/account'
import { login } from '@/store/slices/authSlice'
import { AppDispatch } from '@/store'
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert } from '@mui/material'
import { setProfile } from '@/store/slices/profileSlice'

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    try {
      const data = await AccountsService.login(email, password)
      dispatch(login(data.access_token))
      localStorage.setItem('token', data.access_token)
      const profileData = await AccountsService.getProfile(data.access_token)
      dispatch(setProfile(profileData))
      router.push('/activities')
    } catch (err: unknown) {
      console.error(err)
      setError('Invalid email or password. Please try again.')
    }
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
      <Card sx={{ width: 400, p: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" textAlign="center" mb={3}>
            Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <Stack spacing={2}>
              <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
              <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required />
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Login
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

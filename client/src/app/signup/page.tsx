'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AccountsService } from '@/api/account'
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert } from '@mui/material'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    try {
      // Update this if your AccountsService.signup expects more fields
      await AccountsService.signup({ name, phone, email, password })
      router.push('/login')
    } catch (err: unknown) {
      console.error(err)
      setError('Signup failed. Please try again.')
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
            Signup
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSignup}>
            <Stack spacing={2}>
              <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
              <TextField label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth required />
              <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
              <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required />
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Signup
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

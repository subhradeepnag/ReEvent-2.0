'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { AccountsService } from '@/api/account'
import { login } from '@/store/slices/authSlice'
import { AppDispatch } from '@/store'
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert, Divider } from '@mui/material'
import { setProfile } from '@/store/slices/profileSlice'
import { getSession, signIn } from 'next-auth/react'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Handler for form submission to log in the user. It calls the AccountsService to authenticate the user, updates the Redux store with the authentication token and user profile, and navigates to the activities page on success. If there's an error during login, it sets an error message to be displayed to the user.
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

  // Handler for Google login. It uses NextAuth to sign in with Google, retrieves the ID token, and then calls the AccountsService to log in with the Google token. On success, it updates the Redux store and navigates to the activities page. If there's an error during the Google login process, it sets an appropriate error message.
  async function handleGoogleLogin() {
    try {
      const result = await signIn('google', { redirect: false })
      if (result?.error) {
        setError('Google sign-in failed. Please try again.')
        return
      }
      const session = await getSession()
      if (!session?.idToken) {
        setError('Could not retrieve Google token.')
        return
      }
      const data = await AccountsService.googleLogin(session.idToken)
      dispatch(login(data.access_token))
      localStorage.setItem('token', data.access_token)
      const profileData = await AccountsService.getProfile(data.access_token)
      dispatch(setProfile(profileData))
      router.push('/activities')
    } catch (err) {
      console.error(err)
      setError('Google sign-in failed.')
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
              <Button
                variant="outlined"
                fullWidth
                onClick={handleGoogleLogin}
                startIcon={<Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={20} height={20} alt="Google" />}
                sx={{ textTransform: 'none', borderColor: '#dadce0', color: '#3c4043', '&:hover': { borderColor: '#aaa' } }}
              >
                Continue with Google
              </Button>

              <Divider>or</Divider>
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

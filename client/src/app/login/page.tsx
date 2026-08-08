'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { AccountsService } from '@/api/account'
import { login } from '@/store/slices/authSlice'
import { AppDispatch } from '@/store'
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert, Divider } from '@mui/material'
import { setProfile } from '@/store/slices/profileSlice'
import { signIn, useSession } from 'next-auth/react'
import Image from 'next/image'

// Marks that the user started a Google sign-in from this page. Signing in with an
// OAuth provider navigates the browser away to Google and back, so this flag is how
// the page knows on its way back that it still owes the backend token exchange.
const GOOGLE_PENDING_KEY = 'googleLoginPending'

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const exchangingGoogleToken = useRef(false)

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

  // Handler for Google login. Signing in with an OAuth provider always performs a
  // full-page redirect to Google and back, so this only kicks off that redirect —
  // the rest of the login is finished by the effect below once we return here.
  function handleGoogleLogin() {
    setError('')
    sessionStorage.setItem(GOOGLE_PENDING_KEY, '1')
    signIn('google', { callbackUrl: '/login' })
  }

  // Completes a Google login after the browser comes back from Google. It exchanges
  // the NextAuth ID token for our own access token, updates the Redux store with the
  // token and user profile, and navigates to the activities page.
  useEffect(() => {
    if (status !== 'authenticated') return
    if (sessionStorage.getItem(GOOGLE_PENDING_KEY) !== '1') return
    if (exchangingGoogleToken.current) return

    if (!session.idToken) {
      sessionStorage.removeItem(GOOGLE_PENDING_KEY)
      setError('Could not retrieve Google token.')
      return
    }

    exchangingGoogleToken.current = true
    const idToken = session.idToken

    async function completeGoogleLogin(idToken: string) {
      try {
        const data = await AccountsService.googleLogin(idToken)
        dispatch(login(data.access_token))
        localStorage.setItem('token', data.access_token)
        const profileData = await AccountsService.getProfile(data.access_token)
        dispatch(setProfile(profileData))
        sessionStorage.removeItem(GOOGLE_PENDING_KEY)
        router.push('/activities')
      } catch (err) {
        console.error(err)
        sessionStorage.removeItem(GOOGLE_PENDING_KEY)
        exchangingGoogleToken.current = false
        setError('Google sign-in failed.')
      }
    }

    completeGoogleLogin(idToken)
  }, [status, session, dispatch, router])

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

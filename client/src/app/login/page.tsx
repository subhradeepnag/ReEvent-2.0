'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { AccountsService } from '@/api/account'
import { login } from '@/store/slices/authSlice'
import { AppDispatch } from '@/store'
import { setProfile } from '@/store/slices/profileSlice'
import { signIn, useSession } from 'next-auth/react'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import Alert from '@/components/ui/Alert'
import GoogleIcon from '@/components/ui/GoogleIcon'

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
  const [submitting, setSubmitting] = useState(false)
  const exchangingGoogleToken = useRef(false)

  // Handler for form submission to log in the user. It calls the AccountsService to authenticate the user, updates the Redux store with the authentication token and user profile, and navigates to the activities page on success. If there's an error during login, it sets an error message to be displayed to the user.
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
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
      setSubmitting(false)
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
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-brand/15 blur-3xl" />

      <div className="w-full max-w-md animate-fade-up rounded-3xl border border-line bg-surface p-8 shadow-lift">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted">Sign in to keep exploring activities.</p>

        {error && (
          <Alert severity="error" className="mt-6">
            {error}
          </Alert>
        )}

        <Button variant="secondary" fullWidth className="mt-6" onClick={handleGoogleLogin}>
          <GoogleIcon className="h-5 w-5" />
          Continue with Google
        </Button>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-xs uppercase tracking-widest text-faint">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <Button type="submit" fullWidth loading={submitting} className="mt-2">
            {submitting ? 'Signing in…' : 'Login'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          New here?{' '}
          <Link href="/signup" className="font-medium text-brand transition-opacity duration-250 hover:opacity-75">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

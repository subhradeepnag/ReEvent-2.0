'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AccountsService } from '@/api/account'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import Alert from '@/components/ui/Alert'
import AvatarPicker from '@/components/ui/AvatarPicker'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [avatar, setAvatar] = useState<string>('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Handler for form submission to register the user. It calls the AccountsService to create the account and sends the user to the login page on success. If there's an error, it sets an error message to be displayed to the user.
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await AccountsService.signup({ name, phone, email, password, ...(avatar && { avatar }) })
      router.push('/login')
    } catch (err: unknown) {
      console.error(err)
      setError('Signup failed. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />

      <div className="w-full max-w-md animate-fade-up rounded-3xl border border-line bg-surface p-8 shadow-lift">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Create your account</h1>
        <p className="mt-1.5 text-sm text-muted">Join ReEvent and start attending activities.</p>

        {error && (
          <Alert severity="error" className="mt-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSignup} className="mt-6 flex flex-col gap-4">
          <div className="flex justify-center pb-2">
            <AvatarPicker value={avatar} name={name} onChange={setAvatar} />
          </div>

          <Input label="Name" autoComplete="name" placeholder="Ada Lovelace" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Phone number" type="tel" autoComplete="tel" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <Input label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <Button type="submit" fullWidth loading={submitting} className="mt-2">
            {submitting ? 'Creating account…' : 'Sign up'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-brand transition-opacity duration-250 hover:opacity-75">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

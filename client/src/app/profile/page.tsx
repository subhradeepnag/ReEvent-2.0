'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { AccountsService } from '@/api/account'
import { setProfile } from '@/store/slices/profileSlice'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import Alert from '@/components/ui/Alert'
import Avatar from '@/components/ui/Avatar'
import AvatarPicker from '@/components/ui/AvatarPicker'
import Spinner from '@/components/ui/Spinner'

export default function ProfilePage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const token = useSelector((state: RootState) => state.auth.token)
  const profile = useSelector((state: RootState) => state.profile.profile)
  const [isClient, setIsClient] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatar, setAvatar] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (!token) router.push('/login')
  }, [token, router])

  useEffect(() => {
    if (profile) {
      setName(profile.name)
      setPhone(profile.phone)
      setAvatar(profile.avatar || '')
    }
  }, [profile])

  // Handler for saving profile changes. It calls the AccountsService to update the user's profile with the new name, phone, and avatar, updates the Redux store with the updated profile, and exits edit mode. If there's an error during the update process, it sets an error message to be displayed to the user.
  async function handleSave() {
    setSaving(true)
    try {
      const updated = await AccountsService.updateProfile(token!, { name, phone, avatar })
      dispatch(setProfile(updated))
      setIsEditing(false)
      setError('')
    } catch (err) {
      console.error(err)
      setError('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  // Handler for canceling profile edits. It resets the name, phone, and avatar fields to their original values from the profile, exits edit mode, and clears any error messages.
  function handleCancel() {
    if (profile) {
      setName(profile.name)
      setPhone(profile.phone)
      setAvatar(profile.avatar || '')
    }
    setIsEditing(false)
    setError('')
  }

  if (!isClient) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <p className="animate-fade-in text-muted">Profile not found.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-up overflow-hidden rounded-3xl border border-line bg-surface shadow-lift">
        {/* Gradient cap that the avatar overlaps, so the header has depth without an image */}
        <div className="h-24 bg-gradient-to-br from-brand to-accent" />

        <div className="-mt-12 flex flex-col items-center px-8 pb-8">
          {isEditing ? (
            <AvatarPicker value={avatar} name={name} onChange={setAvatar} />
          ) : (
            <Avatar src={profile.avatar} name={profile.name} size="lg" className="ring-4 ring-surface" />
          )}

          <h1 className="mt-4 text-xl font-semibold tracking-tight text-fg">{profile.name}</h1>
          <p className="text-sm text-muted">{profile.email}</p>

          {error && (
            <Alert severity="error" className="mt-5 w-full">
              {error}
            </Alert>
          )}

          {isEditing ? (
            <div className="mt-6 flex w-full flex-col gap-4">
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />

              <div className="mt-2 flex gap-3">
                <Button fullWidth loading={saving} onClick={handleSave}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button variant="secondary" fullWidth onClick={handleCancel} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex w-full flex-col gap-4">
              <dl className="divide-y divide-line rounded-2xl border border-line bg-surface-2/60">
                <div className="flex items-center justify-between px-4 py-3">
                  <dt className="text-xs font-medium uppercase tracking-wide text-faint">Email</dt>
                  <dd className="text-sm text-fg">{profile.email}</dd>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <dt className="text-xs font-medium uppercase tracking-wide text-faint">Phone</dt>
                  <dd className="text-sm text-fg">{profile.phone}</dd>
                </div>
              </dl>

              <div className="flex gap-3">
                <Button variant="secondary" fullWidth onClick={() => setIsEditing(true)}>
                  Edit profile
                </Button>
                <Button fullWidth onClick={() => router.push('/activities')}>
                  Activities
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

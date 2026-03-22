'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { AccountsService } from '@/api/account'
import { Avatar, Box, Button, Card, CardContent, Stack, Typography, TextField, IconButton } from '@mui/material'
import { setProfile } from '@/store/slices/profileSlice'

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
  const [avatarPreview, setAvatarPreview] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setIsClient(true)
    if (!token) router.push('/login')
  }, [token, router])

  useEffect(() => {
    if (profile) {
      setName(profile.name)
      setPhone(profile.phone)
      setAvatar(profile.avatar || '')
      setAvatarPreview(profile.avatar || '')
    }
  }, [profile])

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarPreview(URL.createObjectURL(file))

    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const MAX = 100
      const ratio = Math.min(MAX / img.width, MAX / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      setAvatar(canvas.toDataURL('image/jpeg', 0.7))
    }
  }

  async function handleSave() {
    try {
      const updated = await AccountsService.updateProfile(token!, { name, phone, avatar })
      dispatch(setProfile(updated))
      setIsEditing(false)
      setError('')
    } catch (err) {
      console.error(err)
      setError('Failed to update profile.')
    }
  }

  function handleCancel() {
    if (profile) {
      setName(profile.name)
      setPhone(profile.phone)
      setAvatar(profile.avatar || '')
      setAvatarPreview(profile.avatar || '')
    }
    setIsEditing(false)
    setError('')
  }

  if (!isClient) return null

  if (!profile) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <Typography variant="h6">Profile not found.</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f7f9fc' }}>
      <Card sx={{ width: 400, p: 4, boxShadow: 4, textAlign: 'center' }}>
        <CardContent>
          {/* Avatar */}
          <Box sx={{ position: 'relative', width: 100, margin: '0 auto', mb: 2 }}>
            <Avatar src={avatarPreview || '/default-avatar.png'} sx={{ width: 100, height: 100 }} />
            {isEditing && (
              <IconButton
                component="label"
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  width: 26,
                  height: 26,
                  '&:hover': { backgroundColor: 'primary.dark' },
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M12 15.2A3.2 3.2 0 1 1 12 8.8a3.2 3.2 0 0 1 0 6.4zm7-11.2h-1.8l-1.4-2H8.2L6.8 4H5a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3z" />
                </svg>
                <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
              </IconButton>
            )}
          </Box>

          {error && <Typography color="error" variant="body2" mb={2}>{error}</Typography>}

          {isEditing ? (
            <Stack spacing={2}>
              <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" />
              <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth size="small" />
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="primary" fullWidth onClick={handleSave}>Save</Button>
                <Button variant="outlined" fullWidth onClick={handleCancel}>Cancel</Button>
              </Stack>
            </Stack>
          ) : (
            <>
              <Typography variant="h5" fontWeight="bold" gutterBottom>{profile.name}</Typography>
              <Stack spacing={1} sx={{ my: 2 }}>
                <Typography variant="body1" color="text.secondary">📧 {profile.email}</Typography>
                <Typography variant="body1" color="text.secondary">📱 {profile.phone}</Typography>
              </Stack>
              <Stack spacing={1}>
                <Button variant="outlined" fullWidth onClick={() => setIsEditing(true)}>Edit Profile</Button>
                <Button variant="contained" color="primary" fullWidth onClick={() => router.push('/activities')}>Back to Activities</Button>
              </Stack>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

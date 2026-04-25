'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AccountsService } from '@/api/account'
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert, IconButton, Avatar } from '@mui/material'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [avatar, setAvatar] = useState<string>('')
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [error, setError] = useState('')

  // Handler for avatar image change. It creates a preview of the selected image and resizes it to a maximum of 100x100 pixels before setting it as the new avatar in the component state.
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarPreview(URL.createObjectURL(file))

    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')

      // Resize to max 100x100
      const MAX = 100
      const ratio = Math.min(MAX / img.width, MAX / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // 0.7 = 70% quality, keeps it small
      const compressed = canvas.toDataURL('image/jpeg', 0.7)
      setAvatar(compressed)
    }
  }

  // Handler for form submission to log in the user. It calls the AccountsService to authenticate the user, updates the Redux store with the authentication token and user profile, and navigates to the activities page on success. If there's an error during login, it sets an error message to be displayed to the user.
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    try {
      await AccountsService.signup({ name, phone, email, password, ...(avatar && { avatar }) })
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
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ position: 'relative', width: 80, height: 80 }}>
                  <Avatar src={avatarPreview} sx={{ width: 80, height: 80, fontSize: 32 }}>
                    {!avatarPreview && name?.[0]?.toUpperCase()}
                  </Avatar>
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
                </Box>
              </Box>
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

'use client'

import React from 'react'
import { AppBar, Toolbar, Button, Box, Typography, Tooltip, IconButton, Avatar } from '@mui/material'
import Link from 'next/link'
import { useAppSelector, useAppDispatch, RootState } from '@/store'
import { logout } from '@/store/slices/authSlice'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'

const pages = [
  { name: 'Activities', path: '/activities', color: 'secondary' as const },
  { name: 'Create Activity', path: '/createActivity', color: 'success' as const },
]

const Navbar = () => {
  const [mounted, setMounted] = React.useState(false)
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn)
  const dispatch = useAppDispatch()
  const profile = useSelector((state: RootState) => state.profile.profile)
  const router = useRouter()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  function handleLogout() {
    dispatch(logout())
    localStorage.removeItem('token')
    router.push('/')
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            mr: 2,
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '.3rem',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          ReEvent
        </Typography>

        <Box sx={{ flexGrow: 1 }}>
          {isLoggedIn &&
            pages.map((page) => (
              <Button key={page.name} LinkComponent={Link} href={page.path} variant="contained" color={page.color} sx={{ mx: 1 }}>
                {page.name}
              </Button>
            ))}
        </Box>

        <Box>
          {!isLoggedIn ? (
            <>
              <Button LinkComponent={Link} href="/login" variant="outlined" sx={{ mx: 1 }}>
                Login
              </Button>
              <Button LinkComponent={Link} href="/signup" variant="contained" sx={{ mx: 1 }}>
                Signup
              </Button>
            </>
          ) : (
            <>
              <Tooltip title="View Profile">
                <IconButton onClick={() => router.push('/profile')} sx={{ p: 0, mx: 1 }}>
                  <Avatar
                    src={profile?.avatar ||'/default-avatar.png'} // Should be Profile Image in Future
                    sx={{
                      width: 38,
                      height: 38,
                      border: '2px solid white',
                      cursor: 'pointer',
                    }}
                  />
                </IconButton>
              </Tooltip>
              <Button onClick={handleLogout} variant="outlined" color="inherit" sx={{ mx: 1 }}>
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar

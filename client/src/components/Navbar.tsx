'use client'

import React from 'react'
import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material'
import Link from 'next/link'
import { useAppSelector, useAppDispatch } from '@/store'
import { logout } from '@/store/slices/authSlice'
import { useRouter } from 'next/navigation'

const pages = [
  { name: 'Activities', path: '/activities', color: 'secondary' as const },
  {
    name: 'Create Activity',
    path: '/createActivity',
    color: 'success' as const,
  },
]

const Navbar = () => {
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn)
  const dispatch = useAppDispatch()
  const router = useRouter()

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
          noWrap
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
              <Link key={page.name} href={page.path} passHref legacyBehavior>
                <Button component="a" variant="contained" color={page.color} sx={{ mx: 1 }}>
                  {page.name}
                </Button>
              </Link>
            ))}
        </Box>

        <Box>
          {!isLoggedIn ? (
            <>
              <Button component={Link} href="/login" variant="outlined" color="inherit" sx={{ mx: 1 }}>
                Login
              </Button>
              <Button component={Link} href="/signup" variant="contained" color="primary" sx={{ mx: 1 }}>
                Signup
              </Button>
            </>
          ) : (
            <>
              {/* New Profile Button */}
              <Button component={Link} href="/profile" variant="contained" color="info" sx={{ mx: 1 }}>
                Profile
              </Button>

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

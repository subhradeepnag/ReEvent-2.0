'use client'

import Link from 'next/link'
import { Button, Stack, Typography, Container } from '@mui/material'
import { useAppSelector } from '@/store'

export default function Home() {
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn)
  return (
    <main>
      <Container
        maxWidth="md"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: 4,
          py: 8,
        }}
      >
        <Typography variant="h2" component="h1" fontWeight={700} color="primary">
          Welcome to ReEvent!
        </Typography>

        <Typography variant="h6" color="textSecondary" maxWidth="sm">
          Discover, join, and create exciting activities around you! Stay connected, expand your network, and never miss out on the fun.
        </Typography>

        {isLoggedIn && (
          <Stack direction="row" spacing={2} mt={4}>
            <Button LinkComponent={Link} href="/activities" variant="contained" color="secondary" size="large">
              Go To Activities
            </Button>
          </Stack>
        )}

        {!isLoggedIn && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={4}>
            <Button component={Link} href="/login" variant="contained" color="primary" size="large">
              Login
            </Button>
            <Button component={Link} href="/signup" variant="outlined" color="secondary" size="large">
              Signup
            </Button>
          </Stack>
        )}

        <Typography variant="body2" color="text.disabled" mt={6}>
          Built with ❤️ using Next.js, NestJS, and Material UI
        </Typography>
      </Container>
    </main>
  )
}

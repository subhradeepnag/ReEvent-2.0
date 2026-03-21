import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import Navbar from '@/components/Navbar'
import StoreProvider from '@/store/provider'
import Providers from './providers'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'ReEvent 2.0',
  description: 'Partcipate in different activities across the world',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <StoreProvider>
            <AppRouterCacheProvider>
              <Navbar />
              {children}
            </AppRouterCacheProvider>
          </StoreProvider>
        </Providers>
      </body>
    </html>
  )
}

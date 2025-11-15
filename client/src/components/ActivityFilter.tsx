'use client'

import React from 'react'
import { Box } from '@mui/material'
import dynamic from 'next/dynamic'

const Calendar = dynamic(() => import('react-calendar'), { ssr: false })

export default function ActivityFilter() {
  return (
    <Box sx={{ width: '100%', mt: 10, mr: 10, border: '1px dashed grey' }}>
      <Calendar />
    </Box>
  )
}

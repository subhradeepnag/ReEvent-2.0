'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const Calendar = dynamic(() => import('react-calendar'), { ssr: false })

export default function ActivityFilter() {
  return (
    <div className="w-full rounded-2xl border border-line bg-surface p-4 shadow-soft [&_.react-calendar]:w-full [&_.react-calendar]:border-0 [&_.react-calendar]:bg-transparent [&_.react-calendar]:font-sans">
      <Calendar />
    </div>
  )
}

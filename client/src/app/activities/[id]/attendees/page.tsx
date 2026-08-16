import ActivityAttendees from '@/components/ActivityAttendees'
import { notFound } from 'next/navigation'
import React from 'react'

const getActivityAttendees = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  if (!id) return notFound()

  return <ActivityAttendees activityId={id} />
}

export default getActivityAttendees

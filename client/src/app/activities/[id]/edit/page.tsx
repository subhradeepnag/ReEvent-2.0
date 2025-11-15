import ActivityForm from '@/components/ActivityForm'
import { notFound } from 'next/navigation'
import React from 'react'

const editActivity = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  if (!id) return notFound()

  return <ActivityForm action="edit" id={id} />
}

export default editActivity

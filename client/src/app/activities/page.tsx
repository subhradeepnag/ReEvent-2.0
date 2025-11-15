// src/app/activities/page.tsx
import { ActivitiesService } from '@/api/activities'
import ActivityDashboard from '@/components/ActivityDashboard'
import { notFound } from 'next/navigation'

export default async function ActivitiesPage() {
  try {
    const activities = await ActivitiesService.list()
    if (!activities || activities.length === 0) return notFound()

    return <ActivityDashboard activities={activities} />
  } catch (err) {
    console.error(err)
    return notFound()
  }
}

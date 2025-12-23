import { ActivitiesService } from '@/api/activities'
import ActivityDashboard from '@/components/ActivityDashboard'
import { notFound } from 'next/navigation'

export default async function ActivitiesPage() {
  try {
    const activities = await ActivitiesService.list()
    return <ActivityDashboard activities={activities} />
  } catch (err) {
    console.error(err)
    return notFound()
  }
}

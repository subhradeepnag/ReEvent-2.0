import { notFound } from 'next/navigation'
import ActivityDetail from '@/components/ActivityDetail'
import { ActivitiesService } from '@/api/activities'

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!id) return notFound()

  try {
    const activity = await ActivitiesService.get(id)

    if (!activity) return notFound()

    return <ActivityDetail activity={activity} />
  } catch (err) {
    console.error(err)
    return notFound()
  }
}

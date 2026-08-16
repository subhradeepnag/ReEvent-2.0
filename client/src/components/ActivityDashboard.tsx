import ActivityList from './ActivityList'
import Chatbot from './Chatbot'
import { Activity } from '@/models'

type Props = {
  activities: Activity[]
}

export default function ActivityDashboard({ activities }: Props) {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <ActivityList activities={activities} />
      <Chatbot />
    </div>
  )
}

import { Box } from '@mui/material'
import ActivityList from './ActivityList'
import Chatbot from './Chatbot'
import { Activity } from '@/models'

type Props = {
  activities: Activity[]
}

export default function ActivityDashboard({ activities }: Props) {

  return (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
      <ActivityList activities={activities} />
      {<Chatbot />}
    </Box>
  )
}

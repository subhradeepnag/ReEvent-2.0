// src/components/ActivityDashboard.tsx
import { Box } from '@mui/material'
import ActivityList from './ActivityList'
import { Activity } from '@/models'

type Props = {
  activities: Activity[]
}

export default function ActivityDashboard({ activities }: Props) {
  return (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
      <ActivityList activities={activities} />
    </Box>
  )
}

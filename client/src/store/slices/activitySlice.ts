import { Activity } from '@/models'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ActivityState {
  activities: Activity[]
  activity: Activity | null
}

const initialState: ActivityState = {
  activities: [],
  activity: null,
}

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    setActivities: (state, action: PayloadAction<Activity[]>) => {
      state.activities = action.payload
    },
    setActivity: (state, action: PayloadAction<Activity>) => {
      state.activity = action.payload
    },
  },
})

export const { setActivities, setActivity } = activitySlice.actions
export default activitySlice.reducer

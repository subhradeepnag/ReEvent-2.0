import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ProfileState {
  profile: {
    id: number
    name: string
    email: string
    phone: string
    image?: string
  } | null
}

const initialState: ProfileState = {
  profile: null,
}

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<typeof initialState.profile>) {
      state.profile = action.payload
    },
    clearProfile(state) {
      state.profile = null
    },
  },
})

export const { setProfile, clearProfile } = profileSlice.actions
export default profileSlice.reducer

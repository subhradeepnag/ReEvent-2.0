import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  token: string | null
  isLoggedIn: boolean
}

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isLoggedIn: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<string>) {
      state.token = action.payload
      state.isLoggedIn = true
      localStorage.setItem('token', action.payload)
    },
    logout(state) {
      state.token = null
      state.isLoggedIn = false
      localStorage.removeItem('token')
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer

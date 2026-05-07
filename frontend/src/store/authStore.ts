import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('todolist_token'),
  isAuthenticated: !!localStorage.getItem('todolist_token'),
  login: (user, token) => {
    localStorage.setItem('todolist_token', token)
    set({ user, token, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('todolist_token')
    set({ user: null, token: null, isAuthenticated: false })
  },
  setUser: (user) => set({ user })
}))

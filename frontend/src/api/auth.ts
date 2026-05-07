import api from '../lib/api'
import type { User } from '../types'

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post<{ user: User; token: string }>('/auth/login', { email, password })
    return data
  },
  register: async (username: string, email: string, password: string) => {
    const { data } = await api.post<{ user: User; token: string }>('/auth/register', { username, email, password })
    return data
  },
  logout: async () => { await api.post('/auth/logout') },
  getMe: async () => {
    const { data } = await api.get<{ user: User }>('/auth/me')
    return data
  }
}

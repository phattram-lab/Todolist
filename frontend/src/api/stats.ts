import api from '../lib/api'
import type { Stats } from '../types'

export const statsApi = {
  get: async () => {
    const { data } = await api.get<Stats>('/stats')
    return data
  }
}

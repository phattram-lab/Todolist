import api from '../lib/api'
import type { Tag } from '../types'

export const tagsApi = {
  getAll: async () => {
    const { data } = await api.get<{ tags: Tag[] }>('/tags')
    return data
  },
  create: async (payload: { name: string; color: string }) => {
    const { data } = await api.post<{ tag: Tag }>('/tags', payload)
    return data
  },
  delete: async (id: string) => { await api.delete(`/tags/${id}`) }
}

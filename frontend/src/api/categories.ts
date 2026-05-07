import api from '../lib/api'
import type { Category } from '../types'

export const categoriesApi = {
  getAll: async () => {
    const { data } = await api.get<{ categories: Category[] }>('/categories')
    return data
  },
  create: async (payload: { name: string; color: string; icon?: string }) => {
    const { data } = await api.post<{ category: Category }>('/categories', payload)
    return data
  },
  update: async (id: string, payload: Partial<Category>) => {
    const { data } = await api.patch<{ category: Category }>(`/categories/${id}`, payload)
    return data
  },
  delete: async (id: string) => { await api.delete(`/categories/${id}`) }
}

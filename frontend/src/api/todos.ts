import api from '../lib/api'
import type { Todo, TodoFilters, Pagination } from '../types'

export const todosApi = {
  getAll: async (filters: TodoFilters = {}) => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined))
    const { data } = await api.get<{ todos: Todo[]; pagination: Pagination }>('/todos', { params })
    return data
  },
  getOne: async (id: string) => {
    const { data } = await api.get<{ todo: Todo }>(`/todos/${id}`)
    return data
  },
  create: async (payload: Partial<Todo> & { tagIds?: string[]; parentId?: string }) => {
    const { data } = await api.post<{ todo: Todo }>('/todos', payload)
    return data
  },
  update: async (id: string, payload: Partial<Todo> & { tagIds?: string[] }) => {
    const { data } = await api.patch<{ todo: Todo }>(`/todos/${id}`, payload)
    return data
  },
  delete: async (id: string) => { await api.delete(`/todos/${id}`) },
  bulk: async (ids: string[], action: 'complete' | 'delete' | 'archive') => {
    const { data } = await api.post<{ affected: number }>('/todos/bulk', { ids, action })
    return data
  },
  reorder: async (items: { id: string; order: number }[]) => { await api.patch('/todos/reorder', { items }) }
}

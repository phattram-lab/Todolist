import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { todosApi } from '../api/todos'
import type { TodoFilters } from '../types'
import toast from 'react-hot-toast'

export function useTodos(filters: TodoFilters = {}) {
  return useQuery({
    queryKey: ['todos', filters],
    queryFn: () => todosApi.getAll(filters)
  })
}

export function useTodo(id: string | null) {
  return useQuery({
    queryKey: ['todo', id],
    queryFn: () => todosApi.getOne(id!),
    enabled: !!id
  })
}

export function useCreateTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: todosApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      toast.success('Todo created')
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed to create todo')
  })
}

export function useUpdateTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [k: string]: any }) => todosApi.update(id, data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['todos'] })
      qc.invalidateQueries({ queryKey: ['todo', data.todo.id] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed to update todo')
  })
}

export function useDeleteTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: todosApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      toast.success('Todo deleted')
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed to delete todo')
  })
}

export function useBulkTodos() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ids, action }: { ids: string[]; action: 'complete' | 'delete' | 'archive' }) =>
      todosApi.bulk(ids, action),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['todos'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      toast.success(`${data.affected} todos updated`)
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Bulk action failed')
  })
}

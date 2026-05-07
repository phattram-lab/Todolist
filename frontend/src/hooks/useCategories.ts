import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '../api/categories'
import toast from 'react-hot-toast'

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Category created') },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed')
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['todos'] })
      toast.success('Category deleted')
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed')
  })
}

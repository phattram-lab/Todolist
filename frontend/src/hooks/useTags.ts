import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tagsApi } from '../api/tags'
import toast from 'react-hot-toast'

export function useTags() {
  return useQuery({ queryKey: ['tags'], queryFn: tagsApi.getAll })
}

export function useCreateTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tagsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tags'] }); toast.success('Tag created') },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed')
  })
}

export function useDeleteTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tagsApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tags'] }); qc.invalidateQueries({ queryKey: ['todos'] }) },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed')
  })
}

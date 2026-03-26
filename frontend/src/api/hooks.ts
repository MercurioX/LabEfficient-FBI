import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from './client'
import type { ImportBatch, Lab } from '../types'

export const useLabs = (status?: string) =>
  useQuery<Lab[]>({
    queryKey: ['labs', status],
    queryFn: () => api.get('/api/labs', { params: { status } }).then(r => r.data),
  })

export const useLab = (id: number) =>
  useQuery<Lab>({
    queryKey: ['lab', id],
    queryFn: () => api.get(`/api/labs/${id}`).then(r => r.data),
  })

export const useBatch = (id: number | null) =>
  useQuery<ImportBatch>({
    queryKey: ['batch', id],
    enabled: !!id,
    queryFn: () => api.get(`/api/import/batches/${id}`).then(r => r.data),
    refetchInterval: (query) =>
      query.state.data?.status === 'processing' ? 2000 : false,
  })

export const useApproveLab = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ labId, approvedBy }: { labId: number; approvedBy: string }) =>
      api.post(`/api/labs/${labId}/approve`, { approved_by: approvedBy }).then(r => r.data),
    onSuccess: (_data, { labId }) => {
      qc.invalidateQueries({ queryKey: ['lab', labId] })
      qc.invalidateQueries({ queryKey: ['labs'] })
    },
  })
}

export const useRejectLab = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (labId: number) =>
      api.post(`/api/labs/${labId}/reject`).then(r => r.data),
    onSuccess: (_data, labId) => {
      qc.invalidateQueries({ queryKey: ['lab', labId] })
      qc.invalidateQueries({ queryKey: ['labs'] })
    },
  })
}

export const usePatchResult = (labId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ resultId, patch }: { resultId: number; patch: Record<string, unknown> }) =>
      api.patch(`/api/labs/${labId}/results/${resultId}`, patch).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lab', labId] })
    },
  })
}

import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from './client'
import type { ImportBatch, Lab, PatientLabSummary, PatientSummary } from '../types'

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

export const usePatientSearch = (q: string) =>
  useQuery<PatientSummary[]>({
    queryKey: ['patients', q],
    enabled: q.trim().length >= 2,
    queryFn: () => api.get('/api/patients/search', { params: { q } }).then(r => r.data),
  })

export const usePatientLabs = (patientId: number | null) =>
  useQuery<PatientLabSummary[]>({
    queryKey: ['patientLabs', patientId],
    enabled: patientId !== null,
    queryFn: () => api.get(`/api/patients/${patientId}/labs`).then(r => r.data),
  })

export function usePatientTimeline(patientId: number | null) {
  const { data: labSummaries } = usePatientLabs(patientId)

  const labQueries = useQueries({
    queries: (labSummaries ?? []).map((lab) => ({
      queryKey: ['lab', lab.id] as const,
      queryFn: () => api.get<Lab>(`/api/labs/${lab.id}`).then(r => r.data),
      enabled: patientId !== null,
    })),
  })

  const loadedLabs = labQueries
    .filter((q) => q.isSuccess && q.data != null)
    .map((q) => q.data as Lab)
    .sort((a, b) => (b.sample_date ?? '').localeCompare(a.sample_date ?? ''))

  return { labs: loadedLabs, isLoading: labQueries.some((q) => q.isLoading) }
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

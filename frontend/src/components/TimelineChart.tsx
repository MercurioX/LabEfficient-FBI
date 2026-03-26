import { useQuery } from '@tanstack/react-query'
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { api } from '../api/client'

export function TimelineChart({ labId, paramName }: { labId: number; paramName: string }) {
  const { data: timeline } = useQuery({
    queryKey: ['timeline', labId],
    queryFn: () => api.get(`/api/labs/${labId}/timeline`).then(r => r.data),
  })

  const series = timeline?.filter((d: any) => d.canonical_name === paramName) ?? []
  const refMin = series[0]?.ref_min
  const refMax = series[0]?.ref_max

  if (series.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={series}>
        <XAxis dataKey="sample_date" />
        <YAxis />
        <Tooltip />
        {refMin && (
          <ReferenceLine y={refMin} stroke="#1976d2" strokeDasharray="4 4" label="Min" />
        )}
        {refMax && (
          <ReferenceLine y={refMax} stroke="#d32f2f" strokeDasharray="4 4" label="Max" />
        )}
        <Line type="monotone" dataKey="value_numeric" stroke="#1976d2" dot />
      </LineChart>
    </ResponsiveContainer>
  )
}

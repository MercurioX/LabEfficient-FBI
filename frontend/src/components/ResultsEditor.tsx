import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'

import { api } from '../api/client'
import type { Lab, LabResult, Patient } from '../types'

function PatientHeader({ patient }: { patient: Patient | null }) {
  if (!patient) return null
  return (
    <Box mb={1}>
      <Typography variant="h6">
        {patient.last_name}, {patient.first_name}
      </Typography>
      {patient.birth_date && (
        <Typography variant="body2" color="text.secondary">
          geb. {patient.birth_date}
        </Typography>
      )}
    </Box>
  )
}

function EditableCell({
  value,
  onChange,
}: {
  value: string | number | null
  onChange: (v: string) => void
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange(e.target.value), 600)
  }

  return (
    <TableCell>
      <TextField
        defaultValue={value ?? ''}
        size="small"
        variant="standard"
        onChange={handleChange}
        sx={{ width: 90 }}
      />
    </TableCell>
  )
}

function DeviationChip({ result }: { result: LabResult }) {
  if (!result.ref_min && !result.ref_max) {
    return <Chip label="Ref. unbekannt" color="default" size="small" />
  }
  if (result.is_high) return <Chip label="↑ erhöht" color="error" size="small" />
  if (result.is_low) return <Chip label="↓ erniedrigt" color="info" size="small" />
  return <Chip label="normal" color="success" size="small" />
}

export function ResultsEditor({ lab }: { lab: Lab }) {
  const queryClient = useQueryClient()

  const patchMutation = useMutation({
    mutationFn: ({ resultId, patch }: { resultId: number; patch: Partial<LabResult> }) =>
      api.patch(`/api/labs/${lab.id}/results/${resultId}`, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lab', lab.id] }),
  })

  return (
    <>
      <PatientHeader patient={lab.patient} />
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Bezeichnung</TableCell>
              <TableCell>Wert</TableCell>
              <TableCell>Einheit</TableCell>
              <TableCell>Ref.</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lab.results
              .slice()
              .sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999))
              .map((result) => (
                <TableRow
                  key={result.id}
                  sx={{ bgcolor: result.confidence === 'low' ? 'warning.light' : 'inherit' }}
                >
                  <TableCell>{result.canonical_name ?? result.original_name}</TableCell>
                  <EditableCell
                    value={result.value_numeric}
                    onChange={(v) =>
                      patchMutation.mutate({
                        resultId: result.id,
                        patch: { value_numeric: v === '' ? null : Number(v) },
                      })
                    }
                  />
                  <EditableCell
                    value={result.unit}
                    onChange={(v) =>
                      patchMutation.mutate({ resultId: result.id, patch: { unit: v } })
                    }
                  />
                  <TableCell>
                    {result.ref_text ?? `${result.ref_min ?? '?'}–${result.ref_max ?? '?'}`}
                  </TableCell>
                  <TableCell>
                    <DeviationChip result={result} />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

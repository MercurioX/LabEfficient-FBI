import {
  Alert,
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
  Tooltip,
  Typography,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'

import { api } from '../api/client'
import type { Lab, LabResult, Patient } from '../types'

function PatientHeader({ patient }: { patient: Patient | null }) {
  if (!patient) return null
  return (
    <Box
      sx={{
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        px: 3,
        py: 2,
        borderRadius: 1,
        mb: 2,
      }}
    >
      <Typography variant="h6">
        {patient.last_name}, {patient.first_name}
      </Typography>
      {patient.birth_date && (
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
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

function ConfidenceChip({ confidence }: { confidence: 'high' | 'low' }) {
  if (confidence === 'low') {
    return (
      <Tooltip title="Die KI war bei diesem Wert unsicher. Bitte manuell prüfen.">
        <Chip label="unsicher" color="warning" size="small" variant="outlined" />
      </Tooltip>
    )
  }
  return (
    <Tooltip title="Die KI hat diesen Wert mit hoher Sicherheit erkannt.">
      <Chip label="sicher" color="success" size="small" variant="outlined" />
    </Tooltip>
  )
}

export function ResultsEditor({ lab }: { lab: Lab }) {
  const queryClient = useQueryClient()

  const patchMutation = useMutation({
    mutationFn: ({ resultId, patch }: { resultId: number; patch: Partial<LabResult> }) =>
      api.patch(`/api/labs/${lab.id}/results/${resultId}`, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lab', lab.id] }),
  })

  const lowConfidenceCount = lab.results.filter(r => r.confidence === 'low').length

  return (
    <Box p={2}>
      <PatientHeader patient={lab.patient} />

      {lowConfidenceCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>{lowConfidenceCount} Wert{lowConfidenceCount > 1 ? 'e' : ''}</strong> wurden von
          der KI mit geringer Sicherheit erkannt und sind gelb markiert. Bitte vor der Freigabe
          manuell prüfen.
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Bezeichnung</TableCell>
              <TableCell>Wert</TableCell>
              <TableCell>Einheit</TableCell>
              <TableCell>Ref.</TableCell>
              <TableCell>Abweichung</TableCell>
              <TableCell>KI-Sicherheit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lab.results
              .slice()
              .sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999))
              .map((result) => (
                <TableRow
                  key={result.id}
                  sx={{
                    bgcolor: result.confidence === 'low'
                      ? 'warning.light'
                      : 'inherit',
                  }}
                >
                  <TableCell sx={{ fontWeight: result.confidence === 'low' ? 600 : 400 }}>
                    {result.canonical_name ?? result.original_name}
                  </TableCell>
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
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {result.ref_text ?? `${result.ref_min ?? '?'}–${result.ref_max ?? '?'}`}
                  </TableCell>
                  <TableCell>
                    <DeviationChip result={result} />
                  </TableCell>
                  <TableCell>
                    <ConfidenceChip confidence={result.confidence} />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

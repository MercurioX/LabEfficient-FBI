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
  Typography,
} from '@mui/material'
import { useParams } from 'react-router-dom'

import { useLab } from '../api/hooks'
import type { LabResult } from '../types'

const statusColor = (r: LabResult): 'default' | 'error' | 'info' | 'success' => {
  if (!r.ref_min && !r.ref_max) return 'default'
  if (r.is_high) return 'error'
  if (r.is_low) return 'info'
  return 'success'
}

const statusLabel = (r: LabResult): string => {
  if (!r.ref_min && !r.ref_max) return 'Ref. unbekannt'
  if (r.is_high) return '↑ erhöht'
  if (r.is_low) return '↓ erniedrigt'
  return 'normal'
}

export function BefundDetailPage() {
  const { labId } = useParams()
  const { data: lab } = useLab(Number(labId))

  if (!lab) return null

  const byCategory = lab.results.reduce<Record<string, LabResult[]>>((acc, r) => {
    const cat = r.category ?? 'Sonstige'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(r)
    return acc
  }, {})

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        {lab.patient
          ? `${lab.patient.last_name}, ${lab.patient.first_name}`
          : lab.upload_filename}
      </Typography>
      {lab.patient?.birth_date && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          geb. {lab.patient.birth_date}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Entnahmedatum: {lab.sample_date ?? '–'} · Labor: {lab.external_lab_name ?? '–'}
      </Typography>

      {Object.entries(byCategory).map(([category, results]) => (
        <Box key={category} mt={3}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {category}
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Standardname</TableCell>
                  <TableCell>Originalname</TableCell>
                  <TableCell>Wert</TableCell>
                  <TableCell>Einheit</TableCell>
                  <TableCell>Referenz</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results
                  .slice()
                  .sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999))
                  .map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.canonical_name ?? '–'}</TableCell>
                      <TableCell>{r.original_name}</TableCell>
                      <TableCell>{r.value_numeric ?? '–'}</TableCell>
                      <TableCell>{r.unit ?? '–'}</TableCell>
                      <TableCell>
                        {r.ref_text ?? (r.ref_min != null || r.ref_max != null
                          ? `${r.ref_min ?? '?'}–${r.ref_max ?? '?'}`
                          : '–')}
                      </TableCell>
                      <TableCell>
                        <Chip label={statusLabel(r)} color={statusColor(r)} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Box>
  )
}

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import TimelineIcon from '@mui/icons-material/Timeline'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useLab } from '../api/hooks'
import { TimelineChart } from '../components/TimelineChart'
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
  const [selectedParam, setSelectedParam] = useState<string | null>(null)
  const navigate = useNavigate()

  if (!lab) return null

  const byCategory = lab.results.reduce<Record<string, LabResult[]>>((acc, r) => {
    const cat = r.category ?? 'Sonstige'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(r)
    return acc
  }, {})

  const handleParamClick = (name: string | null) => {
    setSelectedParam(prev => (prev === name ? null : name))
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', py: 4 }}>
      <Container maxWidth="xl">

        {/* Back + Header */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2, color: 'text.secondary' }}
        >
          Zurück
        </Button>

        {/* Patient info card */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              {lab.patient
                ? `${lab.patient.last_name}, ${lab.patient.first_name}`
                : lab.upload_filename}
            </Typography>
            <Box display="flex" gap={3} flexWrap="wrap" alignItems="center">
              {lab.patient?.birth_date && (
                <Typography variant="body2" color="text.secondary">
                  Geburtsdatum: <strong>{lab.patient.birth_date}</strong>
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Entnahmedatum: <strong>{lab.sample_date ?? '–'}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Labor: <strong>{lab.external_lab_name ?? '–'}</strong>
              </Typography>
              {lab.patient && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<TimelineIcon />}
                  onClick={() => navigate(`/patienten/${lab.patient!.id}/verlauf`)}
                  sx={{ ml: 'auto' }}
                >
                  Verlaufsansicht
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Timeline */}
        {selectedParam && (
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Verlauf: {selectedParam}
              </Typography>
              <TimelineChart labId={lab.id} paramName={selectedParam} />
            </CardContent>
          </Card>
        )}

        {/* Parameter tables by category */}
        {Object.entries(byCategory).map(([category, results], i) => (
          <Box key={category} mt={i === 0 ? 0 : 3}>
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700 }}>
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
                    .map((r) => {
                      const paramName = r.canonical_name ?? r.original_name
                      return (
                        <TableRow
                          key={r.id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleParamClick(paramName)}
                          selected={selectedParam === paramName}
                        >
                          <TableCell>{r.canonical_name ?? '–'}</TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>{r.original_name}</TableCell>
                          <TableCell><strong>{r.value_numeric ?? '–'}</strong></TableCell>
                          <TableCell>{r.unit ?? '–'}</TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>
                            {r.ref_text ?? (r.ref_min != null || r.ref_max != null
                              ? `${r.ref_min ?? '?'}–${r.ref_max ?? '?'}`
                              : '–')}
                          </TableCell>
                          <TableCell>
                            <Chip label={statusLabel(r)} color={statusColor(r)} size="small" />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
      </Container>
    </Box>
  )
}

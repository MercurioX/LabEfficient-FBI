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
import { PARAMETER_TEMPLATE, TEMPLATE_PARAM_SET } from '../constants/parameterTemplate'
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

  // Lookup: canonical_name (oder original_name) → LabResult
  const resultByParam = new Map<string, LabResult>()
  for (const r of lab.results) {
    const key = r.canonical_name ?? r.original_name
    resultByParam.set(key, r)
  }

  // Ergebnisse, die nicht im Template sind → "Sonstige"
  const extraResults = lab.results.filter(r => {
    const key = r.canonical_name ?? r.original_name
    return !TEMPLATE_PARAM_SET.has(key)
  })

  const handleParamClick = (name: string | null) => {
    setSelectedParam(prev => (prev === name ? null : name))
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', py: 4 }}>
      <Container maxWidth="xl">

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

        {/* Template-gesteuerte Kategorietabellen */}
        {PARAMETER_TEMPLATE.map((tmplCategory, i) => (
          <Box key={tmplCategory.category} mt={i === 0 ? 0 : 3}>
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700 }}>
              {tmplCategory.category}
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Parameter</TableCell>
                    <TableCell>Originalname</TableCell>
                    <TableCell>Wert</TableCell>
                    <TableCell>Einheit</TableCell>
                    <TableCell>Referenz</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tmplCategory.params.map((paramName) => {
                    const r = resultByParam.get(paramName)
                    if (r) {
                      return (
                        <TableRow
                          key={paramName}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleParamClick(paramName)}
                          selected={selectedParam === paramName}
                        >
                          <TableCell>{r.canonical_name ?? paramName}</TableCell>
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
                    }
                    // Parameter nicht im Befund
                    return (
                      <TableRow key={paramName} sx={{ opacity: 0.45 }}>
                        <TableCell>{paramName}</TableCell>
                        <TableCell />
                        <TableCell>–</TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell>
                          <Chip label="nicht gemessen" color="default" size="small" variant="outlined" />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}

        {/* Sonstige – Parameter außerhalb des Templates */}
        {extraResults.length > 0 && (
          <Box mt={3}>
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700 }}>
              Sonstige
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Parameter</TableCell>
                    <TableCell>Originalname</TableCell>
                    <TableCell>Wert</TableCell>
                    <TableCell>Einheit</TableCell>
                    <TableCell>Referenz</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {extraResults
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
        )}

      </Container>
    </Box>
  )
}

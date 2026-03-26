import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  Box,
  Button,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'

import { usePatientTimeline } from '../api/hooks'
import { PageContainer } from '../components/PageContainer'
import type { Lab, LabResult } from '../types'

function buildMatrix(labs: Lab[]): {
  params: string[]
  byParam: Record<string, Record<number, LabResult>>
} {
  const paramSet = new Set<string>()
  const byParam: Record<string, Record<number, LabResult>> = {}

  for (const lab of labs) {
    for (const r of lab.results) {
      const key = r.canonical_name ?? r.original_name
      paramSet.add(key)
      if (!byParam[key]) byParam[key] = {}
      byParam[key][lab.id] = r
    }
  }

  return { params: Array.from(paramSet).sort(), byParam }
}

function ValueCell({ result }: { result: LabResult | undefined }) {
  const isAbnormal = result && (result.is_high || result.is_low)
  const refLabel = result?.ref_text
    ?? (result?.ref_min != null || result?.ref_max != null
      ? `${result.ref_min ?? '?'}–${result.ref_max ?? '?'}`
      : null)

  return (
    <TableCell
      align="center"
      sx={{
        bgcolor: isAbnormal
          ? result!.is_high ? 'error.light' : 'info.light'
          : 'inherit',
      }}
    >
      {!result || result.value_numeric == null ? (
        <Typography variant="body2" color="text.disabled">–</Typography>
      ) : (
        <Box>
          <Typography variant="body2" fontWeight={isAbnormal ? 700 : 400}>
            {result.value_numeric} {result.unit ?? ''}
          </Typography>
          {refLabel && (
            <Typography variant="caption" display="block" color="text.secondary">
              Ref: {refLabel}
            </Typography>
          )}
        </Box>
      )}
    </TableCell>
  )
}

export function PatientTimelinePage() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const { labs, isLoading } = usePatientTimeline(patientId ? Number(patientId) : null)

  const { params, byParam } = buildMatrix(labs)

  const patientName = labs[0]?.patient
    ? `${labs[0].patient.last_name}, ${labs[0].patient.first_name}`
    : null

  return (
    <PageContainer title={patientName ? `Verlauf: ${patientName}` : 'Verlaufsansicht'}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Zurück
      </Button>

      {isLoading && <Skeleton variant="rectangular" height={300} />}

      {!isLoading && labs.length === 0 && (
        <Typography color="text.secondary">Keine freigegebenen Befunde gefunden.</Typography>
      )}

      {!isLoading && labs.length > 0 && (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 160, fontWeight: 700 }}>Parameter</TableCell>
                {labs.map((lab) => (
                  <TableCell key={lab.id} align="center" sx={{ minWidth: 140 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {lab.sample_date ?? '–'}
                    </Typography>
                    {lab.external_lab_name && (
                      <Typography variant="caption" color="text.secondary">
                        {lab.external_lab_name}
                      </Typography>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {params.map((param) => (
                <TableRow key={param} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{param}</TableCell>
                  {labs.map((lab) => (
                    <ValueCell key={lab.id} result={byParam[param]?.[lab.id]} />
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </PageContainer>
  )
}

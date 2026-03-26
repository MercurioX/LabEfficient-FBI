import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

import { useLabs } from '../api/hooks'
import { PageContainer } from '../components/PageContainer'
import type { Lab } from '../types'

export function ReviewQueuePage() {
  const { data: labs = [], isLoading, isError } = useLabs('pending_review')
  const navigate = useNavigate()

  return (
    <PageContainer title={`Zur Prüfung${!isLoading ? ` (${labs.length})` : ''}`}>
      {isLoading && <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>}
      {isError && <Alert severity="error">Fehler beim Laden der Review-Queue.</Alert>}
      {!isLoading && !isError && labs.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography color="text.secondary">Keine Befunde zur Prüfung.</Typography>
        </Box>
      )}
      {!isLoading && labs.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Datei</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Entnahmedatum</TableCell>
                <TableCell>Labor</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {labs.map((lab: Lab) => (
                <TableRow key={lab.id} hover sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/review/${lab.id}`)}>
                  <TableCell>{lab.upload_filename}</TableCell>
                  <TableCell>
                    {lab.patient
                      ? `${lab.patient.last_name}, ${lab.patient.first_name}`
                      : '–'}
                  </TableCell>
                  <TableCell>{lab.sample_date ?? '–'}</TableCell>
                  <TableCell>{lab.external_lab_name ?? '–'}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined">Prüfen</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </PageContainer>
  )
}

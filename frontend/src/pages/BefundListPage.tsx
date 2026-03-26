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

export function BefundListPage() {
  const { data: labs = [], isLoading, isError } = useLabs('approved')
  const navigate = useNavigate()

  return (
    <PageContainer title={`Freigegebene Befunde${!isLoading ? ` (${labs.length})` : ''}`}>
      {isLoading && <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>}
      {isError && <Alert severity="error">Fehler beim Laden der Befunde.</Alert>}
      {!isLoading && !isError && labs.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography color="text.secondary">Keine freigegebenen Befunde vorhanden.</Typography>
        </Box>
      )}
      {!isLoading && labs.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Entnahmedatum</TableCell>
                <TableCell>Labor</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {labs.map((lab: Lab) => (
                <TableRow key={lab.id} hover sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/befunde/${lab.id}`)}>
                  <TableCell>
                    {lab.patient ? (
                      <>
                        <Typography variant="body2">
                          {lab.patient.last_name}, {lab.patient.first_name}
                        </Typography>
                        {lab.patient.birth_date && (
                          <Typography variant="caption" color="text.secondary">
                            geb. {lab.patient.birth_date}
                          </Typography>
                        )}
                      </>
                    ) : '–'}
                  </TableCell>
                  <TableCell>{lab.sample_date ?? '–'}</TableCell>
                  <TableCell>{lab.external_lab_name ?? '–'}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined">Öffnen</Button>
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

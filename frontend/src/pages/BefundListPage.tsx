import {
  Box,
  Button,
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
import type { Lab } from '../types'

export function BefundListPage() {
  const { data: labs = [] } = useLabs('approved')
  const navigate = useNavigate()

  return (
    <Box p={3}>
      <Typography variant="h5">Freigegebene Befunde ({labs.length})</Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Entnahmedatum</TableCell>
              <TableCell>Labor</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {labs.map((lab: Lab) => (
              <TableRow key={lab.id}>
                <TableCell>
                  {lab.patient
                    ? `${lab.patient.last_name}, ${lab.patient.first_name}`
                    : '–'}
                </TableCell>
                <TableCell>{lab.sample_date ?? '–'}</TableCell>
                <TableCell>{lab.external_lab_name ?? '–'}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => navigate(`/befunde/${lab.id}`)}>
                    Öffnen
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

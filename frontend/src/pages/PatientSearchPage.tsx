import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
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
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { usePatientLabs, usePatientSearch } from '../api/hooks'

export function PatientSearchPage() {
  const [q, setQ] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const navigate = useNavigate()

  const { data: patients = [], isFetching } = usePatientSearch(q)
  const { data: labs = [] } = usePatientLabs(selectedId)

  return (
    <Box p={3}>
      <Typography variant="h5">Patientensuche</Typography>

      <TextField
        label="Name suchen"
        value={q}
        onChange={e => { setQ(e.target.value); setSelectedId(null) }}
        fullWidth
        sx={{ my: 2 }}
        InputProps={{
          endAdornment: isFetching
            ? <InputAdornment position="end"><CircularProgress size={20} /></InputAdornment>
            : null,
        }}
      />

      {patients.length > 0 && (
        <List dense>
          {patients.map(p => (
            <ListItemButton
              key={p.id}
              selected={selectedId === p.id}
              onClick={() => setSelectedId(p.id)}
            >
              <ListItemText
                primary={`${p.last_name}, ${p.first_name}`}
                secondary={p.birth_date ? `geb. ${p.birth_date}` : undefined}
              />
            </ListItemButton>
          ))}
        </List>
      )}
      {q.trim().length >= 2 && !isFetching && patients.length === 0 && (
        <Typography color="text.secondary">Keine Patienten gefunden.</Typography>
      )}

      {selectedId && (
        <Box mt={3}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Freigegebene Befunde
          </Typography>
          {labs.length === 0 ? (
            <Typography color="text.secondary">Keine freigegebenen Befunde.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Datei</TableCell>
                    <TableCell>Entnahmedatum</TableCell>
                    <TableCell>Labor</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {labs.map(lab => (
                    <TableRow key={lab.id}>
                      <TableCell>{lab.upload_filename}</TableCell>
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
          )}
        </Box>
      )}
    </Box>
  )
}

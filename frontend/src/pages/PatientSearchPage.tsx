import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
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
import { PageContainer } from '../components/PageContainer'

export function PatientSearchPage() {
  const [q, setQ] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedName, setSelectedName] = useState<string>('')
  const navigate = useNavigate()

  const { data: patients = [], isFetching } = usePatientSearch(q)
  const { data: labs = [] } = usePatientLabs(selectedId)

  return (
    <PageContainer title="Patientensuche">
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '320px 1fr' }} gap={3} alignItems="start">

        {/* Search panel */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <TextField
              label="Name suchen"
              value={q}
              onChange={e => { setQ(e.target.value); setSelectedId(null); setSelectedName('') }}
              fullWidth
              placeholder="Mind. 2 Zeichen..."
              InputProps={{
                endAdornment: isFetching
                  ? <InputAdornment position="end"><CircularProgress size={18} /></InputAdornment>
                  : null,
              }}
            />

            {patients.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <List dense disablePadding>
                  {patients.map(p => (
                    <ListItemButton
                      key={p.id}
                      selected={selectedId === p.id}
                      onClick={() => {
                        setSelectedId(p.id)
                        setSelectedName(`${p.last_name}, ${p.first_name}`)
                      }}
                      sx={{ borderRadius: 1 }}
                    >
                      <ListItemText
                        primary={`${p.last_name}, ${p.first_name}`}
                        secondary={p.birth_date ? `geb. ${p.birth_date}` : undefined}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </>
            )}
            {q.trim().length >= 2 && !isFetching && patients.length === 0 && (
              <Typography color="text.secondary" variant="body2" sx={{ mt: 2 }}>
                Keine Patienten gefunden.
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Results panel */}
        <Box>
          {selectedId ? (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Freigegebene Befunde für <strong>{selectedName}</strong>
              </Typography>
              {labs.length === 0 ? (
                <Card>
                  <CardContent sx={{ py: 6, textAlign: 'center' }}>
                    <Typography color="text.secondary">Keine freigegebenen Befunde.</Typography>
                  </CardContent>
                </Card>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Datei</TableCell>
                        <TableCell>Entnahmedatum</TableCell>
                        <TableCell>Labor</TableCell>
                        <TableCell align="right" />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {labs.map(lab => (
                        <TableRow key={lab.id} hover sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/befunde/${lab.id}`)}>
                          <TableCell>{lab.upload_filename}</TableCell>
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
            </>
          ) : (
            <Card>
              <CardContent sx={{ py: 8, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  Patienten suchen und auswählen, um Befunde anzuzeigen.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </PageContainer>
  )
}

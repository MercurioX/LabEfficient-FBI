import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useBatch } from '../api/hooks'

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'warning' | 'error' | 'success'> = {
  queued: 'default',
  processing: 'primary',
  pending_review: 'warning',
  approved: 'success',
  rejected: 'default',
  failed: 'error',
}

function StatusChip({ status }: { status: string }) {
  return <Chip label={status} color={STATUS_COLORS[status] ?? 'default'} size="small" />
}

export function BatchStatus({ batchId }: { batchId: number }) {
  const { data: batch } = useBatch(batchId)
  const navigate = useNavigate()

  useEffect(() => {
    if (batch?.status === 'done' || batch?.status === 'partial_failure') {
      navigate('/review')
    }
  }, [batch?.status, navigate])

  if (!batch) return <CircularProgress sx={{ mt: 2 }} />

  return (
    <Box mt={2}>
      {batch.status === 'partial_failure' && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Import abgeschlossen mit {batch.failed} Fehlern. Fehlerhafte Befunde sind unten markiert.
        </Alert>
      )}
      <LinearProgress
        variant="determinate"
        value={batch.total > 0 ? (batch.processed / batch.total) * 100 : 0}
        sx={{ mb: 1 }}
      />
      <Typography>
        {batch.processed} / {batch.total} verarbeitet
        {batch.failed > 0 && ` | ${batch.failed} Fehler`}
      </Typography>
      {batch.labs && (
        <List dense>
          {batch.labs.map((lab) => (
            <ListItem key={lab.id}>
              <ListItemText primary={lab.filename} />
              <StatusChip status={lab.status} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  )
}

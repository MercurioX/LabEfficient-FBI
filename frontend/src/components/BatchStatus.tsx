import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
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

  if (!batch) return null

  const progress = batch.total > 0 ? (batch.processed / batch.total) * 100 : 0

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Importstatus</Typography>

        {batch.status === 'partial_failure' && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Import abgeschlossen mit {batch.failed} Fehlern.
          </Alert>
        )}

        <Box mb={1}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {batch.processed} / {batch.total} verarbeitet
          {batch.failed > 0 && ` · ${batch.failed} Fehler`}
        </Typography>

        {batch.labs && (
          <List dense disablePadding>
            {batch.labs.map((lab) => (
              <ListItem
                key={lab.id}
                disableGutters
                sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 0.75 }}
              >
                <ListItemText
                  primary={lab.filename}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
                <StatusChip status={lab.status} />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  )
}

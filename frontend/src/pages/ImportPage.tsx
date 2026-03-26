import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { api } from '../api/client'
import { BatchStatus } from '../components/BatchStatus'
import { PageContainer } from '../components/PageContainer'

export function ImportPage() {
  const [folder, setFolder] = useState('/app/data/inbox')
  const [batchId, setBatchId] = useState<number | null>(null)

  const startMutation = useMutation({
    mutationFn: () =>
      api.post('/api/import/start', { folder_path: folder }).then(r => r.data),
    onSuccess: (data) => setBatchId(data.batch_id),
  })

  return (
    <PageContainer title="Massenimport">
      <Box maxWidth={600}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Geben Sie den Ordnerpfad an, in dem die PDF-Laborbefunde liegen.
              Der Import startet alle Dateien automatisch.
            </Typography>
            <TextField
              label="Ordnerpfad"
              value={folder}
              onChange={e => setFolder(e.target.value)}
              fullWidth
              sx={{ mb: 3 }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
            >
              Import starten
            </Button>
          </CardContent>
        </Card>

        {batchId && (
          <Box mt={3}>
            <BatchStatus batchId={batchId} />
          </Box>
        )}
      </Box>
    </PageContainer>
  )
}

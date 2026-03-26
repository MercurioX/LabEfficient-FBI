import { Box, Button, TextField, Typography } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { api } from '../api/client'
import { BatchStatus } from '../components/BatchStatus'

export function ImportPage() {
  const [folder, setFolder] = useState('/app/data/inbox')
  const [batchId, setBatchId] = useState<number | null>(null)

  const startMutation = useMutation({
    mutationFn: () =>
      api.post('/api/import/start', { folder_path: folder }).then(r => r.data),
    onSuccess: (data) => setBatchId(data.batch_id),
  })

  return (
    <Box p={3}>
      <Typography variant="h5">Massenimport</Typography>
      <TextField
        label="Ordnerpfad"
        value={folder}
        onChange={e => setFolder(e.target.value)}
        fullWidth
        sx={{ my: 2 }}
      />
      <Button
        variant="contained"
        onClick={() => startMutation.mutate()}
        disabled={startMutation.isPending}
      >
        Import starten
      </Button>
      {batchId && <BatchStatus batchId={batchId} />}
    </Box>
  )
}

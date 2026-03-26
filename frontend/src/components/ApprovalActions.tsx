import { Button, Stack } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { api } from '../api/client'

export function ApprovalActions({ labId }: { labId: number }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const approve = useMutation({
    mutationFn: () => api.post(`/api/labs/${labId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] })
      navigate('/review')
    },
  })

  const reject = useMutation({
    mutationFn: () => api.post(`/api/labs/${labId}/reject`),
    onSuccess: () => navigate('/review'),
  })

  return (
    <Stack
      direction="row"
      spacing={2}
      mt={3}
      position="sticky"
      bottom={0}
      bgcolor="background.paper"
      p={2}
      borderTop="1px solid #e0e0e0"
    >
      <Button
        variant="contained"
        color="success"
        size="large"
        onClick={() => approve.mutate()}
        disabled={approve.isPending}
      >
        Freigeben
      </Button>
      <Button
        variant="outlined"
        color="error"
        size="large"
        onClick={() => reject.mutate()}
        disabled={reject.isPending}
      >
        Zurückweisen
      </Button>
    </Stack>
  )
}

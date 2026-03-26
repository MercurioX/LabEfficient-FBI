import { Box, Container, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface Props {
  title: string
  action?: ReactNode
  children: ReactNode
}

export function PageContainer({ title, action, children }: Props) {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', py: 4 }}>
      <Container maxWidth="xl">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
        >
          <Typography variant="h5">{title}</Typography>
          {action}
        </Box>
        {children}
      </Container>
    </Box>
  )
}

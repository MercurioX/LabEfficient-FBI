import { Box } from '@mui/material'
import { useParams } from 'react-router-dom'

import { useLab } from '../api/hooks'
import { PdfViewer } from '../components/PdfViewer'
import { ReviewPanel } from '../components/ReviewPanel'

export function SplitViewPage() {
  const { labId } = useParams()
  const { data: lab } = useLab(Number(labId))

  return (
    <Box display="grid" gridTemplateColumns="1fr 1fr" height="100vh" overflow="hidden">
      <Box borderRight="1px solid #e0e0e0" overflow="auto" bgcolor="#f5f5f5">
        <PdfViewer labId={Number(labId)} />
      </Box>
      <Box overflow="auto" p={2}>
        {lab && <ReviewPanel lab={lab} />}
      </Box>
    </Box>
  )
}

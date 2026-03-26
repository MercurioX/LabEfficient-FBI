import { Alert, Box } from '@mui/material'
import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export function PdfViewer({ labId }: { labId: number }) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="warning">PDF konnte nicht geladen werden.</Alert>
      </Box>
    )
  }

  return (
    <Document
      file={`http://localhost:8000/api/labs/${labId}/pdf`}
      onLoadError={() => setError(true)}
    >
      <Page pageNumber={1} width={600} />
    </Document>
  )
}

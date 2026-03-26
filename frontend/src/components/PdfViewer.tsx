import { Alert, Box } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export function PdfViewer({ labId }: { labId: number }) {
  const [error, setError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(600)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(entries => {
      setWidth(Math.floor(entries[0].contentRect.width))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Box ref={containerRef} width="100%" height="100%">
      {error ? (
        <Box p={2}>
          <Alert severity="warning">PDF konnte nicht geladen werden.</Alert>
        </Box>
      ) : (
        <Document
          file={`http://localhost:8000/api/labs/${labId}/pdf`}
          onLoadError={() => setError(true)}
        >
          <Page pageNumber={1} width={width || 600} />
        </Document>
      )}
    </Box>
  )
}

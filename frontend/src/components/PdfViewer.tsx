import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

export function PdfViewer({ labId }: { labId: number }) {
  return (
    <Document file={`http://localhost:8000/api/labs/${labId}/pdf`}>
      <Page pageNumber={1} width={600} />
    </Document>
  )
}

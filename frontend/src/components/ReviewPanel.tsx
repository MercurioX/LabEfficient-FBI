import type { Lab } from '../types'
import { ResultsEditor } from './ResultsEditor'

// ApprovalActions wird in S27 ergänzt
export function ReviewPanel({ lab }: { lab: Lab }) {
  return <ResultsEditor lab={lab} />
}

import type { Lab } from '../types'
import { ApprovalActions } from './ApprovalActions'
import { ResultsEditor } from './ResultsEditor'

export function ReviewPanel({ lab }: { lab: Lab }) {
  return (
    <>
      <ResultsEditor lab={lab} />
      <ApprovalActions labId={lab.id} />
    </>
  )
}

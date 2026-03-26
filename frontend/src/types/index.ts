export interface LabResult {
  id: number
  original_name: string
  canonical_name: string | null
  value_numeric: number | null
  unit: string | null
  ref_min: number | null
  ref_max: number | null
  ref_text: string | null
  is_high: boolean
  is_low: boolean
  is_out_of_range: boolean
  confidence: 'high' | 'low'
  is_corrected: boolean
  corrected_by: string | null
  corrected_at: string | null
  category: string | null
  display_order: number | null
}

export interface Patient {
  id: number
  first_name: string
  last_name: string
  birth_date: string | null
}

export interface Lab {
  id: number
  upload_filename: string
  status: string
  sample_date: string | null
  external_lab_name: string | null
  error_message: string | null
  approved_by: string | null
  approved_at: string | null
  patient: Patient | null
  results: LabResult[]
}

export interface ImportBatch {
  batch_id: number
  status: string
  total: number
  processed: number
  failed: number
  started_at: string | null
  finished_at: string | null
  labs?: Array<{ id: number; filename: string; status: string }>
}

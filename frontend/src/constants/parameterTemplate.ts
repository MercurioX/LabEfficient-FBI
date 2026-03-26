export interface TemplateCategory {
  category: string
  params: string[]
}

export const PARAMETER_TEMPLATE: TemplateCategory[] = [
  {
    category: 'Klinische Chemie',
    params: [
      'Natrium', 'Kalium', 'Calcium', 'Magnesium', 'Phosphat', 'Chlorid',
      'Glucose', 'GFR (CKD-EPI)', 'Creatinin', 'Harnstoff', 'Harnsäure',
      'Gesamt-Bilirubin', 'GOT', 'GPT', 'GLDH', 'GGT',
      'Alkalische Phosphatase', 'LDH', 'CK gesamt', 'Amylase', 'Lipase',
      'Eisen', 'Gesamteiweiß', 'Albumin',
    ],
  },
  {
    category: 'Gerinnung',
    params: ['INR', 'Quick', 'PTT'],
  },
  {
    category: 'Hämatologie',
    params: [
      'Leukozyten', 'Erythrozyten', 'Hämoglobin', 'Hämatokrit',
      'MCV', 'MCH', 'MCHC', 'Thrombozyten', 'MPV',
      '% Normoblasten', 'Neutrophile', 'Lymphozyten', 'Monozyten',
      'Eosinophile', 'Basophile',
      '% Neutrophile', '% Lymphozyten', '% Monozyten',
      '% Eosinophile', '% Basophile',
      'Unreife Granulozyten', '% Unreife Granulozyten',
    ],
  },
  {
    category: 'Akutbestimmungen / TDM / Drogen',
    params: ['C-reaktives Protein', 'Laktat', 'Troponin', 'BNP'],
  },
]

/** Alle kanonischen Namen als Set – für schnelle Lookup-Prüfungen */
export const TEMPLATE_PARAM_SET = new Set(
  PARAMETER_TEMPLATE.flatMap(c => c.params)
)

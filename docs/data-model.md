# LabEfficient – Datenmodell (SQLite)

## Tabellen

### patients
| Feld | Typ |
|---|---|
| id | PK |
| first_name | TEXT |
| last_name | TEXT |
| birth_date | DATE |

### labs
| Feld | Typ |
|---|---|
| id | PK |
| patient_id | FK → patients |
| external_lab_name | TEXT |
| sample_date | DATE |
| upload_filename | TEXT |
| upload_timestamp | DATETIME |
| raw_text | TEXT |
| source_pdf_path | TEXT |
| processing_status | TEXT |

### lab_results
| Feld | Typ |
|---|---|
| id | PK |
| lab_id | FK → labs |
| canonical_name | TEXT |
| original_name | TEXT |
| value_numeric | REAL |
| unit | TEXT |
| ref_min | REAL |
| ref_max | REAL |
| ref_text | TEXT |
| is_high | BOOL |
| is_low | BOOL |
| is_out_of_range | BOOL |
| display_order | INT |
| category | TEXT |

### parameter_mappings
| Feld | Typ |
|---|---|
| id | PK |
| alias | TEXT |
| canonical_name | TEXT |
| category | TEXT |
| default_unit | TEXT |

### extraction_runs
| Feld | Typ |
|---|---|
| id | PK |
| lab_id | FK → labs |
| provider | TEXT |
| model_name | TEXT |
| prompt_version | TEXT |
| raw_response_json | TEXT |
| confidence_score | REAL |
| created_at | DATETIME |

---

## JSON-Zielschema für die KI-Extraktion

```json
{
  "patient": {
    "first_name": "",
    "last_name": "",
    "birth_date": "",
    "sample_date": "",
    "external_lab_name": ""
  },
  "results": [
    {
      "original_name": "",
      "canonical_name": "",
      "value": 0.0,
      "unit": "",
      "reference_range_text": "",
      "reference_min": null,
      "reference_max": null
    }
  ]
}
```

### Extraktionsregeln
- nur Werte extrahieren, die im Dokument tatsächlich vorhanden sind
- keine Werte halluzinieren
- Originalbezeichnung immer mitgeben
- wenn Referenzbereich nur als `<190` vorliegt: `reference_min = null`, `reference_max = 190`
- wenn Referenzbereich nicht sicher erkennbar: `reference_range_text` befüllen, Min/Max leer lassen
- unbekannte Parameter trotzdem extrahieren, aber `canonical_name = null`

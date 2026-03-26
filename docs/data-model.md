# LabEfficient – Datenmodell (SQLite)

## Tabellen

### import_batches
Verwaltet einen Massenimport-Vorgang.

| Feld | Typ | Beschreibung |
|---|---|---|
| id | PK | |
| folder_path | TEXT | gescannter Ordner |
| started_at | DATETIME | |
| finished_at | DATETIME | |
| total_count | INT | Anzahl gefundener PDFs |
| processed_count | INT | |
| failed_count | INT | |
| status | TEXT | queued / processing / done / partial_failure |

---

### patients

| Feld | Typ |
|---|---|
| id | PK |
| first_name | TEXT |
| last_name | TEXT |
| birth_date | DATE |

---

### labs
Ein Befund = ein PDF.

| Feld | Typ | Beschreibung |
|---|---|---|
| id | PK | |
| batch_id | FK → import_batches | |
| patient_id | FK → patients | gesetzt nach erfolgreicher Extraktion |
| external_lab_name | TEXT | |
| sample_date | DATE | |
| upload_filename | TEXT | |
| upload_timestamp | DATETIME | |
| source_pdf_path | TEXT | Pfad zur Original-PDF-Datei |
| processing_status | TEXT | queued / processing / pending_review / approved / rejected / failed |
| approved_at | DATETIME | |
| approved_by | TEXT | |
| raw_text | TEXT | optional, Fallback |

**Status-Werte:**
- `queued` – im Batch, noch nicht verarbeitet
- `processing` – Azure Vision läuft
- `pending_review` – Extraktion fertig, wartet auf Validierung
- `approved` – freigegeben
- `rejected` – zurückgewiesen
- `failed` – technischer Fehler

---

### lab_results
Ein Eintrag pro Laborparameter pro Befund.

| Feld | Typ | Beschreibung |
|---|---|---|
| id | PK | |
| lab_id | FK → labs | |
| canonical_name | TEXT | kanonischer Standardname |
| original_name | TEXT | Bezeichnung wie im PDF |
| value_numeric | REAL | |
| unit | TEXT | |
| ref_min | REAL | |
| ref_max | REAL | |
| ref_text | TEXT | Referenzbereich als Originaltext |
| is_high | BOOL | |
| is_low | BOOL | |
| is_out_of_range | BOOL | |
| confidence | TEXT | high / low – vom Vision Model |
| is_corrected | BOOL | wurde manuell korrigiert |
| corrected_by | TEXT | |
| corrected_at | DATETIME | |
| display_order | INT | |
| category | TEXT | Klinische Chemie / Hämatologie / … |

---

### parameter_mappings
Synonym-Tabelle: Alias → kanonischer Name.

| Feld | Typ |
|---|---|
| id | PK |
| alias | TEXT |
| canonical_name | TEXT |
| category | TEXT |
| default_unit | TEXT |

---

### extraction_runs
Protokoll jeder KI-Extraktion (für Nachvollziehbarkeit).

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

## JSON-Zielschema für die Azure Vision Extraktion

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
      "reference_max": null,
      "confidence": "high"
    }
  ]
}
```

### Extraktionsregeln
- nur Werte extrahieren, die im Dokument tatsächlich vorhanden sind
- keine Werte halluzinieren
- Originalbezeichnung immer mitgeben
- `confidence: low` setzen wenn Wert/Feld unsicher erkannt wurde
- wenn Referenzbereich nur als `<190` vorliegt: `reference_min = null`, `reference_max = 190`
- wenn Referenzbereich nicht sicher erkennbar: `reference_range_text` befüllen, Min/Max leer lassen
- unbekannte Parameter trotzdem extrahieren, aber `canonical_name = null`

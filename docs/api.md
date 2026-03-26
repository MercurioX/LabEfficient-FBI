# LabEfficient – API-Design

## Massenimport

### POST `/api/import/start`
Startet den Massenimport: scannt den konfigurierten Folder nach PDFs.

**Request:**
```json
{ "folder_path": "/data/inbox" }
```

**Response:**
```json
{ "batch_id": 42, "pdf_count": 17, "status": "processing" }
```

---

### GET `/api/import/batches`
Listet alle Import-Batches mit Status.

**Response:**
```json
[
  {
    "batch_id": 42,
    "status": "done",
    "total": 17,
    "processed": 17,
    "failed": 0,
    "started_at": "2024-03-15T10:00:00Z",
    "finished_at": "2024-03-15T10:15:00Z"
  }
]
```

---

### GET `/api/import/batches/{batch_id}`
Liefert Detailstatus eines Batches (je PDF: queued / processing / pending_review / approved / rejected / failed).

**Response:**
```json
{
  "batch_id": 42,
  "status": "processing",
  "total": 17,
  "processed": 5,
  "failed": 1,
  "started_at": "2024-03-15T10:00:00Z",
  "finished_at": null,
  "labs": [
    { "lab_id": 123, "filename": "lab_001.pdf", "status": "pending_review" },
    { "lab_id": 124, "filename": "lab_002.pdf", "status": "processing" },
    { "lab_id": 125, "filename": "lab_003.pdf", "status": "failed", "error_message": "Azure Timeout" }
  ]
}
```

---

## Extraktion & Verarbeitung

### POST `/api/labs/{lab_id}/process`
Sendet ein einzelnes PDF an Azure Vision und speichert das Ergebnis.

**Response:**
```json
{ "lab_id": 123, "status": "pending_review" }
```

---

### GET `/api/labs/{lab_id}`
Liefert den vollständigen Befund mit Patient und allen Laborergebnissen.

**Response:**
```json
{
  "id": 123,
  "upload_filename": "lab_001.pdf",
  "status": "pending_review",
  "external_lab_name": "Dr. Musterlabor",
  "sample_date": "2024-03-15",
  "upload_timestamp": "2024-03-15T10:30:00Z",
  "approved_at": null,
  "approved_by": null,
  "error_message": null,
  "patient": {
    "id": 42,
    "first_name": "Max",
    "last_name": "Mustermann",
    "birth_date": "1980-05-12"
  },
  "results": [
    {
      "id": 5001,
      "canonical_name": "Glucose",
      "original_name": "Glukose",
      "value_numeric": 120.0,
      "unit": "mg/dl",
      "ref_min": 70.0,
      "ref_max": 100.0,
      "ref_text": "70–100 mg/dl",
      "is_high": true,
      "is_low": false,
      "is_out_of_range": true,
      "confidence": "high",
      "is_corrected": false,
      "corrected_by": null,
      "corrected_at": null,
      "category": "Klinische Chemie",
      "display_order": 3
    }
  ]
}
```

> **Konvention:** Das DB-Feld `processing_status` wird in allen API-Responses als `status` zurückgegeben.

---

### GET `/api/labs/{lab_id}/pdf`
Liefert das Original-PDF als Datei (für Split-View im Frontend).

---

## Review & Freigabe

### GET `/api/labs?status=pending_review`
Listet alle Befunde, die auf Validierung warten.

---

### PATCH `/api/labs/{lab_id}/results/{result_id}`
Korrigiert einen einzelnen Laborwert (manuelle Korrektur in der Split-View). Alle Felder optional.

**Request:**
```json
{
  "value_numeric": 3.8,
  "unit": "mmol/l",
  "ref_min": 3.5,
  "ref_max": 5.1,
  "canonical_name": "Kalium",
  "corrected_by": "dr.mueller"
}
```

**Response:**
```json
{
  "id": 5001,
  "is_corrected": true,
  "corrected_at": "2024-03-15T11:00:00Z"
}
```

---

### POST `/api/labs/{lab_id}/approve`
Gibt einen Befund frei. Status wechselt zu `approved`.

**Request:**
```json
{ "approved_by": "dr.mueller" }
```

**Response:**
```json
{ "lab_id": 123, "status": "approved", "approved_by": "dr.mueller" }
```

---

### POST `/api/labs/{lab_id}/reject`
Weist einen Befund zurück. Status wechselt zu `rejected`.

**Response:**
```json
{ "lab_id": 123, "status": "rejected" }
```

---

## Befundansicht (nur freigegebene Daten)

### GET `/api/labs?status=approved`
Listet alle freigegebenen Befunde.

---

### GET `/api/labs/{lab_id}/timeline`
Liefert Vorwerte je Parameter für Verlaufsgrafiken (nur freigegebene Befunde).

---

## Patienten

### GET `/api/patients/search?q=...`
Findet Patientinnen und Patienten anhand Name + Geburtsdatum.

---

### GET `/api/patients/{patient_id}/labs`
Listet alle freigegebenen (`approved`) Labs eines Patienten – für Verlaufsansicht.

---

## Status-Werte für `labs.processing_status`

| Status | Bedeutung |
|---|---|
| `queued` | Im Import-Batch, noch nicht verarbeitet |
| `processing` | Azure Vision läuft |
| `pending_review` | Extraktion fertig, wartet auf Validierung |
| `approved` | Durch Anwender freigegeben |
| `rejected` | Zurückgewiesen |
| `failed` | Technischer Fehler bei der Extraktion |

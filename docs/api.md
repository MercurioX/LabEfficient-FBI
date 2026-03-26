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
{ "batch_id": 42, "pdf_count": 17, "status": "queued" }
```

---

### GET `/api/import/batches`
Listet alle Import-Batches mit Status.

---

### GET `/api/import/batches/{batch_id}`
Liefert Detailstatus eines Batches (je PDF: queued / processing / pending_review / failed).

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
Liefert den vollständigen Befund (inkl. Rohdaten und Extraktionsergebnis).

---

### GET `/api/labs/{lab_id}/pdf`
Liefert das Original-PDF als Datei (für Split-View im Frontend).

---

## Review & Freigabe

### GET `/api/labs?status=pending_review`
Listet alle Befunde, die auf Validierung warten.

---

### PATCH `/api/labs/{lab_id}/results/{result_id}`
Korrigiert einen einzelnen Laborwert (manuelle Korrektur in der Split-View).

**Request:**
```json
{
  "value_numeric": 3.8,
  "unit": "mmol/l",
  "ref_min": 3.5,
  "ref_max": 5.1,
  "corrected_by": "user"
}
```

---

### POST `/api/labs/{lab_id}/approve`
Gibt einen Befund frei. Status wechselt zu `approved`.

**Response:**
```json
{ "lab_id": 123, "status": "approved" }
```

---

### POST `/api/labs/{lab_id}/reject`
Weist einen Befund zurück. Status wechselt zu `rejected`.

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

## Status-Werte für `labs.processing_status`

| Status | Bedeutung |
|---|---|
| `queued` | Im Import-Batch, noch nicht verarbeitet |
| `processing` | Azure Vision läuft |
| `pending_review` | Extraktion fertig, wartet auf Validierung |
| `approved` | Durch Anwender freigegeben |
| `rejected` | Zurückgewiesen |
| `failed` | Technischer Fehler bei der Extraktion |

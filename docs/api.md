# LabEfficient – API-Design

## Upload & Verarbeitung

### POST `/api/labs/upload`
Upload eines PDFs.

**Request:** `multipart/form-data` mit `file`

**Response:**
```json
{ "lab_id": 123, "status": "uploaded" }
```

---

### POST `/api/labs/{lab_id}/process`
Startet OCR, Extraktion, Mapping und Abweichungsprüfung.

**Response:**
```json
{ "lab_id": 123, "status": "processed" }
```

---

### GET `/api/labs/{lab_id}`
Liefert den vollständigen standardisierten Befund.

---

### GET `/api/labs/{lab_id}/timeline`
Liefert Vorwerte je Parameter für Verlaufsgrafiken.

---

### GET `/api/patients/search?q=...`
Findet Patientinnen und Patienten anhand Name + Geburtsdatum.

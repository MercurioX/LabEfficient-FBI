# CLAUDE.md – LabEfficient

## Projekt

**LabEfficient** ist ein Hackathon-PoC zur Standardisierung externer PDF-Laborbefunde für Klinikärzte.
Vollständige Dokumentation: [docs/bootstrap.md](docs/bootstrap.md)

---

## Fachlicher Ablauf

```
Folder mit PDFs
    → Massenimport starten
    → Azure Vision Model (Bilderkennung: Patient + Laborwerte)
    → Split-View: PDF links, extrahierte Werte rechts (editierbar)
    → Manuelle Korrektur möglich
    → Freigabe durch Anwender (approve / reject)
    → Freigegebene Befunde in Befundansicht sichtbar
```

**Nur Befunde mit Status `approved` erscheinen in der klinischen Befundansicht.**

---

## Tech-Stack

### Frontend (`frontend/`)
- React 18 + Vite + TypeScript
- UI: MUI (Material UI)
- Charting: Recharts
- State: React Query + Zustand

### Backend (`backend/`)
- Python 3.11 + FastAPI + Uvicorn
- ORM: SQLAlchemy + Alembic
- Validation: Pydantic
- PDF → Bild: PyMuPDF / pdf2image
- KI: Azure Vision Model (GPT-4o Vision oder Azure Document Intelligence)

### Datenbank
- SQLite (lokal, PoC-tauglich)

### DevOps
- Docker Compose: `frontend`, `backend`, optional reverse proxy

---

## Projektstruktur

```
labefficient/
├─ frontend/
│  └─ src/
│     ├─ pages/
│     ├─ components/
│     ├─ services/
│     ├─ hooks/
│     └─ types/
├─ backend/
│  └─ app/
│     ├─ api/
│     ├─ core/
│     ├─ models/
│     ├─ schemas/
│     ├─ services/
│     ├─ repositories/
│     └─ main.py
├─ data/
│  └─ inbox/           ← Import-Ordner für PDFs
├─ docker-compose.yml
└─ CLAUDE.md
```

---

## Domänenobjekte

| Objekt | Beschreibung |
|---|---|
| `ImportBatch` | Ein Massenimport-Vorgang (Folder-Scan) |
| `Patient` | Nachname, Vorname, Geburtsdatum |
| `Lab` | Befund = ein PDF (status: queued → pending_review → approved/rejected) |
| `LabResult` | Einzelner Parameter (canonical_name, value, unit, ref_min, ref_max, is_high, is_low, is_corrected) |
| `ParameterMapping` | Synonym-Tabelle: Alias → kanonischer Name |
| `ExtractionRun` | Protokoll eines Azure Vision Calls |

### Lab-Status-Werte
`queued` → `processing` → `pending_review` → `approved` / `rejected` / `failed`

### Kanonische Parameternamen (Auswahl)
`Natrium`, `Kalium`, `Glucose`, `Creatinin`, `Gesamt-Bilirubin`, `GOT`, `GPT`, `GGT`,
`CK gesamt`, `Amylase`, `Lipase`, `C-reaktives Protein`,
`Leukozyten`, `Erythrozyten`, `Hämoglobin`, `Hämatokrit`, `Thrombozyten`

---

## API-Endpunkte (Kurzübersicht)

| Methode | Pfad | Beschreibung |
|---|---|---|
| POST | `/api/import/start` | Massenimport starten |
| GET | `/api/import/batches/{id}` | Batch-Status abrufen |
| POST | `/api/labs/{id}/process` | Azure Vision Extraktion starten |
| GET | `/api/labs/{id}` | Befund abrufen |
| GET | `/api/labs/{id}/pdf` | Original-PDF liefern (Split-View) |
| GET | `/api/labs?status=pending_review` | Review-Queue |
| PATCH | `/api/labs/{id}/results/{rid}` | Laborwert korrigieren |
| POST | `/api/labs/{id}/approve` | Befund freigeben |
| POST | `/api/labs/{id}/reject` | Befund zurückweisen |
| GET | `/api/labs?status=approved` | Freigegebene Befunde |
| GET | `/api/labs/{id}/timeline` | Verlaufsdaten je Parameter |
| GET | `/api/patients/search?q=` | Patientensuche |

---

## Wichtige Designentscheidungen

- **Azure Vision als primäre Extraktionsmethode** – PDF wird als Bild an das Vision Model geschickt, kein pdfplumber als Hauptweg
- **Menschliche Freigabe Pflicht** – kein Befund ohne `approved`-Status in der Ansicht
- **Korrekturen nachvollziehbar** – `is_corrected`, `corrected_by`, `corrected_at` in `lab_results`
- **Confidence-Feld** – Vision Model markiert unsichere Felder, Frontend hebt sie hervor
- **Originalname immer speichern** – `original_name` bleibt neben `canonical_name` erhalten
- **Referenzbereich robust** – `ref_text` immer befüllen, `ref_min`/`ref_max` nur wenn sicher parsebar
- **Mapping-Tabelle erweiterbar** – `parameter_mappings` in DB, nicht hardcoded

---

## Nicht-Ziele

- Integration in LAURIS oder klinische Produktivsysteme
- Medizinische Freigabelogik / rechtsverbindliche Befundung
- CTCAE-Vollimplementierung (nur Datenstruktur vorbereiten)

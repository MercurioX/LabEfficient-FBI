# CLAUDE.md – LabEfficient

## Projekt

**LabEfficient** ist ein Hackathon-PoC zur Standardisierung externer PDF-Laborbefunde für Klinikärzte.
Vollständige Dokumentation: [docs/bootstrap.md](docs/bootstrap.md)

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
- PDF: pdfplumber oder PyMuPDF
- KI: Azure OpenAI

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
├─ docker-compose.yml
└─ CLAUDE.md
```

---

## Fachlicher Kontext

### Kernfluss
1. PDF hochladen → Text/Tabellen extrahieren
2. Azure OpenAI → strukturiertes JSON (Patient + Laborwerte)
3. Synonym-Mapping (z.B. `CPK` → `CK gesamt`, `AST` → `GOT`)
4. Referenzbereichsprüfung → Normabweichungen markieren
5. Standardisierte Anzeige im Frontend

### Wichtige Domänenobjekte
- **Patient:** Nachname, Vorname, Geburtsdatum
- **Lab:** Befund pro Upload (externes Labor, Entnahmedatum)
- **LabResult:** Einzelner Parameter (canonical_name, value, unit, ref_min, ref_max, is_high, is_low)
- **ParameterMapping:** Alias → kanonischer Name (Synonym-Tabelle)

### Kanonische Parameternamen (Auswahl)
`Natrium`, `Kalium`, `Glucose`, `Creatinin`, `Gesamt-Bilirubin`, `GOT`, `GPT`, `GGT`,
`CK gesamt`, `Amylase`, `Lipase`, `C-reaktives Protein`,
`Leukozyten`, `Erythrozyten`, `Hämoglobin`, `Hämatokrit`, `Thrombozyten`

---

## API-Endpunkte

| Methode | Pfad | Beschreibung |
|---|---|---|
| POST | `/api/labs/upload` | PDF hochladen |
| POST | `/api/labs/{lab_id}/process` | OCR + Extraktion starten |
| GET | `/api/labs/{lab_id}` | Standardisierten Befund abrufen |
| GET | `/api/labs/{lab_id}/timeline` | Verlaufsdaten je Parameter |
| GET | `/api/patients/search?q=` | Patientensuche |

---

## Implementierungsprioritäten

1. **Muss:** Upload, Extraktion, Synonym-Mapping, Normabweichungsmarkierung
2. **Soll:** Verlaufsgrafik, unsichere Felder kennzeichnen, Patientensuche
3. **Kann:** CTCAE-Klassifikation, PDF-Export, Review-Modus

---

## Wichtige Designentscheidungen

- **Kein LLM-Halluzinieren:** Extraktionsprompt gibt ausschließlich JSON zurück, Backend validiert mit Pydantic
- **Originalname immer speichern:** `original_name` bleibt neben `canonical_name` erhalten
- **Referenzbereich robust:** `ref_text` immer befüllen, `ref_min`/`ref_max` nur wenn sicher parsebar
- **Mapping-Tabelle erweiterbar:** `parameter_mappings` in DB, nicht hardcoded
- **Hackathon-Scope:** Kein LAURIS, keine medizinische Freigabelogik

---

## Nicht-Ziele

- Integration in LAURIS oder klinische Produktivsysteme
- Medizinische Freigabelogik / rechtsverbindliche Befundung
- CTCAE-Vollimplementierung (nur Datenstruktur vorbereiten)

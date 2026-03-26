# LabEfficient – Technische Architektur

## Tech-Stack

### Frontend
- **React 18** + Vite + TypeScript
- UI: **MUI** (Material UI)
- Charting: **Recharts**
- State Management: **React Query** + Zustand

### Backend
- **Python 3.11**
- **FastAPI** + Uvicorn
- **Pydantic** für Validierung
- **SQLAlchemy** + Alembic für Datenbankzugriff
- **pdfplumber / PyMuPDF** für PDF-Extraktion
- **Azure OpenAI / Azure AI Vision** für OCR + strukturierte Extraktion

### Datenbank
- **SQLite** – lokal lauffähig für PoC, einfache Persistenz

### Cloud / KI
- **Azure OpenAI** für strukturierte Extraktion und Normalisierung
- optional: **Azure Document Intelligence** für schwierige Scans

### DevOps
- **Docker** + **Docker Compose**
- 3 Container: frontend, backend, (optional) reverse proxy
- SQLite als Dateibank im Backend-Container oder lokal gemountet

---

## Projektstruktur

```text
labefficient/
├─ frontend/
│  ├─ src/
│  │  ├─ pages/
│  │  ├─ components/
│  │  ├─ services/
│  │  ├─ hooks/
│  │  └─ types/
│  └─ package.json
├─ backend/
│  ├─ app/
│  │  ├─ api/
│  │  ├─ core/
│  │  ├─ models/
│  │  ├─ schemas/
│  │  ├─ services/
│  │  ├─ repositories/
│  │  └─ main.py
│  ├─ alembic/
│  └─ requirements.txt
├─ data/
├─ docker-compose.yml
└─ README.md
```

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
- **PyMuPDF / pdf2image** für PDF-zu-Bild-Konvertierung (kein Textextrakt, Bilder gehen direkt an Azure)
- **Azure OpenAI (GPT-4o Vision)** für strukturierte Extraktion via Bildanalyse

### Datenbank
- **SQLite** – lokal lauffähig für PoC, einfache Persistenz

### Cloud / KI
- **Azure OpenAI (GPT-4o Vision)** als primäre Extraktionsmethode: PDF-Bild → strukturiertes JSON
- optional: **Azure Document Intelligence** als Fallback für sehr schlechte Scanqualität

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

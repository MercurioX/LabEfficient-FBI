# LabEfficient

Hackathon-PoC zur Standardisierung externer PDF-Laborbefunde für Klinikärzte.
PDFs werden per Azure OpenAI GPT-4o Vision extrahiert, normalisiert, manuell geprüft und freigegeben.

---

## Voraussetzungen

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installiert und gestartet
- Azure OpenAI Zugang mit GPT-4o Vision Deployment

---

## Konfiguration

`.env` im Projektroot befüllen (einmalig):

```ini
AZURE_OPENAI_ENDPOINT=https://<dein-name>.openai.azure.com/
AZURE_OPENAI_API_KEY=<dein-api-key>
AZURE_OPENAI_DEPLOYMENT=gpt-4o
INBOX_FOLDER=/app/data/inbox
DATABASE_URL=sqlite:////app/data/labefficient.db
```

---

## Start & Stop

```bash
# Anwendung starten (erstellt DB-Schema + Seed automatisch)
docker compose up

# Im Hintergrund starten
docker compose up -d

# Anwendung stoppen
docker compose down

# Stoppen + Volumes löschen (DB zurücksetzen)
docker compose down -v
```

| Service  | URL                        |
|----------|---------------------------|
| Frontend | http://localhost:5173      |
| Backend  | http://localhost:8000      |
| API Docs | http://localhost:8000/docs |

---

## Build

```bash
# Images neu bauen (nach Code-Änderungen)
docker compose build

# Neu bauen und direkt starten
docker compose up --build
```

---

## PDFs importieren

1. PDF-Dateien in `data/inbox/` ablegen
2. Im Frontend auf **„Import starten"** klicken (oder per API):

```bash
curl -X POST http://localhost:8000/api/import/start \
  -H "Content-Type: application/json" \
  -d '{"folder_path": "/app/data/inbox"}'
```

---

## Nützliche API-Befehle

```bash
# Health-Check
curl http://localhost:8000/health

# Alle offenen Befunde (warten auf Review)
curl http://localhost:8000/api/labs?status=pending_review

# Befund freigeben
curl -X POST http://localhost:8000/api/labs/{id}/approve \
  -H "Content-Type: application/json" \
  -d '{"approved_by": "dr.mueller"}'

# Befund zurückweisen
curl -X POST http://localhost:8000/api/labs/{id}/reject

# Batch-Status abfragen
curl http://localhost:8000/api/import/batches/{batch_id}
```

---

## Logs

```bash
# Alle Logs
docker compose logs -f

# Nur Backend
docker compose logs -f backend

# Nur Frontend
docker compose logs -f frontend
```

---

## Lokale Entwicklung (ohne Docker)

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Projektstruktur

```
labefficient/
├── backend/
│   ├── app/
│   │   ├── api/           # FastAPI Router
│   │   ├── core/          # Config, DB, Seed
│   │   ├── models/        # SQLAlchemy Models
│   │   ├── schemas/       # Pydantic Schemas
│   │   └── services/      # Business Logic
│   ├── alembic/           # DB-Migrationen
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── api/           # Axios-Client + React Query Hooks
│       ├── pages/         # Seiten-Komponenten
│       └── types/         # TypeScript Interfaces
├── data/
│   └── inbox/             # PDF-Eingangsordner
├── .env                   # Secrets (nicht einchecken!)
└── docker-compose.yml
```

# LabEfficient – Implementierungsschritte

## Abhängigkeitsbaum

```
S01 → S02 → S03 → S04 → S05 → S06 → S06b → S07 → S08   (Setup + DB)
                                              ↓
                                      S09 → S10            (Import)
                                              ↓
                                      S11 → S12 → S13 → S14 → S15   (Extraktion)
                                                                ↓
                                                        S16 → S17     (Mapping + Logik)
                                                                ↓
                                                        S18 → S19     (Labs API)
                                                                ↓
S20 → S21 → S22 → S23 → S24 → S25 → S26 → S27 → S28 → S29 → S30
      (Frontend – kann ab S10 parallel starten, sobald Mock-API definiert)
```

**Parallelisierung:** Backend S09–S19 und Frontend S20–S24 können gleichzeitig laufen,
sobald die API-Verträge (Request/Response-Schemas) aus `docs/api.md` bekannt sind.

---

## SETUP

---

### S01 – Ordnerstruktur & Docker Compose ✅

**Status:** Implementiert (2026-03-26)
**Dateien:** `docker-compose.yml`, `.env`, `.gitignore`, `data/inbox/.gitkeep`, `backend/Dockerfile`, `backend/entrypoint.sh`, `backend/requirements.txt` (Platzhalter), `frontend/Dockerfile`, `frontend/package.json` (Platzhalter)

```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    volumes: ["./data:/app/data"]
    env_file: .env
  frontend:
    build: ./frontend
    ports: ["5173:5173"]
    depends_on: [backend]
```

```ini
# .env
AZURE_OPENAI_ENDPOINT=https://...
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_DEPLOYMENT=gpt-4o
INBOX_FOLDER=/app/data/inbox
DATABASE_URL=sqlite:////app/data/labefficient.db
```

```dockerfile
# backend/Dockerfile – Startup-Script für automatische Migration
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]
```

```bash
#!/bin/bash
# backend/entrypoint.sh
set -e
cd /app
alembic upgrade head
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Prüfung:** `docker compose build` läuft ohne Fehler durch. `docker compose up` → Migration läuft automatisch beim Backend-Start.

---

### S02 – FastAPI Skeleton + Konfiguration ✅

**Status:** Implementiert (2026-03-26)
**Dateien:** `backend/requirements.txt`, `backend/app/__init__.py`, `backend/app/main.py`, `backend/app/core/__init__.py`, `backend/app/core/config.py`

```
# requirements.txt
fastapi uvicorn[standard] sqlalchemy alembic pydantic pydantic-settings
pymupdf openai python-multipart aiofiles
```

```python
# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    azure_openai_endpoint: str
    azure_openai_api_key: str
    azure_openai_deployment: str = "gpt-4o"
    inbox_folder: str = "/app/data/inbox"
    database_url: str = "sqlite:////app/data/labefficient.db"
    class Config: env_file = ".env"

settings = Settings()
```

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="LabEfficient API")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
def health(): return {"status": "ok"}
```

**Prüfung:** `GET http://localhost:8000/health` → `{"status": "ok"}`

---

### S03 – Datenbankverbindung & Base ✅

**Status:** Implementiert (2026-03-26)
**Dateien:** `backend/app/core/database.py`, `backend/app/models/__init__.py`

```python
# app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

class Base(DeclarativeBase): pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Prüfung:** `from app.core.database import Base` importiert ohne Fehler.

---

## DATENBANK

---

### S04 – Models: ImportBatch + Patient ✅

**Status:** Implementiert (2026-03-26)
**Dateien:** `backend/app/models/import_batch.py`, `backend/app/models/patient.py`

```python
# models/import_batch.py
class ImportBatch(Base):
    __tablename__ = "import_batches"
    id = Column(Integer, primary_key=True)
    folder_path = Column(String)
    started_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)
    total_count = Column(Integer, default=0)
    processed_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    status = Column(String, default="processing")  # startet direkt mit "processing"
    labs = relationship("Lab", back_populates="batch")
```

```python
# models/patient.py
class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True)
    first_name = Column(String)
    last_name = Column(String)
    birth_date = Column(Date, nullable=True)
    labs = relationship("Lab", back_populates="patient")
```

**Prüfung:** Beide Klassen importierbar, keine SQLAlchemy-Fehler.

---

### S05 – Models: Lab + LabResult ✅

**Status:** Implementiert (2026-03-26)
**Dateien:** `backend/app/models/lab.py`, `backend/app/models/lab_result.py`

```python
# models/lab.py
class Lab(Base):
    __tablename__ = "labs"
    id = Column(Integer, primary_key=True)
    batch_id = Column(Integer, ForeignKey("import_batches.id"))
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    external_lab_name = Column(String, nullable=True)
    sample_date = Column(Date, nullable=True)
    upload_filename = Column(String)
    source_pdf_path = Column(String)
    processing_status = Column(String, default="queued")
    approved_at = Column(DateTime, nullable=True)
    approved_by = Column(String, nullable=True)
    upload_timestamp = Column(DateTime, default=datetime.utcnow)
    error_message = Column(String, nullable=True)  # befüllt wenn status='failed'
    batch = relationship("ImportBatch", back_populates="labs")
    patient = relationship("Patient", back_populates="labs")
    results = relationship("LabResult", back_populates="lab", cascade="all, delete-orphan")
```

```python
# models/lab_result.py
class LabResult(Base):
    __tablename__ = "lab_results"
    id = Column(Integer, primary_key=True)
    lab_id = Column(Integer, ForeignKey("labs.id"))
    canonical_name = Column(String, nullable=True)
    original_name = Column(String)
    value_numeric = Column(Float, nullable=True)
    unit = Column(String, nullable=True)
    ref_min = Column(Float, nullable=True)
    ref_max = Column(Float, nullable=True)
    ref_text = Column(String, nullable=True)
    is_high = Column(Boolean, default=False)
    is_low = Column(Boolean, default=False)
    is_out_of_range = Column(Boolean, default=False)
    confidence = Column(String, default="high")
    is_corrected = Column(Boolean, default=False)
    corrected_by = Column(String, nullable=True)
    corrected_at = Column(DateTime, nullable=True)
    display_order = Column(Integer, nullable=True)
    category = Column(String, nullable=True)
    lab = relationship("Lab", back_populates="results")
```

**Prüfung:** Beide Klassen importierbar, Relationships ohne Fehler.

---

### S06 – Models: ParameterMapping + ExtractionRun ✅

**Status:** Implementiert (2026-03-26)
**Dateien:** `backend/app/models/parameter_mapping.py`, `backend/app/models/extraction_run.py`

```python
# models/parameter_mapping.py
class ParameterMapping(Base):
    __tablename__ = "parameter_mappings"
    id = Column(Integer, primary_key=True)
    alias = Column(String, unique=True, index=True)
    canonical_name = Column(String)
    category = Column(String)
    default_unit = Column(String, nullable=True)
```

```python
# models/extraction_run.py
class ExtractionRun(Base):
    __tablename__ = "extraction_runs"
    id = Column(Integer, primary_key=True)
    lab_id = Column(Integer, ForeignKey("labs.id"))
    provider = Column(String)
    model_name = Column(String)
    prompt_version = Column(String, nullable=True)
    raw_response_json = Column(Text)
    confidence_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

**Prüfung:** `from app.models import *` importiert alle 6 Modelle ohne Fehler.

---

### S06b – Models `__init__.py` (Alembic-Voraussetzung) ✅

**Status:** Implementiert (2026-03-26)
**Datei:** `backend/app/models/__init__.py`

```python
# Alle Modelle importieren, damit Alembic Base.metadata vollständig kennt
from app.models.import_batch import ImportBatch
from app.models.patient import Patient
from app.models.lab import Lab
from app.models.lab_result import LabResult
from app.models.parameter_mapping import ParameterMapping
from app.models.extraction_run import ExtractionRun

__all__ = ["ImportBatch", "Patient", "Lab", "LabResult", "ParameterMapping", "ExtractionRun"]
```

**Wichtig:** Ohne diese Imports generiert `alembic revision --autogenerate` keine Tabellen, weil `Base.metadata` leer bleibt.

**Prüfung:** `python -c "from app.models import *; print('OK')"` → `OK`

---

### S07 – Alembic Migration ✅

**Status:** Implementiert (2026-03-26)
**Dateien:** `backend/alembic.ini`, `backend/alembic/env.py`, `backend/alembic/script.py.mako`, `backend/alembic/versions/0001_initial_schema.py`

```bash
cd backend
alembic init alembic
```

```python
# alembic/env.py – relevante Änderung
from app.models import Base          # alle Modelle importieren
target_metadata = Base.metadata
```

```bash
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

**Prüfung:** `labefficient.db` enthält alle 6 Tabellen (z.B. mit `sqlite3 data/labefficient.db .tables`).

---

### S08 – Seed: parameter_mappings ✅

**Status:** Implementiert (2026-03-26)
**Dateien:** `backend/app/core/seed.py`, `backend/app/main.py` (Startup-Hook ergänzt)

```python
MAPPINGS = [
    # alias, canonical_name, category, default_unit
    ("CK",              "CK gesamt",           "Klinische Chemie", "U/l"),
    ("CPK",             "CK gesamt",           "Klinische Chemie", "U/l"),
    ("Kreatinkinase",   "CK gesamt",           "Klinische Chemie", "U/l"),
    ("AST",             "GOT",                 "Klinische Chemie", "U/l"),
    ("ASAT",            "GOT",                 "Klinische Chemie", "U/l"),
    ("ALT",             "GPT",                 "Klinische Chemie", "U/l"),
    ("ALAT",            "GPT",                 "Klinische Chemie", "U/l"),
    ("Gamma-GT",        "GGT",                 "Klinische Chemie", "U/l"),
    ("γ-GT",            "GGT",                 "Klinische Chemie", "U/l"),
    ("Bilirubin gesamt","Gesamt-Bilirubin",    "Klinische Chemie", "mg/dl"),
    ("BILG",            "Gesamt-Bilirubin",    "Klinische Chemie", "mg/dl"),
    ("Glukose",         "Glucose",             "Klinische Chemie", "mg/dl"),
    ("Blutzucker",      "Glucose",             "Klinische Chemie", "mg/dl"),
    ("Crea",            "Creatinin",           "Klinische Chemie", "mg/dl"),
    ("Kreatinin",       "Creatinin",           "Klinische Chemie", "mg/dl"),
    ("CRP",             "C-reaktives Protein", "Klinische Chemie", "mg/l"),
    ("WBC",             "Leukozyten",          "Hämatologie",      "/nl"),
    ("RBC",             "Erythrozyten",        "Hämatologie",      "T/l"),
    ("Hb",              "Hämoglobin",          "Hämatologie",      "g/dl"),
    ("Hkt",             "Hämatokrit",          "Hämatologie",      "%"),
    ("Thrombos",        "Thrombozyten",        "Hämatologie",      "/nl"),
    # Kanonische Namen als Selbst-Mapping (damit Lookup auch bei korrekter Bezeichnung trifft)
    ("Natrium",              "Natrium",              "Klinische Chemie", "mmol/l"),
    ("Kalium",               "Kalium",               "Klinische Chemie", "mmol/l"),
    ("Glucose",              "Glucose",              "Klinische Chemie", "mg/dl"),
    ("Creatinin",            "Creatinin",            "Klinische Chemie", "mg/dl"),
    ("Gesamt-Bilirubin",     "Gesamt-Bilirubin",     "Klinische Chemie", "mg/dl"),
    ("GOT",                  "GOT",                  "Klinische Chemie", "U/l"),
    ("GPT",                  "GPT",                  "Klinische Chemie", "U/l"),
    ("GGT",                  "GGT",                  "Klinische Chemie", "U/l"),
    ("CK gesamt",            "CK gesamt",            "Klinische Chemie", "U/l"),
    ("Amylase",              "Amylase",              "Klinische Chemie", "U/l"),
    ("Lipase",               "Lipase",               "Klinische Chemie", "U/l"),
    ("C-reaktives Protein",  "C-reaktives Protein",  "Klinische Chemie", "mg/l"),
    ("Leukozyten",           "Leukozyten",           "Hämatologie",      "/nl"),
    ("Erythrozyten",         "Erythrozyten",         "Hämatologie",      "T/l"),
    ("Hämoglobin",           "Hämoglobin",           "Hämatologie",      "g/dl"),
    ("Hämatokrit",           "Hämatokrit",           "Hämatologie",      "%"),
    ("MCV",                  "MCV",                  "Hämatologie",      "fl"),
    ("MCH",                  "MCH",                  "Hämatologie",      "pg"),
    ("MCHC",                 "MCHC",                 "Hämatologie",      "g/dl"),
    ("Thrombozyten",         "Thrombozyten",         "Hämatologie",      "/nl"),
]

def run_seed(db):
    for alias, canonical, category, default_unit in MAPPINGS:
        if not db.query(ParameterMapping).filter_by(alias=alias).first():
            db.add(ParameterMapping(alias=alias, canonical_name=canonical,
                                    category=category, default_unit=default_unit))
    db.commit()
```

Seed beim App-Start aufrufen: in `main.py` → `@app.on_event("startup")`.

**Prüfung:** `SELECT count(*) FROM parameter_mappings;` → 42 Einträge (21 Aliases + 21 Selbst-Mappings).

---

## IMPORT

---

### S09 – Import Service: Folder-Scan ✅

**Status:** Implementiert (2026-03-26)
**Dateien:** `backend/app/services/__init__.py`, `backend/app/services/import_service.py`

```python
from pathlib import Path
from app.models import ImportBatch, Lab

def scan_and_create_batch(db, folder_path: str) -> ImportBatch:
    pdf_files = sorted(Path(folder_path).glob("*.pdf"))

    batch = ImportBatch(
        folder_path=folder_path,
        total_count=len(pdf_files),
        status="processing",
    )
    db.add(batch)
    db.flush()  # batch.id verfügbar

    for pdf in pdf_files:
        db.add(Lab(
            batch_id=batch.id,
            upload_filename=pdf.name,
            source_pdf_path=str(pdf.resolve()),
            processing_status="queued",
        ))

    db.commit()
    db.refresh(batch)
    return batch
```

**Prüfung:** Funktion aufrufen mit Test-Ordner → `batch.total_count` == Anzahl PDFs im Ordner.

---

### S10 – Import Router ✅

**Status:** Implementiert (2026-03-26)
**Dateien:** `backend/app/api/__init__.py`, `backend/app/api/import_router.py`, `backend/app/main.py` (Router eingebunden), `backend/app/services/import_service.py` (process_batch Stub ergänzt)

```python
from fastapi import APIRouter, Depends, BackgroundTasks
from app.core.database import get_db
from app.services import import_service

router = APIRouter()

class ImportStartRequest(BaseModel):
    folder_path: str

@router.post("/start")
def start_import(req: ImportStartRequest, background_tasks: BackgroundTasks,
                 db: Session = Depends(get_db)):
    batch = import_service.scan_and_create_batch(db, req.folder_path)
    background_tasks.add_task(import_service.process_batch, batch.id)
    return {"batch_id": batch.id, "pdf_count": batch.total_count, "status": "processing"}

@router.get("/batches")
def list_batches(db: Session = Depends(get_db)):
    batches = db.query(ImportBatch).order_by(ImportBatch.started_at.desc()).all()
    return [{"batch_id": b.id, "status": b.status, "total": b.total_count,
             "processed": b.processed_count, "failed": b.failed_count,
             "started_at": b.started_at, "finished_at": b.finished_at} for b in batches]

@router.get("/batches/{batch_id}")
def get_batch(batch_id: int, db: Session = Depends(get_db)):
    batch = db.get(ImportBatch, batch_id)
    labs = db.query(Lab).filter_by(batch_id=batch_id).all()
    return {
        "batch_id": batch.id,
        "status": batch.status,
        "total": batch.total_count,
        "processed": batch.processed_count,
        "failed": batch.failed_count,
        "labs": [{"id": l.id, "filename": l.upload_filename,
                  "status": l.processing_status} for l in labs],
    }
```

In `main.py` einbinden: `app.include_router(import_router, prefix="/api/import")`.

**Prüfung:** `POST /api/import/start {"folder_path": "/app/data/inbox"}` → JSON mit `batch_id`.

---

## EXTRAKTION

---

### S11 – PDF Service: PDF → Base64-Bild ✅

**Status:** Implementiert (2026-03-26)
**Datei:** `backend/app/services/pdf_service.py`

```python
import fitz  # PyMuPDF
import base64

def pdf_to_base64_image(pdf_path: str, page_index: int = 0) -> str:
    doc = fitz.open(pdf_path)
    page = doc[page_index]
    mat = fitz.Matrix(2.0, 2.0)   # 2x Zoom → bessere OCR-Qualität
    pix = page.get_pixmap(matrix=mat)
    img_bytes = pix.tobytes("png")
    return base64.b64encode(img_bytes).decode("utf-8")
```

**Prüfung:** Funktion auf Test-PDF aufrufen → langer Base64-String zurück, keine Exception.

---

### S12 – Extraction Pydantic Schema ✅

**Status:** Implementiert (2026-03-26)
**Dateien:** `backend/app/schemas/__init__.py`, `backend/app/schemas/extraction.py`

```python
from pydantic import BaseModel

class PatientData(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    birth_date: str | None = None       # ISO-Format "YYYY-MM-DD"
    sample_date: str | None = None
    external_lab_name: str | None = None

class LabResultData(BaseModel):
    original_name: str
    canonical_name: str | None = None
    value: float | None = None
    unit: str | None = None
    reference_range_text: str | None = None
    reference_min: float | None = None
    reference_max: float | None = None
    confidence: str = "high"            # "high" | "low"

class ExtractionResult(BaseModel):
    patient: PatientData
    results: list[LabResultData]
```

**Prüfung:** `ExtractionResult.model_validate({"patient": {}, "results": []})` läuft ohne Fehler.

---

### S13 – Vision Service: Azure Call ✅

**Status:** Implementiert (2026-03-26)
**Datei:** `backend/app/services/vision_service.py`

```python
from openai import AzureOpenAI
from app.core.config import settings
from app.schemas.extraction import ExtractionResult

SYSTEM_PROMPT = """\
Du extrahierst Informationen aus externen Laborbefunden.
Gib ausschließlich valides JSON im vorgegebenen Schema zurück. Erfinde keine Werte.
Setze confidence='low' wenn ein Wert schlecht lesbar oder unsicher ist.
Mappe Synonyme auf Standardnamen:
AST/ASAT→GOT | ALT/ALAT→GPT | Gamma-GT/γ-GT→GGT
CK/CPK/Kreatinkinase→CK gesamt | BILG/Bilirubin gesamt→Gesamt-Bilirubin
WBC→Leukozyten | RBC→Erythrozyten | Hb→Hämoglobin | Hkt→Hämatokrit | Thrombos→Thrombozyten
"""

_client = AzureOpenAI(
    azure_endpoint=settings.azure_openai_endpoint,
    api_key=settings.azure_openai_api_key,
    api_version="2024-02-01",
)

def extract_from_image(base64_image: str) -> ExtractionResult:
    response = _client.chat.completions.create(
        model=settings.azure_openai_deployment,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": [
                {"type": "image_url",
                 "image_url": {"url": f"data:image/png;base64,{base64_image}"}}
            ]},
        ],
        response_format={"type": "json_object"},
        max_tokens=4096,
    )
    return ExtractionResult.model_validate_json(response.choices[0].message.content)
```

**Prüfung:** Funktion mit einem echten PDF-Bild aufrufen → `ExtractionResult` mit Patientendaten und mind. einem `result`.

---

### S14 – Processing Service: Orchestration ✅

**Status:** Implementiert (2026-03-26)
**Datei:** `backend/app/services/processing_service.py`

```python
from datetime import datetime
from app.models import Lab, LabResult, ExtractionRun, Patient
from app.services import pdf_service, vision_service

def process_lab(db, lab_id: int) -> None:
    lab = db.get(Lab, lab_id)
    lab.processing_status = "processing"
    db.commit()

    try:
        img_b64 = pdf_service.pdf_to_base64_image(lab.source_pdf_path)
        extraction = vision_service.extract_from_image(img_b64)

        # ExtractionRun protokollieren
        db.add(ExtractionRun(
            lab_id=lab.id,
            provider="azure_openai",
            model_name=settings.azure_openai_deployment,
            raw_response_json=extraction.model_dump_json(),
        ))

        # Patient anlegen / matchen
        patient = _upsert_patient(db, extraction.patient)
        lab.patient_id = patient.id
        lab.external_lab_name = extraction.patient.external_lab_name
        lab.sample_date = _parse_date(extraction.patient.sample_date)

        # LabResults speichern
        for r in extraction.results:
            db.add(LabResult(
                lab_id=lab.id,
                original_name=r.original_name,
                canonical_name=r.canonical_name,
                value_numeric=r.value,
                unit=r.unit,
                ref_text=r.reference_range_text,
                ref_min=r.reference_min,
                ref_max=r.reference_max,
                confidence=r.confidence,
            ))

        lab.processing_status = "pending_review"

    except Exception as exc:
        lab.processing_status = "failed"
        lab.error_message = str(exc)[:500]  # Fehlermeldung speichern, gekürzt

    db.commit()
```

```python
# Hilfsfunktionen im selben Modul

def _parse_date(date_str: str | None):
    if not date_str: return None
    try: return date.fromisoformat(date_str)
    except ValueError: return None

def _upsert_patient(db, p: PatientData) -> Patient:
    """Sucht Patient nach Name + Geburtsdatum; legt neu an wenn nicht gefunden."""
    birth = _parse_date(p.birth_date)
    existing = db.query(Patient).filter_by(
        first_name=p.first_name, last_name=p.last_name, birth_date=birth
    ).first()
    if existing:
        return existing
    patient = Patient(first_name=p.first_name, last_name=p.last_name, birth_date=birth)
    db.add(patient)
    db.flush()
    return patient
```

**Prüfung:** `process_lab(db, lab_id)` aufrufen → `lab.processing_status == "pending_review"`, `lab_results`-Einträge in DB.

---

### S15 – Batch-Verarbeitung (Background Task) ✅

**Status:** Implementiert (2026-03-26)
**Datei:** `backend/app/services/import_service.py` (Stub ersetzt)

```python
def process_batch(batch_id: int) -> None:
    # eigene DB-Session, da Background Task außerhalb des Request-Lifecycles
    db = SessionLocal()
    try:
        labs = db.query(Lab).filter_by(batch_id=batch_id,
                                        processing_status="queued").all()
        batch = db.get(ImportBatch, batch_id)

        for lab in labs:
            processing_service.process_lab(db, lab.id)
            if lab.processing_status == "failed":
                batch.failed_count += 1
            else:
                batch.processed_count += 1
            db.commit()

        batch.status = "done" if batch.failed_count == 0 else "partial_failure"
        batch.finished_at = datetime.utcnow()
        db.commit()
    finally:
        db.close()
```

**Prüfung:** Import starten → nach Abschluss `batch.status == "done"`, alle Labs auf `pending_review` oder `failed`.

---

## MAPPING & LOGIK

---

### S16 – Mapping Service: Synonym-Lookup ✅

**Status:** Implementiert (2026-03-26)
**Dateien:** `backend/app/services/mapping_service.py`, `backend/app/services/processing_service.py` (enrich_result-Aufruf ergänzt)

```python
from sqlalchemy import func
from app.models import ParameterMapping, LabResult

DISPLAY_ORDER = {
    "Natrium": 1, "Kalium": 2, "Glucose": 3, "Creatinin": 4,
    "Gesamt-Bilirubin": 5, "GOT": 6, "GPT": 7, "GGT": 8,
    "CK gesamt": 9, "Amylase": 10, "Lipase": 11, "C-reaktives Protein": 12,
    "Leukozyten": 20, "Erythrozyten": 21, "Hämoglobin": 22,
    "Hämatokrit": 23, "MCV": 24, "MCH": 25, "MCHC": 26, "Thrombozyten": 27,
}

def lookup_canonical(db, original_name: str) -> tuple[str | None, str | None]:
    """Gibt (canonical_name, category) zurück."""
    match = db.query(ParameterMapping).filter(
        func.lower(ParameterMapping.alias) == original_name.strip().lower()
    ).first()
    return (match.canonical_name, match.category) if match else (None, None)

def enrich_result(db, result: LabResult) -> None:
    """Setzt canonical_name, category und display_order falls noch nicht gesetzt."""
    if not result.canonical_name:
        result.canonical_name, result.category = lookup_canonical(db, result.original_name)
    if result.canonical_name and not result.display_order:
        result.display_order = DISPLAY_ORDER.get(result.canonical_name, 999)
```

Aufruf in `processing_service.process_lab` nach dem Speichern der Rohergebnisse.

**Prüfung:** `lookup_canonical(db, "AST")` → `("GOT", "Klinische Chemie")`.

---

### S17 – Deviation Service: Normabweichung berechnen

**Datei:** `backend/app/services/deviation_service.py`

```python
from app.models import LabResult

def calculate(result: LabResult) -> None:
    """Setzt is_high, is_low, is_out_of_range direkt auf dem Objekt."""
    result.is_high = False
    result.is_low = False
    result.is_out_of_range = False

    if result.value_numeric is None:
        return

    if result.ref_min is not None and result.value_numeric < result.ref_min:
        result.is_low = True
        result.is_out_of_range = True
    elif result.ref_max is not None and result.value_numeric > result.ref_max:
        result.is_high = True
        result.is_out_of_range = True
```

Aufruf in `processing_service` nach dem Speichern jedes `LabResult` und erneut in `labs_router` nach jeder Korrektur.

**Prüfung:**
- `value=3.2, ref_min=3.5` → `is_low=True`
- `value=66, ref_max=60` → `is_high=True`
- `value=4.0, ref_min=3.5, ref_max=5.1` → alle False

---

## LABS API

---

### S18 – Labs Router: GET-Endpunkte + PDF

**Datei:** `backend/app/api/labs_router.py`

```python
from fastapi import APIRouter, Depends, Query
from fastapi.responses import FileResponse
from app.core.database import get_db
from app.models import Lab

router = APIRouter()

@router.get("")
def list_labs(status: str | None = Query(None), db: Session = Depends(get_db)):
    q = db.query(Lab)
    if status:
        q = q.filter(Lab.processing_status == status)
    return [_lab_summary(l) for l in q.all()]

@router.get("/{lab_id}")
def get_lab(lab_id: int, db: Session = Depends(get_db)):
    lab = db.get(Lab, lab_id)
    return _lab_detail(lab)   # patient + results

@router.get("/{lab_id}/pdf")
def get_pdf(lab_id: int, db: Session = Depends(get_db)):
    lab = db.get(Lab, lab_id)
    return FileResponse(lab.source_pdf_path, media_type="application/pdf",
                        headers={"Content-Disposition": "inline"})

@router.get("/{lab_id}/timeline")
def get_timeline(lab_id: int, db: Session = Depends(get_db)):
    # Alle approved Labs desselben Patienten, nach sample_date sortiert
    lab = db.get(Lab, lab_id)
    sibling_labs = db.query(Lab).filter_by(
        patient_id=lab.patient_id, processing_status="approved"
    ).order_by(Lab.sample_date).all()
    # Gibt pro Parameter alle Messwerte zurück
    return _build_timeline(sibling_labs)
```

```python
# Hilfsfunktionen im selben Modul

def _lab_summary(lab: Lab) -> dict:
    return {
        "id": lab.id,
        "upload_filename": lab.upload_filename,
        "status": lab.processing_status,   # DB-Feld → API-Feld
        "sample_date": lab.sample_date.isoformat() if lab.sample_date else None,
        "external_lab_name": lab.external_lab_name,
        "error_message": lab.error_message,
        "patient": {
            "id": lab.patient.id,
            "first_name": lab.patient.first_name,
            "last_name": lab.patient.last_name,
            "birth_date": lab.patient.birth_date.isoformat() if lab.patient.birth_date else None,
        } if lab.patient else None,
    }

def _lab_detail(lab: Lab) -> dict:
    base = _lab_summary(lab)
    base["approved_by"] = lab.approved_by
    base["approved_at"] = lab.approved_at.isoformat() if lab.approved_at else None
    base["results"] = [{
        "id": r.id,
        "canonical_name": r.canonical_name,
        "original_name": r.original_name,
        "value_numeric": r.value_numeric,
        "unit": r.unit,
        "ref_min": r.ref_min,
        "ref_max": r.ref_max,
        "ref_text": r.ref_text,
        "is_high": r.is_high,
        "is_low": r.is_low,
        "is_out_of_range": r.is_out_of_range,
        "confidence": r.confidence,
        "is_corrected": r.is_corrected,
        "corrected_by": r.corrected_by,
        "corrected_at": r.corrected_at.isoformat() if r.corrected_at else None,
        "category": r.category,
        "display_order": r.display_order,
    } for r in sorted(lab.results, key=lambda r: r.display_order or 999)]
    return base

def _build_timeline(labs: list[Lab]) -> list[dict]:
    rows = []
    for lab in labs:
        for r in lab.results:
            rows.append({
                "sample_date": lab.sample_date.isoformat() if lab.sample_date else None,
                "canonical_name": r.canonical_name,
                "value_numeric": r.value_numeric,
                "unit": r.unit,
                "ref_min": r.ref_min,
                "ref_max": r.ref_max,
            })
    return rows
```

**Prüfung:** `GET /api/labs?status=pending_review` → Liste der wartenden Befunde.

---

### S19 – Labs Router: Korrektur + Freigabe

**Datei:** `backend/app/api/labs_router.py` (Ergänzung)

```python
class ResultPatch(BaseModel):
    value_numeric: float | None = None
    unit: str | None = None
    ref_min: float | None = None
    ref_max: float | None = None
    ref_text: str | None = None
    canonical_name: str | None = None
    corrected_by: str = "user"

@router.patch("/{lab_id}/results/{result_id}")
def update_result(lab_id: int, result_id: int, patch: ResultPatch,
                  db: Session = Depends(get_db)):
    result = db.get(LabResult, result_id)
    for field, val in patch.model_dump(exclude_unset=True).items():
        setattr(result, field, val)
    result.is_corrected = True
    result.corrected_at = datetime.utcnow()
    deviation_service.calculate(result)   # Abweichung neu berechnen
    db.commit()
    return {"id": result.id, "is_corrected": True}

class ApproveRequest(BaseModel):
    approved_by: str = "unknown"

@router.post("/{lab_id}/approve")
def approve(lab_id: int, req: ApproveRequest, db: Session = Depends(get_db)):
    lab = db.get(Lab, lab_id)
    lab.processing_status = "approved"
    lab.approved_at = datetime.utcnow()
    lab.approved_by = req.approved_by
    db.commit()
    return {"lab_id": lab_id, "status": "approved", "approved_by": req.approved_by}

@router.post("/{lab_id}/reject")
def reject(lab_id: int, db: Session = Depends(get_db)):
    lab = db.get(Lab, lab_id)
    lab.processing_status = "rejected"
    db.commit()
    return {"lab_id": lab_id, "status": "rejected"}

@router.post("/{lab_id}/process")
def process_single(lab_id: int, background_tasks: BackgroundTasks,
                   db: Session = Depends(get_db)):
    """Startet Azure Vision Extraktion für ein einzelnes Lab (z.B. nach Fehler erneut anstoßen)."""
    background_tasks.add_task(processing_service.process_lab, db, lab_id)
    return {"lab_id": lab_id, "status": "processing"}
```

**Prüfung:**
- Wert patchen → `is_corrected=True`, `is_high`/`is_low` korrekt neu gesetzt
- Approve → `GET /api/labs/{id}` liefert `status: approved`, `approved_by` gesetzt
- `/process` auf fehlgeschlagenem Lab → erneute Verarbeitung startet

---

## FRONTEND

---

### S20 – Vite Setup + Router + API-Client

**Dateien:** `frontend/` (neu), `frontend/src/api/client.ts`, `frontend/src/main.tsx`

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install @mui/material @emotion/react @emotion/styled \
            @tanstack/react-query axios react-router-dom recharts react-pdf
```

```typescript
// src/api/client.ts
import axios from 'axios'
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
})
```

```typescript
// src/main.tsx – Route-Struktur
<Routes>
  <Route path="/"               element={<ImportPage />} />
  <Route path="/review"         element={<ReviewQueuePage />} />
  <Route path="/review/:labId"  element={<SplitViewPage />} />
  <Route path="/befunde"        element={<BefundListPage />} />
  <Route path="/befunde/:labId" element={<BefundDetailPage />} />
</Routes>
```

**Prüfung:** `npm run dev` → App läuft auf Port 5173, alle Routen erreichbar.

---

### S21 – Typen + API-Hooks

**Dateien:** `frontend/src/types/index.ts`, `frontend/src/api/hooks.ts`

```typescript
// src/types/index.ts
export interface LabResult {
  id: number
  original_name: string
  canonical_name: string | null
  value_numeric: number | null
  unit: string | null
  ref_min: number | null
  ref_max: number | null
  ref_text: string | null
  is_high: boolean
  is_low: boolean
  is_out_of_range: boolean
  confidence: 'high' | 'low'
  is_corrected: boolean
  corrected_by: string | null
  corrected_at: string | null
  category: string | null
  display_order: number | null
}

export interface Lab {
  id: number
  upload_filename: string
  status: string              // API gibt processing_status als "status" zurück
  sample_date: string | null
  external_lab_name: string | null
  error_message: string | null
  approved_by: string | null
  patient: { id: number; first_name: string; last_name: string; birth_date: string } | null
  results: LabResult[]
}
```

```typescript
// src/api/hooks.ts
export const useLabs = (status?: string) =>
  useQuery({ queryKey: ['labs', status],
             queryFn: () => api.get('/api/labs', { params: { status } }).then(r => r.data) })

export const useLab = (id: number) =>
  useQuery({ queryKey: ['lab', id],
             queryFn: () => api.get(`/api/labs/${id}`).then(r => r.data) })

export const useBatch = (id: number | null) =>
  useQuery({ queryKey: ['batch', id], enabled: !!id,
             queryFn: () => api.get(`/api/import/batches/${id}`).then(r => r.data),
             refetchInterval: (data: any) => data?.status === 'processing' ? 2000 : false })
```

**Prüfung:** TypeScript kompiliert ohne Fehler.

---

### S22 – Import-Seite: Eingabe + Start

**Datei:** `frontend/src/pages/ImportPage.tsx`

```typescript
export function ImportPage() {
  const [folder, setFolder] = useState('/app/data/inbox')
  const [batchId, setBatchId] = useState<number | null>(null)

  const startMutation = useMutation({
    mutationFn: () => api.post('/api/import/start', { folder_path: folder })
                        .then(r => r.data),
    onSuccess: (data) => setBatchId(data.batch_id),
  })

  return (
    <Box p={3}>
      <Typography variant="h5">Massenimport</Typography>
      <TextField label="Ordnerpfad" value={folder}
                 onChange={e => setFolder(e.target.value)} fullWidth sx={{ my: 2 }} />
      <Button variant="contained" onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}>
        Import starten
      </Button>
      {batchId && <BatchStatus batchId={batchId} />}
    </Box>
  )
}
```

**Prüfung:** Button klicken → API-Call, `batchId` wird gesetzt, `BatchStatus` erscheint.

---

### S23 – Import-Seite: Batch-Status + Statusliste

**Datei:** `frontend/src/components/BatchStatus.tsx`

```typescript
export function BatchStatus({ batchId }: { batchId: number }) {
  const { data: batch } = useBatch(batchId)
  const navigate = useNavigate()

  useEffect(() => {
    if (batch?.status === 'done' || batch?.status === 'partial_failure')
      navigate('/review')
  }, [batch?.status])

  if (!batch) return <CircularProgress />

  return (
    <Box mt={2}>
      {batch.status === 'partial_failure' && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Import abgeschlossen mit {batch.failed} Fehlern. Fehlerhafte Befunde sind unten markiert.
        </Alert>
      )}
      <LinearProgress variant="determinate"
        value={(batch.processed / batch.total) * 100} />
      <Typography>{batch.processed} / {batch.total} verarbeitet
                  {batch.failed > 0 && ` | ${batch.failed} Fehler`}</Typography>
      <List dense>
        {batch.labs.map((lab: any) => (
          <ListItem key={lab.id}>
            <ListItemText primary={lab.filename} />
            <StatusChip status={lab.status} />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
```

`StatusChip`: Chip-Komponente mit Farbe je Status (`queued`=grau, `processing`=blau, `pending_review`=orange, `failed`=rot).

**Prüfung:** Während Import läuft → Live-Update alle 2s, Weiterleitung zu `/review` nach Abschluss.

---

### S24 – Review-Queue

**Datei:** `frontend/src/pages/ReviewQueuePage.tsx`

```typescript
export function ReviewQueuePage() {
  const { data: labs = [] } = useLabs('pending_review')
  const navigate = useNavigate()

  return (
    <Box p={3}>
      <Typography variant="h5">Zur Prüfung ({labs.length})</Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Datei</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Entnahmedatum</TableCell>
              <TableCell>Labor</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {labs.map((lab: Lab) => (
              <TableRow key={lab.id}>
                <TableCell>{lab.upload_filename}</TableCell>
                <TableCell>{lab.patient
                  ? `${lab.patient.last_name}, ${lab.patient.first_name}` : '–'}</TableCell>
                <TableCell>{lab.sample_date ?? '–'}</TableCell>
                <TableCell>{lab.external_lab_name ?? '–'}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => navigate(`/review/${lab.id}`)}>
                    Prüfen
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
```

**Prüfung:** Nach Import → alle `pending_review`-Befunde in der Tabelle sichtbar.

---

### S25 – Split-View: Layout + PDF-Viewer

**Dateien:** `frontend/src/pages/SplitViewPage.tsx`, `frontend/src/components/PdfViewer.tsx`

```typescript
// SplitViewPage.tsx – Layout
export function SplitViewPage() {
  const { labId } = useParams()
  const { data: lab } = useLab(Number(labId))

  return (
    <Box display="grid" gridTemplateColumns="1fr 1fr" height="100vh" overflow="hidden">
      <Box borderRight="1px solid #e0e0e0" overflow="auto" bgcolor="#f5f5f5">
        <PdfViewer labId={Number(labId)} />
      </Box>
      <Box overflow="auto" p={2}>
        {lab && <ReviewPanel lab={lab} />}
      </Box>
    </Box>
  )
}
```

```typescript
// PdfViewer.tsx
import { Document, Page, pdfjs } from 'react-pdf'
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

export function PdfViewer({ labId }: { labId: number }) {
  return (
    <Document file={`http://localhost:8000/api/labs/${labId}/pdf`}>
      <Page pageNumber={1} width={600} />
    </Document>
  )
}
```

**Prüfung:** Split-View öffnet sich, PDF wird auf der linken Seite gerendert.

---

### S26 – Split-View: ResultsEditor

**Datei:** `frontend/src/components/ResultsEditor.tsx`

```typescript
export function ResultsEditor({ lab }: { lab: Lab }) {
  const queryClient = useQueryClient()

  const patchMutation = useMutation({
    mutationFn: ({ resultId, patch }: { resultId: number; patch: Partial<LabResult> }) =>
      api.patch(`/api/labs/${lab.id}/results/${resultId}`, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lab', lab.id] }),
  })

  // Kopfdaten (Patient)
  // Laborwerte-Tabelle: eine Zeile pro LabResult
  // Confidence='low' → gelber Hintergrund (warning.light)
  // Inline-Editing: bei onChange → debounced PATCH-Call

  return (
    <>
      <PatientHeader patient={lab.patient} />
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead> ... Spalten: Bezeichnung | Wert | Einheit | Ref. | Status </TableHead>
          <TableBody>
            {lab.results
              .sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999))
              .map(result => (
                <TableRow key={result.id}
                  sx={{ bgcolor: result.confidence === 'low' ? 'warning.light' : 'inherit' }}>
                  <TableCell>{result.canonical_name ?? result.original_name}</TableCell>
                  <EditableCell value={result.value_numeric}
                    onChange={v => patchMutation.mutate({ resultId: result.id,
                                                          patch: { value_numeric: v }})} />
                  <EditableCell value={result.unit}
                    onChange={v => patchMutation.mutate({ resultId: result.id,
                                                          patch: { unit: v }})} />
                  <TableCell>{result.ref_text ?? `${result.ref_min}–${result.ref_max}`}</TableCell>
                  <TableCell><DeviationChip result={result} /></TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}
```

**Prüfung:** Wert ändern → PATCH-Call ausgeführt, Tabelle aktualisiert sich, `is_corrected`-Feld in DB gesetzt.

---

### S27 – Split-View: ApprovalActions

**Datei:** `frontend/src/components/ApprovalActions.tsx`

```typescript
export function ApprovalActions({ labId }: { labId: number }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const approve = useMutation({
    mutationFn: () => api.post(`/api/labs/${labId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] })
      navigate('/review')
    },
  })

  const reject = useMutation({
    mutationFn: () => api.post(`/api/labs/${labId}/reject`),
    onSuccess: () => navigate('/review'),
  })

  return (
    <Stack direction="row" spacing={2} mt={3} position="sticky" bottom={0}
           bgcolor="background.paper" p={2} borderTop="1px solid #e0e0e0">
      <Button variant="contained" color="success" size="large"
              onClick={() => approve.mutate()} loading={approve.isPending}>
        Freigeben
      </Button>
      <Button variant="outlined" color="error" size="large"
              onClick={() => reject.mutate()}>
        Zurückweisen
      </Button>
    </Stack>
  )
}
```

**Prüfung:** „Freigeben" → Weiterleitung zu `/review`, Befund verschwindet aus Queue, erscheint unter `approved`.

---

### S28 – Befundliste + Befunddetail

**Dateien:** `frontend/src/pages/BefundListPage.tsx`, `frontend/src/pages/BefundDetailPage.tsx`

```typescript
// BefundListPage.tsx – nur approved
const { data: labs = [] } = useLabs('approved')
// Tabelle: Patient | Entnahmedatum | Labor | [Öffnen]
```

```typescript
// BefundDetailPage.tsx
const statusColor = (r: LabResult) => {
  if (!r.ref_min && !r.ref_max) return 'default'   // grau – Ref. unbekannt
  if (r.is_high) return 'error'                     // rot
  if (r.is_low)  return 'info'                      // blau
  return 'success'                                   // grün
}

const statusLabel = (r: LabResult) => {
  if (!r.ref_min && !r.ref_max) return 'Ref. unbekannt'
  if (r.is_high) return '↑ erhöht'
  if (r.is_low)  return '↓ erniedrigt'
  return 'normal'
}

// Tabelle nach `category` gruppieren (Klinische Chemie / Hämatologie / ...)
// Spalten: Standardname | Originalname | Wert | Einheit | Referenz | Status-Chip
```

**Prüfung:** Freigegebener Befund öffnen → korrekte Farbmarkierungen, Parameter in Kategorien gruppiert.

---

### S29 – Verlaufsgrafik

**Datei:** `frontend/src/components/TimelineChart.tsx`

```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'

export function TimelineChart({ labId, paramName }: { labId: number, paramName: string }) {
  const { data: timeline } = useQuery({
    queryKey: ['timeline', labId],
    queryFn: () => api.get(`/api/labs/${labId}/timeline`).then(r => r.data),
  })

  const series = timeline?.filter((d: any) => d.canonical_name === paramName) ?? []
  const refMin = series[0]?.ref_min
  const refMax = series[0]?.ref_max

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={series}>
        <XAxis dataKey="sample_date" />
        <YAxis />
        <Tooltip />
        {refMin && <ReferenceLine y={refMin} stroke="#1976d2" strokeDasharray="4 4" label="Min" />}
        {refMax && <ReferenceLine y={refMax} stroke="#d32f2f" strokeDasharray="4 4" label="Max" />}
        <Line type="monotone" dataKey="value_numeric" stroke="#1976d2" dot />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

**Prüfung:** Mindestens 2 freigegebene Befunde desselben Patienten → Liniendiagramm mit Referenzlinien sichtbar.

---

### S30 – Demo-Härtung

**Checkliste:**

```
Backend:
[ ] 3 Test-PDFs in data/inbox/ bereitstellen (unterschiedliche Labore/Strukturen)
[ ] failed-Status in Batch-Response sauber exponiert
[ ] Fehlende source_pdf_path → 404 statt 500 im PDF-Endpoint
[ ] CORS für localhost:5173 explizit konfiguriert

Frontend:
[ ] Ladezustand: CircularProgress in allen useQuery-Hooks
[ ] Leerzustand: "Keine Befunde" wenn Liste leer
[ ] Fehler-Banner bei fehlgeschlagenem API-Call (React Query onError)
[ ] PDF-Viewer Fallback wenn PDF nicht ladbar

DevOps:
[ ] docker compose up startet alles ohne manuelle Schritte
[ ] Alembic + Seed laufen im Backend-Container automatisch beim Start
[ ] .env.example mit Platzhalterwerten committen
[ ] data/inbox/.gitkeep committen, data/labefficient.db in .gitignore
```

**Prüfung:** Frischer `git clone` → `docker compose up` → kompletter Demo-Durchlauf funktioniert.

---

### S31 – Patienten-Router: Suche + Labs je Patient

**Datei:** `backend/app/api/patients_router.py`

```python
from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, func
from app.core.database import get_db
from app.models import Patient, Lab

router = APIRouter()

@router.get("/search")
def search_patients(q: str = Query(..., min_length=2), db: Session = Depends(get_db)):
    q_lower = q.strip().lower()
    patients = db.query(Patient).filter(
        or_(
            func.lower(Patient.first_name).like(f"%{q_lower}%"),
            func.lower(Patient.last_name).like(f"%{q_lower}%"),
        )
    ).all()
    return [{"id": p.id, "first_name": p.first_name,
             "last_name": p.last_name, "birth_date": p.birth_date} for p in patients]

@router.get("/{patient_id}/labs")
def get_patient_labs(patient_id: int, db: Session = Depends(get_db)):
    labs = db.query(Lab).filter_by(
        patient_id=patient_id, processing_status="approved"
    ).order_by(Lab.sample_date.desc()).all()
    return [_lab_summary(l) for l in labs]
```

In `main.py` einbinden: `app.include_router(patients_router, prefix="/api/patients")`.

**Prüfung:**
- `GET /api/patients/search?q=mueller` → Patienten mit "mueller" im Namen
- `GET /api/patients/42/labs` → alle freigegebenen Labs von Patient 42

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.import_batch import ImportBatch
from app.models.lab import Lab
from app.services import import_service

router = APIRouter()


class ImportStartRequest(BaseModel):
    folder_path: str


@router.post("/start")
def start_import(
    req: ImportStartRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    batch = import_service.scan_and_create_batch(db, req.folder_path)
    background_tasks.add_task(import_service.process_batch, batch.id)
    return {"batch_id": batch.id, "pdf_count": batch.total_count, "status": "processing"}


@router.get("/batches")
def list_batches(db: Session = Depends(get_db)):
    batches = db.query(ImportBatch).order_by(ImportBatch.started_at.desc()).all()
    return [
        {
            "batch_id": b.id,
            "status": b.status,
            "total": b.total_count,
            "processed": b.processed_count,
            "failed": b.failed_count,
            "started_at": b.started_at,
            "finished_at": b.finished_at,
        }
        for b in batches
    ]


@router.get("/batches/{batch_id}")
def get_batch(batch_id: int, db: Session = Depends(get_db)):
    batch = db.get(ImportBatch, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    labs = db.query(Lab).filter_by(batch_id=batch_id).all()
    return {
        "batch_id": batch.id,
        "status": batch.status,
        "total": batch.total_count,
        "processed": batch.processed_count,
        "failed": batch.failed_count,
        "labs": [
            {"id": l.id, "filename": l.upload_filename, "status": l.processing_status}
            for l in labs
        ],
    }

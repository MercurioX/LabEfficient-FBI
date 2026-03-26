from datetime import datetime
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.import_batch import ImportBatch
from app.models.lab import Lab
from app.services import processing_service


def scan_and_create_batch(db: Session, folder_path: str) -> ImportBatch:
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


def process_batch(batch_id: int) -> None:
    # Eigene DB-Session, da Background Task außerhalb des Request-Lifecycles
    db = SessionLocal()
    try:
        labs = db.query(Lab).filter_by(
            batch_id=batch_id,
            processing_status="queued",
        ).all()
        batch = db.get(ImportBatch, batch_id)

        for lab in labs:
            processing_service.process_lab(db, lab.id)
            db.refresh(lab)
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

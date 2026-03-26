from pathlib import Path

from sqlalchemy.orm import Session

from app.models.import_batch import ImportBatch
from app.models.lab import Lab


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
    """Stub – wird in S11–S15 implementiert (Azure Vision Extraktion)."""
    pass

from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.lab import Lab
from app.models.lab_result import LabResult
from app.services import deviation_service, processing_service

router = APIRouter()


# ---------------------------------------------------------------------------
# Request-Schemas
# ---------------------------------------------------------------------------

class ResultPatch(BaseModel):
    value_numeric: float | None = None
    unit: str | None = None
    ref_min: float | None = None
    ref_max: float | None = None
    ref_text: str | None = None
    canonical_name: str | None = None
    corrected_by: str = "user"


class ApproveRequest(BaseModel):
    approved_by: str = "unknown"


@router.get("")
def list_labs(status: str | None = Query(None), db: Session = Depends(get_db)):
    q = db.query(Lab)
    if status:
        q = q.filter(Lab.processing_status == status)
    return [_lab_summary(lab) for lab in q.all()]


@router.get("/{lab_id}")
def get_lab(lab_id: int, db: Session = Depends(get_db)):
    lab = db.get(Lab, lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    return _lab_detail(lab)


@router.get("/{lab_id}/pdf")
def get_pdf(lab_id: int, db: Session = Depends(get_db)):
    import os
    lab = db.get(Lab, lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    if not lab.source_pdf_path or not os.path.exists(lab.source_pdf_path):
        raise HTTPException(status_code=404, detail="PDF not found")
    return FileResponse(
        lab.source_pdf_path,
        media_type="application/pdf",
        headers={"Content-Disposition": "inline"},
    )


@router.get("/{lab_id}/timeline")
def get_timeline(lab_id: int, db: Session = Depends(get_db)):
    lab = db.get(Lab, lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    sibling_labs = (
        db.query(Lab)
        .filter_by(patient_id=lab.patient_id, processing_status="approved")
        .order_by(Lab.sample_date)
        .all()
    )
    return _build_timeline(sibling_labs)


# ---------------------------------------------------------------------------
# Schreib-Endpunkte (S19)
# ---------------------------------------------------------------------------

@router.patch("/{lab_id}/results/{result_id}")
def update_result(
    lab_id: int,
    result_id: int,
    patch: ResultPatch,
    db: Session = Depends(get_db),
):
    result = db.get(LabResult, result_id)
    if not result or result.lab_id != lab_id:
        raise HTTPException(status_code=404, detail="Result not found")
    for field, val in patch.model_dump(exclude_unset=True, exclude={"corrected_by"}).items():
        setattr(result, field, val)
    result.is_corrected = True
    result.corrected_by = patch.corrected_by
    result.corrected_at = datetime.utcnow()
    deviation_service.calculate(result)  # Abweichung neu berechnen
    db.commit()
    return {"id": result.id, "is_corrected": True}


@router.post("/{lab_id}/approve")
def approve(lab_id: int, req: ApproveRequest, db: Session = Depends(get_db)):
    lab = db.get(Lab, lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    lab.processing_status = "approved"
    lab.approved_at = datetime.utcnow()
    lab.approved_by = req.approved_by
    db.commit()
    return {"lab_id": lab_id, "status": "approved", "approved_by": req.approved_by}


@router.post("/{lab_id}/reject")
def reject(lab_id: int, db: Session = Depends(get_db)):
    lab = db.get(Lab, lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    lab.processing_status = "rejected"
    db.commit()
    return {"lab_id": lab_id, "status": "rejected"}


@router.post("/{lab_id}/process")
def process_single(
    lab_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Startet Azure Vision Extraktion für ein einzelnes Lab (z.B. nach Fehler erneut anstoßen)."""
    lab = db.get(Lab, lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    background_tasks.add_task(processing_service.process_lab, db, lab_id)
    return {"lab_id": lab_id, "status": "processing"}


# ---------------------------------------------------------------------------
# Hilfsfunktionen
# ---------------------------------------------------------------------------

def _lab_summary(lab: Lab) -> dict:
    return {
        "id": lab.id,
        "upload_filename": lab.upload_filename,
        "status": lab.processing_status,
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
    base["results"] = [
        {
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
        }
        for r in sorted(lab.results, key=lambda r: r.display_order or 999)
    ]
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

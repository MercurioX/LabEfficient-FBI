from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.lab import Lab

router = APIRouter()


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
    lab = db.get(Lab, lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
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

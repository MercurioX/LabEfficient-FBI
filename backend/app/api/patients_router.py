from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Lab, Patient

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
    return [
        {
            "id": p.id,
            "first_name": p.first_name,
            "last_name": p.last_name,
            "birth_date": p.birth_date.isoformat() if p.birth_date else None,
        }
        for p in patients
    ]


@router.get("/{patient_id}/labs")
def get_patient_labs(patient_id: int, db: Session = Depends(get_db)):
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    labs = (
        db.query(Lab)
        .filter_by(patient_id=patient_id, processing_status="approved")
        .order_by(Lab.sample_date.desc())
        .all()
    )
    return [
        {
            "id": lab.id,
            "upload_filename": lab.upload_filename,
            "status": lab.processing_status,
            "sample_date": lab.sample_date.isoformat() if lab.sample_date else None,
            "external_lab_name": lab.external_lab_name,
        }
        for lab in labs
    ]

from datetime import date
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.extraction_run import ExtractionRun
from app.models.lab import Lab
from app.models.lab_result import LabResult
from app.models.patient import Patient
from app.schemas.extraction import PatientData
from app.services import pdf_service, vision_service


def process_lab(db: Session, lab_id: int) -> None:
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


def _parse_date(date_str: str | None):
    if not date_str:
        return None
    try:
        return date.fromisoformat(date_str)
    except ValueError:
        return None


def _upsert_patient(db: Session, p: PatientData) -> Patient:
    """Sucht Patient nach Name + Geburtsdatum; legt neu an wenn nicht gefunden."""
    birth = _parse_date(p.birth_date)
    existing = db.query(Patient).filter_by(
        first_name=p.first_name,
        last_name=p.last_name,
        birth_date=birth,
    ).first()
    if existing:
        return existing
    patient = Patient(first_name=p.first_name, last_name=p.last_name, birth_date=birth)
    db.add(patient)
    db.flush()
    return patient

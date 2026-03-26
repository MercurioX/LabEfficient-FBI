from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.lab_result import LabResult
from app.models.parameter_mapping import ParameterMapping

DISPLAY_ORDER = {
    "Natrium": 1, "Kalium": 2, "Glucose": 3, "Creatinin": 4,
    "Gesamt-Bilirubin": 5, "GOT": 6, "GPT": 7, "GGT": 8,
    "CK gesamt": 9, "Amylase": 10, "Lipase": 11, "C-reaktives Protein": 12,
    "Leukozyten": 20, "Erythrozyten": 21, "Hämoglobin": 22,
    "Hämatokrit": 23, "MCV": 24, "MCH": 25, "MCHC": 26, "Thrombozyten": 27,
    # Gerinnung
    "INR": 30, "Quick": 31, "PTT": 32,
    # Akutbestimmungen
    "Laktat": 40, "Troponin": 41, "BNP": 42,
}


def lookup_canonical(db: Session, original_name: str) -> tuple[str | None, str | None]:
    """Gibt (canonical_name, category) zurück."""
    match = db.query(ParameterMapping).filter(
        func.lower(ParameterMapping.alias) == original_name.strip().lower()
    ).first()
    return (match.canonical_name, match.category) if match else (None, None)


def enrich_result(db: Session, result: LabResult) -> None:
    """Setzt canonical_name, category und display_order falls noch nicht gesetzt."""
    if not result.canonical_name:
        result.canonical_name, result.category = lookup_canonical(db, result.original_name)
    if result.canonical_name and not result.display_order:
        result.display_order = DISPLAY_ORDER.get(result.canonical_name, 999)

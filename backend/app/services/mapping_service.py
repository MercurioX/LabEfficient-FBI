from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.lab_result import LabResult
from app.models.parameter_mapping import ParameterMapping

DISPLAY_ORDER = {
    # Klinische Chemie
    "Natrium": 1, "Kalium": 2, "Calcium": 3, "Magnesium": 4,
    "Phosphat": 5, "Chlorid": 6, "Glucose": 7, "GFR (CKD-EPI)": 8,
    "Creatinin": 9, "Harnstoff": 10, "Harnsäure": 11,
    "Gesamt-Bilirubin": 12, "GOT": 13, "GPT": 14, "GLDH": 15, "GGT": 16,
    "Alkalische Phosphatase": 17, "LDH": 18, "CK gesamt": 19,
    "Amylase": 20, "Lipase": 21, "Eisen": 22, "Gesamteiweiß": 23, "Albumin": 24,
    # Gerinnung
    "INR": 30, "Quick": 31, "PTT": 32,
    # Hämatologie
    "Leukozyten": 40, "Erythrozyten": 41, "Hämoglobin": 42, "Hämatokrit": 43,
    "MCV": 44, "MCH": 45, "MCHC": 46, "Thrombozyten": 47, "MPV": 48,
    "% Normoblasten": 49, "Neutrophile": 50, "Lymphozyten": 51,
    "Monozyten": 52, "Eosinophile": 53, "Basophile": 54,
    "% Neutrophile": 55, "% Lymphozyten": 56, "% Monozyten": 57,
    "% Eosinophile": 58, "% Basophile": 59,
    "Unreife Granulozyten": 60, "% Unreife Granulozyten": 61,
    # Akutbestimmungen / TDM / Drogen
    "C-reaktives Protein": 70, "Laktat": 71, "Troponin": 72, "BNP": 73,
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

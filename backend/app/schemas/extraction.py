from pydantic import BaseModel


class PatientData(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    birth_date: str | None = None        # ISO-Format "YYYY-MM-DD"
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
    confidence: str = "high"             # "high" | "low"


class ExtractionResult(BaseModel):
    patient: PatientData
    results: list[LabResultData]

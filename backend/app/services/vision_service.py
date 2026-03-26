from openai import AzureOpenAI

from app.core.config import settings
from app.schemas.extraction import ExtractionResult

SYSTEM_PROMPT = """\
Du extrahierst Informationen aus externen Laborbefunden.
Gib ausschließlich valides JSON im vorgegebenen Schema zurück. Erfinde keine Werte.
Setze confidence='low' wenn ein Wert schlecht lesbar oder unsicher ist.
Mappe Synonyme auf Standardnamen:
AST/ASAT→GOT | ALT/ALAT→GPT | Gamma-GT/γ-GT→GGT
CK/CPK/Kreatinkinase→CK gesamt | BILG/Bilirubin gesamt→Gesamt-Bilirubin
WBC→Leukozyten | RBC→Erythrozyten | Hb→Hämoglobin | Hkt→Hämatokrit | Thrombos→Thrombozyten
INR/International Normalized Ratio→INR | Quick-Wert→Quick | PTT/Partielle Thromboplastinzeit→PTT
Lactat→Laktat | Troponin I/Troponin T→Troponin | NT-proBNP→BNP

Antworte immer mit folgendem JSON-Schema:
{
  "patient": {
    "first_name": "...",
    "last_name": "...",
    "birth_date": "YYYY-MM-DD",
    "sample_date": "YYYY-MM-DD",
    "external_lab_name": "..."
  },
  "results": [
    {
      "original_name": "...",
      "canonical_name": "...",
      "value": 0.0,
      "unit": "...",
      "reference_range_text": "...",
      "reference_min": 0.0,
      "reference_max": 0.0,
      "confidence": "high"
    }
  ]
}
"""

_client = AzureOpenAI(
    azure_endpoint=settings.azure_openai_endpoint,
    api_key=settings.azure_openai_api_key,
    api_version="2024-02-01",
)


def extract_from_image(base64_image: str) -> ExtractionResult:
    response = _client.chat.completions.create(
        model=settings.azure_openai_deployment,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{base64_image}"},
                    }
                ],
            },
        ],
        response_format={"type": "json_object"},
        max_tokens=4096,
    )
    return ExtractionResult.model_validate_json(response.choices[0].message.content)

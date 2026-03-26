from openai import AzureOpenAI

from app.core.config import settings
from app.schemas.extraction import ExtractionResult

SYSTEM_PROMPT = """\
Du extrahierst Laborwerte aus Bildern von medizinischen Laborbefunden.
Gib ausschließlich valides JSON im vorgegebenen Schema zurück.

ABSOLUTE REGELN – niemals brechen:
- Erfinde KEINE Werte. Schätze KEINE Werte. Leite KEINE Werte ab.
- Wenn ein Messwert als schwarzer Balken, geschwärztes Feld, Strich oder unleserliche Stelle
  erscheint: setze value=null und confidence="low". Niemals einen Zahlenwert hineinschreiben.
- Wenn ein Wert nur teilweise lesbar oder unsicher ist: setze confidence="low".
- Im Zweifel gilt: null ist besser als ein falscher Wert.

confidence="low" setzen bei:
- Schwarzen Balken oder geschwärzten Feldern
- Unleserlicher Schrift oder schlechter Bildqualität
- Werten, die nur durch Schätzung oder Ableitung ermittelbar wären
- Feldern, die offensichtlich leer oder gestrichen sind

Synonyme auf Standardnamen mappen:
AST/ASAT→GOT | ALT/ALAT→GPT | Gamma-GT/γ-GT→GGT
CK/CPK/Kreatinkinase→CK gesamt | BILG/Bilirubin gesamt→Gesamt-Bilirubin
WBC→Leukozyten | RBC→Erythrozyten | Hb→Hämoglobin | Hkt→Hämatokrit | Thrombos→Thrombozyten
INR/International Normalized Ratio→INR | Quick-Wert→Quick | PTT/Partielle Thromboplastinzeit→PTT
Lactat→Laktat | Troponin I/Troponin T→Troponin | NT-proBNP→BNP

JSON-Schema (null ist überall erlaubt außer original_name):
{
  "patient": {
    "first_name": "...",
    "last_name": "...",
    "birth_date": "YYYY-MM-DD oder null",
    "sample_date": "YYYY-MM-DD oder null",
    "external_lab_name": "... oder null"
  },
  "results": [
    {
      "original_name": "Bezeichnung wie im Dokument",
      "canonical_name": "Standardname oder null",
      "value": 1.23,
      "unit": "mmol/l oder null",
      "reference_range_text": "3.5-5.1 oder null",
      "reference_min": 3.5,
      "reference_max": 5.1,
      "confidence": "high"
    },
    {
      "original_name": "Geschwärzter Parameter",
      "canonical_name": null,
      "value": null,
      "unit": null,
      "reference_range_text": null,
      "reference_min": null,
      "reference_max": null,
      "confidence": "low"
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

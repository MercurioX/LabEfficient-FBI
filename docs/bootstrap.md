# LabEfficient – Dokumentationsindex

Dieses Dokument dient als Einstiegspunkt. Die Details sind in thematische Dateien aufgeteilt:

| Datei | Inhalt |
|---|---|
| [overview.md](overview.md) | Zielbild, Architekturübersicht, Demo-Story |
| [architecture.md](architecture.md) | Tech-Stack, Projektstruktur, Docker-Setup |
| [requirements.md](requirements.md) | Fachliche Anforderungen, Laborparameter, Synonym-Mapping |
| [data-model.md](data-model.md) | SQLite-Schema, JSON-Extraktionsschema |
| [api.md](api.md) | API-Endpunkte (FastAPI) |
| [ai-pipeline.md](ai-pipeline.md) | KI-Pipeline, Prompt-Strategie, Risiken |
| [frontend.md](frontend.md) | Frontend-Seiten und UI-Konzept |
| [logic.md](logic.md) | Normabweichungslogik |
| [implementation-plan.md](implementation-plan.md) | Hackathon-Phasen, Definition of Done, Nächste Schritte |
| [implementation-steps.md](implementation-steps.md) | **Schritt-für-Schritt Implementierungsanleitung** mit Code-Beispielen |

## Kurzübersicht

**LabEfficient** ist ein Hackathon-PoC zur Standardisierung externer PDF-Laborbefunde.

- **Frontend:** React 18 + Vite + TypeScript + MUI + Recharts
- **Backend:** Python 3.11 + FastAPI + SQLAlchemy + SQLite
- **KI:** Azure OpenAI für strukturierte Extraktion aus PDFs
- **DevOps:** Docker Compose (frontend + backend)

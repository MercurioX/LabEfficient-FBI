# LabEfficient – Bootstrap für die Implementierung

## 1. Zielbild

LabEfficient ist ein Proof of Concept zur standardisierten Aufbereitung externer Laborbefunde für die schnellere Bewertung durch Klinikärztinnen und Klinikärzte.

### Ziel des PoC
- PDF-Laborbefunde hochladen
- relevante Informationen aus Kopfbereich und Labortabelle extrahieren
- uneinheitliche Laborbezeichnungen auf ein Standard-Template mappen
- Normabweichungen automatisiert markieren
- Vorwerte in einer Verlaufssicht darstellen

### Nicht-Ziel im Hackathon
- Vollständige Integration in ein klinisches Produktivsystem
- direkte Integration in LAURIS
- medizinische Freigabelogik oder rechtsverbindliche Befundung

Die Challenge priorisiert genau diese Schritte: PDF-Extraktion und Standardisierung, Markierung von Normabweichungen und danach die Darstellung von Vorwerten. Eine spätere Integration in LAURIS ist ausdrücklich nur Fernziel. :contentReference[oaicite:2]{index=2} :contentReference[oaicite:3]{index=3}

---

## 2. Technische Architektur

### Frontend
- **React 18**
- Vite
- TypeScript
- UI: MUI oder Ant Design
- Charting: Recharts
- State Management: React Query + Zustand

### Backend
- **Python**
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic
- pdfplumber / PyMuPDF für PDF-Extraktion
- Azure OpenAI / Azure AI Vision für OCR + strukturierte Extraktion

### Datenbank
- **SQLite**
- lokal lauffähig für PoC
- einfache Persistenz von Uploads, Befunden, Parametern, Mapping-Regeln und Historie

### Cloud / KI
- **Azure Cloud**
  - Azure OpenAI für strukturierte Extraktion und Normalisierung
  - optional Azure Document Intelligence oder OCR für schwierige Scans
  - Bild-/Dokumenterkennung per LLM-gestützter Pipeline

### Betriebsmodell
- lokaler Hackathon-Setup via Docker Compose
- 3 Container:
  - frontend
  - backend
  - optional reverse proxy
- SQLite als Dateibank im Backend-Container oder lokal gemountet

---

## 3. Architekturübersicht

```text
[React Frontend]
    |
    v
[FastAPI Backend]
    |---- PDF Upload / Parsing
    |---- Normalisierung / Mapping
    |---- Abweichungsanalyse
    |---- Verlauf / Historie
    |
    +--> [SQLite]
    |
    +--> [Azure OCR / Azure OpenAI]
````

### Kernidee der Verarbeitung

1. PDF wird hochgeladen
2. Backend extrahiert Rohtext und Tabellen aus dem PDF
3. Azure verarbeitet unstrukturierte Inhalte zu einem definierten JSON-Schema
4. Backend mappt Synonyme auf Standard-Laborparameter
5. Referenzbereich und Messwert werden verglichen
6. Ergebnis wird im Standard-Template gespeichert
7. Frontend zeigt:

  * Patientenkopf
  * standardisierte Laborliste
  * Markierungen für Abweichungen
  * Verlaufsgrafiken vorhandener Vorwerte

---

## 4. Fachliche Anforderungen

## 4.1 Zu extrahierende Kopfdaten

Aus dem Befundkopf müssen extrahiert werden:

* Nachname
* Vorname
* Geburtsdatum
* Eingangsdatum bzw. Entnahmedatum
* Name des externen Labors

Diese Felder sind explizit Teil der Challenge.

## 4.2 Zu extrahierende Werte pro Laborparameter

Für jeden Laborparameter:

* Bezeichnung
* Messergebnis
* Maßeinheit
* Referenzbereich

Auch diese vier Elemente sind explizit gefordert.

## 4.3 Relevante Besonderheiten

Die Software muss mit diesen Problemen umgehen:

* unterschiedliche Reihenfolge der Werte
* unterschiedliche Bezeichnungen, z. B. CPK vs. CK
* unterschiedliche Referenzbereiche
* fehlende Werte
* fehlende Vorwerte

Diese Pain Points sind in beiden Dokumenten hervorgehoben.

---

## 5. Standardisiertes Domänenmodell

## 5.1 Standardisierte Laborparameter

Für den PoC sollten zunächst die unter Immuntherapie besonders relevanten Parameter priorisiert werden:

* Natrium
* Kalium
* Glucose
* Creatinin
* Gesamt-Bilirubin
* GOT
* GPT
* GGT
* CK gesamt
* Amylase
* Lipase
* C-reaktives Protein
* Blutbild:

  * Leukozyten
  * Erythrozyten
  * Hämoglobin
  * Hämatokrit
  * MCV
  * MCH
  * MCHC
  * Thrombozyten

Diese Parameter sind im Manual als besonders relevant genannt.

## 5.2 Synonym-Mapping

Beispiele:

* `CK`, `CPK`, `Kreatinkinase` -> `CK gesamt`
* `AST`, `ASAT` -> `GOT`
* `ALT`, `ALAT` -> `GPT`
* `Gamma-GT`, `γ-GT` -> `GGT`
* `Bilirubin gesamt`, `BILG` -> `Gesamt-Bilirubin`
* `Glukose`, `Blutzucker` -> `Glucose`
* `Crea`, `Kreatinin` -> `Creatinin`
* `CRP` -> `C-reaktives Protein`
* `WBC` -> `Leukozyten`
* `RBC` -> `Erythrozyten`
* `Hb` -> `Hämoglobin`
* `Hkt` -> `Hämatokrit`
* `Thrombos` -> `Thrombozyten`

Das Mapping orientiert sich an den Synonymen im Manual und am Beispiel „Leberwerte“ in den Slides.

## 5.3 Ziel-Template

Die gewünschte Anordnung enthält u. a. die Blöcke:

* Klinische Chemie
* Gerinnung
* Hämatologie
* Akutbestimmungen / TDM / Drogen

Darin stehen die Parameter in fachlich definierter Reihenfolge statt in beliebiger Laborreihenfolge. Das ist auf den Template-Seiten dargestellt.

---

## 6. Datenmodell (SQLite)

## 6.1 Tabellen

### patients

* id
* first_name
* last_name
* birth_date

### labs

* id
* patient_id
* external_lab_name
* sample_date
* upload_filename
* upload_timestamp
* raw_text
* source_pdf_path
* processing_status

### lab_results

* id
* lab_id
* canonical_name
* original_name
* value_numeric
* unit
* ref_min
* ref_max
* ref_text
* is_high
* is_low
* is_out_of_range
* display_order
* category

### parameter_mappings

* id
* alias
* canonical_name
* category
* default_unit

### extraction_runs

* id
* lab_id
* provider
* model_name
* prompt_version
* raw_response_json
* confidence_score
* created_at

---

## 7. API-Design

## 7.1 Upload & Verarbeitung

### POST `/api/labs/upload`

Upload eines PDFs.

**Request**

* multipart/form-data

  * file

**Response**

```json
{
  "lab_id": 123,
  "status": "uploaded"
}
```

### POST `/api/labs/{lab_id}/process`

Startet OCR, Extraktion, Mapping und Abweichungsprüfung.

**Response**

```json
{
  "lab_id": 123,
  "status": "processed"
}
```

### GET `/api/labs/{lab_id}`

Liefert den vollständigen standardisierten Befund.

### GET `/api/labs/{lab_id}/timeline`

Liefert Vorwerte je Parameter für Verlaufsgrafiken.

### GET `/api/patients/search?q=...`

Findet Patientinnen und Patienten anhand Name + Geburtsdatum.

---

## 8. JSON-Zielschema für die KI-Extraktion

```json
{
  "patient": {
    "first_name": "",
    "last_name": "",
    "birth_date": "",
    "sample_date": "",
    "external_lab_name": ""
  },
  "results": [
    {
      "original_name": "",
      "canonical_name": "",
      "value": 0.0,
      "unit": "",
      "reference_range_text": "",
      "reference_min": null,
      "reference_max": null
    }
  ]
}
```

### Extraktionsregeln

* nur Werte extrahieren, die im Dokument tatsächlich vorhanden sind
* keine Werte halluzinieren
* Originalbezeichnung immer mitgeben
* wenn Referenzbereich nur als `<190` vorliegt:

  * `reference_min = null`
  * `reference_max = 190`
* wenn Referenzbereich nicht sicher erkennbar:

  * `reference_range_text` befüllen
  * Min/Max leer lassen
* unbekannte Parameter trotzdem extrahieren, aber `canonical_name = null`

---

## 9. KI-Pipeline

## 9.1 Verarbeitungsschritte

1. PDF entgegennehmen
2. Text und Tabellen extrahieren
3. Falls Scanqualität schlecht: OCR über Azure
4. LLM-Prompt mit Schema + Mapping-Hinweisen
5. Rückgabe als valides JSON
6. Backend validiert JSON mit Pydantic
7. Synonym-Mapping und Anordnung nach Template
8. Referenzbereichsprüfung
9. Speicherung in SQLite
10. Anzeige im Frontend

## 9.2 Prompt-Strategie

Der Prompt soll:

* Kopfbereich extrahieren
* Labortabelle lesen
* Synonyme auf kanonische Namen abbilden
* fehlende Werte nicht erfinden
* unsichere Werte markieren
* ausschließlich JSON zurückgeben

### Beispiel System Prompt

```text
Du extrahierst Informationen aus externen Laborbefunden.
Gib ausschließlich JSON im vorgegebenen Schema zurück.
Erfinde keine Werte.
Mappe bekannte Synonyme auf Standardnamen, z.B.:
AST/ASAT -> GOT
ALT/ALAT -> GPT
Gamma-GT/γ-GT -> GGT
CK/CPK/Kreatinkinase -> CK gesamt
BILG/Bilirubin gesamt -> Gesamt-Bilirubin
WBC -> Leukozyten
RBC -> Erythrozyten
Hb -> Hämoglobin
Hkt -> Hämatokrit
Thrombos -> Thrombozyten
```

---

## 10. Frontend-Seiten

## 10.1 Upload-Seite

* Drag & Drop PDF Upload
* Anzeige Dateiname
* Button „Verarbeiten“

## 10.2 Befunddetail-Seite

### Kopfbereich

* Name
* Vorname
* Geburtsdatum
* Entnahmedatum
* externes Labor

### Standardisierte Labortabelle

Spalten:

* Kategorie
* Standardname
* Originalname
* Wert
* Einheit
* Referenzbereich
* Status

### Statusdarstellung

* normal
* erhöht
* erniedrigt
* Referenzbereich unbekannt

## 10.3 Verlaufssicht

* Auswahl eines Parameters
* Liniendiagramm über mehrere Befunde

Die Verlaufsgrafik ist Priorität 3 und damit nice-to-have für den PoC, aber sinnvoll als Demo-Feature.

---

## 11. Logik zur Markierung von Normabweichungen

## 11.1 Basisregel

Ein Wert ist auffällig, wenn:

* Wert < Referenzminimum
* oder Wert > Referenzmaximum
* oder bei einseitigen Referenzen:

  * Wert > Maximum
  * bzw. Wert < Minimum

## 11.2 Beispiele

* Referenz `< 60`, Wert `66` -> erhöht
* Referenz `3.5 - 5.1`, Wert `3.2` -> erniedrigt
* Referenz unbekannt -> keine automatische Klassifikation

Das Manual betont, dass die wichtigste Funktion die Markierung von Abweichungen zum Referenzbereich ist.

## 11.3 Erweiterung

Optional:

* CTCAE-Klassifikation als spätere Ausbaustufe
* im PoC nur vorbereitete Datenstruktur, noch keine vollständige medizinische Regel-Engine

Das Dokument nennt CTCAE als mögliche weitergehende Klassifikation, aber nicht als Kern des PoC.

---

## 12. Projektstruktur

```text
labefficient/
├─ frontend/
│  ├─ src/
│  │  ├─ pages/
│  │  ├─ components/
│  │  ├─ services/
│  │  ├─ hooks/
│  │  └─ types/
│  └─ package.json
├─ backend/
│  ├─ app/
│  │  ├─ api/
│  │  ├─ core/
│  │  ├─ models/
│  │  ├─ schemas/
│  │  ├─ services/
│  │  ├─ repositories/
│  │  └─ main.py
│  ├─ alembic/
│  └─ requirements.txt
├─ data/
├─ docker-compose.yml
└─ README.md
```

---

## 13. Implementierungsreihenfolge für den Hackathon

## Phase 1 – MVP

* React-Frontend mit Upload
* FastAPI Upload Endpoint
* PDF lokal speichern
* Dummy-Parsing mit Mock-Daten
* Ergebnisansicht im Frontend

## Phase 2 – echte Extraktion

* PDF-Text extrahieren
* Azure-basierte Extraktion integrieren
* JSON-Schema validieren
* Kopfbereich + Laborwerte speichern

## Phase 3 – Standardisierung

* Alias-Mapping umsetzen
* Zielreihenfolge nach Template abbilden
* Kategorien vergeben

## Phase 4 – klinischer Mehrwert

* Normabweichungen markieren
* farbliche Kennzeichnung
* Timeline pro Parameter

## Phase 5 – Demo-Härtung

* Fehlerfälle abfangen
* Demo-Datensätze vorbereiten
* 2–3 Beispielbefunde mit unterschiedlicher Struktur

---

## 14. Definition of Done

## Muss

* PDF kann hochgeladen werden
* Kopfbereich wird extrahiert
* Laborparameter werden extrahiert
* Synonyme werden normalisiert
* Werte werden im Standard-Template angezeigt
* Normabweichungen werden markiert

## Soll

* Verlaufsgrafik über mehrere Befunde
* unsichere OCR-/LLM-Felder kenntlich machen
* einfache Suchfunktion nach Patient

## Kann

* CTCAE-Vorstufe
* Export als PDF / JSON
* Review-Modus für ärztliche Validierung

---

## 15. Risiken und Gegenmaßnahmen

### Risiko 1: Schlechte Scanqualität

**Gegenmaßnahme:** OCR-Fallback, manuelle Rohtextansicht

### Risiko 2: Halluzinationen des LLM

**Gegenmaßnahme:** striktes JSON-Schema, keine frei formulierte Antwort, Backend-Validierung

### Risiko 3: Uneinheitliche Referenzbereiche

**Gegenmaßnahme:** Referenztext immer speichern, Min/Max nur wenn sicher parsebar

### Risiko 4: Falsches Synonym-Mapping

**Gegenmaßnahme:** Mapping-Tabelle im Backend versionieren und erweiterbar halten

### Risiko 5: Zeitmangel im Hackathon

**Gegenmaßnahme:** Fokus auf Priorität 1 + 2, Verlauf nur als Bonus

---

## 16. Demo-Story

1. User lädt einen gescannten Fremdlaborbefund hoch
2. System extrahiert Kopfbereich und Laborwerte
3. Uneinheitliche Namen werden standardisiert
4. Werte erscheinen in fester klinischer Reihenfolge
5. Auffällige Werte werden markiert
6. Falls Vorwerte existieren, wird ein Verlauf angezeigt

---

## 17. Tech-Stack konkret

## Frontend

* React 18
* Vite
* TypeScript
* MUI
* React Query
* Recharts

## Backend

* Python 3.11
* FastAPI
* Uvicorn
* SQLAlchemy
* Pydantic
* PyMuPDF oder pdfplumber

## KI / Azure

* Azure OpenAI
* optional Azure Document Intelligence

## Datenbank

* SQLite

## DevOps

* Docker
* Docker Compose

---

## 18. Nächste Schritte direkt nach dem Bootstrap

1. Repo anlegen
2. Docker Compose aufsetzen
3. FastAPI + React Grundgerüst erzeugen
4. SQLite Schema erstellen
5. Upload-Endpunkt bauen
6. Mock-Response im Frontend darstellen
7. Azure Extraktionsservice anschließen
8. Mapping und Abweichungslogik ergänzen

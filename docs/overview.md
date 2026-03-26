# LabEfficient – Zielbild & Architekturübersicht

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

---

## 2. Architekturübersicht

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
```

### Kernidee der Verarbeitung

1. PDF wird hochgeladen
2. Backend extrahiert Rohtext und Tabellen aus dem PDF
3. Azure verarbeitet unstrukturierte Inhalte zu einem definierten JSON-Schema
4. Backend mappt Synonyme auf Standard-Laborparameter
5. Referenzbereich und Messwert werden verglichen
6. Ergebnis wird im Standard-Template gespeichert
7. Frontend zeigt:
   - Patientenkopf
   - standardisierte Laborliste
   - Markierungen für Abweichungen
   - Verlaufsgrafiken vorhandener Vorwerte

---

## 3. Demo-Story

1. User lädt einen gescannten Fremdlaborbefund hoch
2. System extrahiert Kopfbereich und Laborwerte
3. Uneinheitliche Namen werden standardisiert
4. Werte erscheinen in fester klinischer Reihenfolge
5. Auffällige Werte werden markiert
6. Falls Vorwerte existieren, wird ein Verlauf angezeigt

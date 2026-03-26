# LabEfficient – Implementierungsplan

## Hackathon-Phasen

### Phase 1 – MVP Grundgerüst
- React-Frontend mit Import-Seite (Folder-Eingabe + Start-Button)
- FastAPI: Massenimport-Endpoint (`POST /api/import/start`)
- PDFs aus Folder auslesen, in DB als `queued` anlegen
- Mock-Extraktion (Dummy-JSON statt echter Azure-Call)
- Split-View mit PDF-Viewer und statischen Mock-Daten

### Phase 2 – Azure Vision Integration
- PDF-Seiten als Bild rendern (PyMuPDF / pdf2image)
- Azure Vision / GPT-4o Vision anschließen
- JSON-Schema validieren (Pydantic)
- Kopfbereich + Laborwerte speichern mit Status `pending_review`
- Batch-Fortschritt im Frontend anzeigen

### Phase 3 – Standardisierung & Normabweichung
- Synonym-Mapping aus `parameter_mappings`-Tabelle anwenden
- Zielreihenfolge nach Template / Kategorien
- Referenzbereichsprüfung → `is_high`, `is_low`, `is_out_of_range`
- Confidence-Felder aus Vision-Antwort übernehmen

### Phase 4 – Review-Workflow
- Split-View: editierbare Felder für Korrektur
- Speichern von Korrekturen (`is_corrected`, `corrected_by`)
- „Freigeben"-Button → Status `approved`
- „Zurückweisen"-Button → Status `rejected`
- Review-Queue: Liste aller `pending_review`-Befunde

### Phase 5 – Befundansicht & Verlauf
- Befundansicht zeigt nur `approved`-Befunde
- farbliche Kennzeichnung von Normabweichungen
- Patientensuche
- Timeline / Verlaufsgrafik pro Parameter (Recharts)

### Phase 6 – Demo-Härtung
- Fehlerfälle abfangen (failed-Status, Fehlerlog)
- 2–3 Beispiel-PDFs mit unterschiedlicher Struktur
- Demo-Datensatz vorbereiten (inkl. Vorwerte für Verlaufsgrafik)

---

## Definition of Done

### Muss
- Massenimport aus Folder funktioniert
- Azure Vision extrahiert Patientendaten und Laborwerte
- Split-View zeigt PDF und extrahierte Daten nebeneinander
- Korrekturen können gespeichert werden
- Freigabe-Workflow (approve / reject) funktioniert
- Befundansicht zeigt nur freigegebene Befunde
- Normabweichungen sind markiert

### Soll
- Verlaufsgrafik über mehrere freigegebene Befunde
- Unsichere Felder (confidence: low) visuell kennzeichnen
- Patientensuche

### Kann
- CTCAE-Vorstufe
- Export als PDF / JSON
- Batch-Fehlerreport

---

## Nächste Schritte

1. Docker Compose aufsetzen (frontend + backend)
2. FastAPI + React Grundgerüst erzeugen
3. SQLite-Schema mit Alembic anlegen (`import_batches`, `labs`, `lab_results`, `parameter_mappings`)
4. Import-Endpoint + Folder-Scan implementieren
5. PDF-zu-Bild-Rendering (PyMuPDF) + Mock-Azure-Call
6. Split-View im Frontend mit PDF-Viewer
7. Azure Vision anbinden
8. Review-Workflow (Korrektur + Freigabe)
9. Befundansicht mit Normabweichungen

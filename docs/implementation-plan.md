# LabEfficient – Implementierungsplan

## Hackathon-Phasen

### Phase 1 – MVP
- React-Frontend mit Upload
- FastAPI Upload Endpoint
- PDF lokal speichern
- Dummy-Parsing mit Mock-Daten
- Ergebnisansicht im Frontend

### Phase 2 – Echte Extraktion
- PDF-Text extrahieren (pdfplumber / PyMuPDF)
- Azure-basierte Extraktion integrieren
- JSON-Schema validieren
- Kopfbereich + Laborwerte speichern

### Phase 3 – Standardisierung
- Alias-Mapping umsetzen
- Zielreihenfolge nach Template abbilden
- Kategorien vergeben

### Phase 4 – Klinischer Mehrwert
- Normabweichungen markieren
- farbliche Kennzeichnung
- Timeline pro Parameter

### Phase 5 – Demo-Härtung
- Fehlerfälle abfangen
- Demo-Datensätze vorbereiten
- 2–3 Beispielbefunde mit unterschiedlicher Struktur

---

## Definition of Done

### Muss
- PDF kann hochgeladen werden
- Kopfbereich wird extrahiert
- Laborparameter werden extrahiert
- Synonyme werden normalisiert
- Werte werden im Standard-Template angezeigt
- Normabweichungen werden markiert

### Soll
- Verlaufsgrafik über mehrere Befunde
- unsichere OCR-/LLM-Felder kenntlich machen
- einfache Suchfunktion nach Patient

### Kann
- CTCAE-Vorstufe
- Export als PDF / JSON
- Review-Modus für ärztliche Validierung

---

## Nächste Schritte

1. Repo anlegen
2. Docker Compose aufsetzen
3. FastAPI + React Grundgerüst erzeugen
4. SQLite Schema erstellen
5. Upload-Endpunkt bauen
6. Mock-Response im Frontend darstellen
7. Azure Extraktionsservice anschließen
8. Mapping und Abweichungslogik ergänzen

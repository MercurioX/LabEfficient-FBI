# LabEfficient – KI-Pipeline

## Primärer Ansatz: Azure Vision Model

PDFs werden direkt als Bild an das Azure Vision Model geschickt. Das Modell erkennt Struktur, Text und Tabellen visuell – ohne vorherige Texterkennung mit pdfplumber/PyMuPDF.

---

## Verarbeitungsschritte pro PDF

1. PDF aus dem Import-Ordner einlesen
2. PDF-Seite(n) als Bild rendern (z.B. via PyMuPDF / pdf2image)
3. Bild(er) an **Azure Vision Model** senden (GPT-4o Vision oder Azure Document Intelligence)
4. Rückgabe als strukturiertes JSON (Patient + Laborwerte)
5. Backend validiert JSON mit **Pydantic**
6. **Synonym-Mapping** auf kanonische Parameternamen
7. **Referenzbereichsprüfung** → `is_high`, `is_low`, `is_out_of_range`
8. Speicherung in SQLite mit Status `pending_review`
9. Bereitstellung für Split-View im Frontend

---

## Prompt-Strategie

Der Prompt soll:
- Kopfbereich extrahieren (Patient, Datum, Labor)
- Labortabelle lesen
- Synonyme auf kanonische Namen abbilden
- fehlende Werte nicht erfinden
- unsichere Werte markieren (`confidence: low`)
- ausschließlich JSON zurückgeben

### System Prompt (Beispiel)

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

## Massenimport-Steuerung

- Jeder Import wird als `ImportBatch` in der DB gespeichert
- PDFs werden sequenziell oder parallel verarbeitet (konfigurierbar)
- Status je PDF: `queued` → `processing` → `pending_review` / `failed`
- Fehlerhafte PDFs landen in einem Fehler-Log, blockieren den Rest nicht

---

## Risiken & Gegenmaßnahmen

| Risiko | Gegenmaßnahme |
|---|---|
| Schlechte Scan-/Bildqualität | Fehler-Status + manuelle Korrektur in Split-View |
| Halluzinationen des LLM | Striktes JSON-Schema, Pydantic-Validierung, menschliche Freigabe |
| Uneinheitliche Referenzbereiche | `ref_text` immer speichern, `ref_min`/`ref_max` nur wenn sicher parsebar |
| Falsches Synonym-Mapping | Mapping-Tabelle in DB, versioniert und erweiterbar |
| Massenimport schlägt teilweise fehl | Batch-Status pro PDF, Fehlerbericht nach Import |

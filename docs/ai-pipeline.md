# LabEfficient – KI-Pipeline

## Verarbeitungsschritte

1. PDF entgegennehmen
2. Text und Tabellen extrahieren (pdfplumber / PyMuPDF)
3. Falls Scanqualität schlecht: OCR über Azure Document Intelligence
4. LLM-Prompt mit Schema + Mapping-Hinweisen an Azure OpenAI
5. Rückgabe als valides JSON
6. Backend validiert JSON mit Pydantic
7. Synonym-Mapping und Anordnung nach Template
8. Referenzbereichsprüfung
9. Speicherung in SQLite
10. Anzeige im Frontend

---

## Prompt-Strategie

Der Prompt soll:
- Kopfbereich extrahieren
- Labortabelle lesen
- Synonyme auf kanonische Namen abbilden
- fehlende Werte nicht erfinden
- unsichere Werte markieren
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

## Risiken & Gegenmaßnahmen

| Risiko | Gegenmaßnahme |
|---|---|
| Schlechte Scanqualität | OCR-Fallback, manuelle Rohtextansicht |
| Halluzinationen des LLM | Striktes JSON-Schema, Backend-Validierung |
| Uneinheitliche Referenzbereiche | Referenztext immer speichern, Min/Max nur wenn sicher parsebar |
| Falsches Synonym-Mapping | Mapping-Tabelle versionieren und erweiterbar halten |

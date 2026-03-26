# LabEfficient – Frontend

## Seiten & Workflows

---

### 1. Import-Seite

**Zweck:** Massenimport starten und Verarbeitungsstatus verfolgen.

- Eingabe / Auswahl des Import-Ordners
- Button „Import starten"
- Fortschrittsanzeige je PDF (queued / processing / pending_review / failed)
- Link zu fehlerhaften PDFs
- Weiterleitung zur Review-Queue nach Abschluss

---

### 2. Review-Queue

**Zweck:** Übersicht aller Befunde, die auf Validierung warten.

- Liste aller Befunde mit Status `pending_review`
- Spalten: Dateiname, Patient (soweit erkannt), Entnahmedatum, Labor, Status
- Klick öffnet Split-View zur Validierung

---

### 3. Split-View (Review & Korrektur)

**Zweck:** Extrahierte Werte gegen das Original-PDF prüfen und bei Bedarf korrigieren.

**Layout:**
```
┌─────────────────────────┬─────────────────────────┐
│  Original-PDF (links)   │  Extrahierte Daten       │
│                         │  (rechts, editierbar)    │
│  [PDF-Viewer]           │  Kopfbereich:            │
│                         │  - Name, Vorname         │
│                         │  - Geburtsdatum          │
│                         │  - Entnahmedatum         │
│                         │  - externes Labor        │
│                         │                          │
│                         │  Laborwerte-Tabelle:     │
│                         │  editierbare Felder      │
│                         │                          │
│                         │  [Speichern]             │
│                         │  [Freigeben]             │
│                         │  [Zurückweisen]          │
└─────────────────────────┴─────────────────────────┘
```

**Editierbare Felder in der Laborwerte-Tabelle:**
- Wert (numerisch)
- Einheit
- Referenzbereich (min / max / text)
- Kanonischer Name (Korrektur des Mappings)

**Visuelle Hinweise:**
- Unsichere Felder (low confidence) farblich hervorgehoben
- Geänderte Felder werden als „korrigiert" markiert

---

### 4. Befundansicht (freigegebene Befunde)

**Zweck:** Standardisierte Ansicht freigegebener Laborbefunde für Klinikärzte.

**Kopfbereich:**
- Name, Vorname, Geburtsdatum, Entnahmedatum, externes Labor

**Standardisierte Labortabelle:**

| Spalte | Beschreibung |
|---|---|
| Kategorie | z.B. Klinische Chemie, Hämatologie |
| Standardname | kanonischer Parametername |
| Originalname | wie im PDF |
| Wert | numerischer Messwert |
| Einheit | z.B. mg/dl, mmol/l |
| Referenzbereich | aus dem PDF oder Standard |
| Status | normal / erhöht / erniedrigt / unbekannt |

**Statusdarstellung:**
- `normal`
- `erhöht` (rot / Pfeil hoch)
- `erniedrigt` (blau / Pfeil runter)
- `Referenzbereich unbekannt` (grau)

Nur Befunde mit Status `approved` sind hier sichtbar.

---

### 5. Verlaufssicht

**Zweck:** Entwicklung eines Laborwerts über mehrere Befunde verfolgen.

- Auswahl eines Parameters
- Liniendiagramm über mehrere freigegebene Befunde (Recharts)
- **Priorität 3** – nice-to-have für Demo

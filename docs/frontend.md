# LabEfficient – Frontend

## Seiten

### Upload-Seite
- Drag & Drop PDF Upload
- Anzeige Dateiname
- Button „Verarbeiten"

---

### Befunddetail-Seite

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

---

### Verlaufssicht
- Auswahl eines Parameters
- Liniendiagramm über mehrere Befunde (Recharts)
- **Priorität 3** – nice-to-have für Demo

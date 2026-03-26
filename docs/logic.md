# LabEfficient – Logik zur Markierung von Normabweichungen

## Basisregel

Ein Wert ist auffällig, wenn:
- Wert < Referenzminimum
- oder Wert > Referenzmaximum
- oder bei einseitigen Referenzen:
  - Wert > Maximum
  - bzw. Wert < Minimum

## Beispiele

| Referenz | Wert | Ergebnis |
|---|---|---|
| `< 60` | `66` | erhöht |
| `3.5 - 5.1` | `3.2` | erniedrigt |
| unbekannt | beliebig | keine automatische Klassifikation |

## Erweiterung (optional / spätere Ausbaustufe)

- CTCAE-Klassifikation als spätere Ausbaustufe
- Im PoC nur vorbereitete Datenstruktur, noch keine vollständige medizinische Regel-Engine

# LabEfficient – Fachliche Anforderungen & Domänenmodell

## 1. Zu extrahierende Kopfdaten

Aus dem Befundkopf müssen extrahiert werden:

- Nachname
- Vorname
- Geburtsdatum
- Eingangsdatum bzw. Entnahmedatum
- Name des externen Labors

## 2. Zu extrahierende Werte pro Laborparameter

Für jeden Laborparameter:

- Bezeichnung
- Messergebnis
- Maßeinheit
- Referenzbereich

## 3. Relevante Besonderheiten / Pain Points

- unterschiedliche Reihenfolge der Werte
- unterschiedliche Bezeichnungen, z. B. CPK vs. CK
- unterschiedliche Referenzbereiche
- fehlende Werte
- fehlende Vorwerte

---

## 4. Standardisierte Laborparameter (Priorität: Immuntherapie)

**Klinische Chemie**
- Natrium, Kalium, Glucose, Creatinin
- Gesamt-Bilirubin, GOT, GPT, GGT
- CK gesamt, Amylase, Lipase
- C-reaktives Protein

**Hämatologie / Blutbild**
- Leukozyten, Erythrozyten, Hämoglobin, Hämatokrit
- MCV, MCH, MCHC, Thrombozyten

---

## 5. Synonym-Mapping

| Alias(e) | Kanonischer Name |
|---|---|
| CK, CPK, Kreatinkinase | CK gesamt |
| AST, ASAT | GOT |
| ALT, ALAT | GPT |
| Gamma-GT, γ-GT | GGT |
| Bilirubin gesamt, BILG | Gesamt-Bilirubin |
| Glukose, Blutzucker | Glucose |
| Crea, Kreatinin | Creatinin |
| CRP | C-reaktives Protein |
| WBC | Leukozyten |
| RBC | Erythrozyten |
| Hb | Hämoglobin |
| Hkt | Hämatokrit |
| Thrombos | Thrombozyten |

---

## 6. Ziel-Template Struktur

Parameter werden in fachlich definierter Reihenfolge angezeigt – nicht in beliebiger Laborreihenfolge.

Blöcke:
- Klinische Chemie
- Gerinnung
- Hämatologie
- Akutbestimmungen / TDM / Drogen

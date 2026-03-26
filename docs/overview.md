# LabEfficient – Zielbild & Architekturübersicht

## 1. Zielbild

LabEfficient ist ein Proof of Concept zur standardisierten Aufbereitung externer Laborbefunde für die schnellere Bewertung durch Klinikärztinnen und Klinikärzte.

### Ziel des PoC
- PDFs aus einem Ordner per Massenimport einlesen
- Bilderkennung via Azure Vision: Patientendaten und Laborwerte extrahieren
- Extrahierte Werte in einer Split-View neben dem Original-PDF zur Prüfung anzeigen
- Manuelle Korrektur von Werten über die Oberfläche ermöglichen
- Freigabe nach Validierung durch den Anwender
- Freigegebene Befunde im Frontend einsehen (standardisiert, mit Normabweichungen)
- Vorwerte in einer Verlaufssicht darstellen

### Nicht-Ziel im Hackathon
- Vollständige Integration in ein klinisches Produktivsystem
- direkte Integration in LAURIS
- medizinische Freigabelogik oder rechtsverbindliche Befundung

---

## 2. Fachlicher Ablauf

```text
[Folder mit PDFs]
    |
    | Massenimport starten
    v
[Backend: Folder-Scan]
    |
    | PDF für PDF
    v
[Azure Vision Model]
    |
    | Patientendaten + Laborwerte (JSON)
    v
[Backend: Mapping + Normabweichung]
    |
    v
[Status: pending_review]
    |
    v
[Frontend: Split-View]
    |---- PDF-Anzeige (links)
    |---- Extrahierte Werte (rechts, editierbar)
    |---- Korrektur möglich
    |---- Button „Freigeben"
    |
    | Freigabe
    v
[Status: approved]
    |
    v
[Frontend: Befundansicht]
    |---- nur freigegebene Befunde
    |---- standardisierte Laborliste
    |---- Normabweichungen markiert
    |---- Verlaufsgrafik
```

---

## 3. Architekturübersicht

```text
[React Frontend]
    |
    v
[FastAPI Backend]
    |---- Massenimport / Folder-Scan
    |---- Azure Vision Extraktion
    |---- Normalisierung / Mapping
    |---- Abweichungsanalyse
    |---- Review & Freigabe
    |---- Verlauf / Historie
    |
    +--> [SQLite]
    |
    +--> [Azure Vision Model]
```

---

## 4. Demo-Story

1. Anwender startet Massenimport für einen Ordner mit PDFs
2. System erkennt alle PDFs und schickt sie nacheinander an Azure Vision
3. Extrahierte Daten (Patientenkopf + Laborwerte) erscheinen in der Split-View neben dem PDF
4. Anwender prüft und korrigiert bei Bedarf einzelne Werte
5. Anwender gibt den Befund frei
6. Freigegebener Befund erscheint in der standardisierten Befundansicht
7. Auffällige Werte sind farblich markiert
8. Falls Vorwerte vorhanden, wird eine Verlaufsgrafik angezeigt

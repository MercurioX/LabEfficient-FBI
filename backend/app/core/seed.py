from sqlalchemy.orm import Session
from app.models.parameter_mapping import ParameterMapping

MAPPINGS = [
    # alias, canonical_name, category, default_unit
    ("CK",              "CK gesamt",           "Klinische Chemie", "U/l"),
    ("CPK",             "CK gesamt",           "Klinische Chemie", "U/l"),
    ("Kreatinkinase",   "CK gesamt",           "Klinische Chemie", "U/l"),
    ("AST",             "GOT",                 "Klinische Chemie", "U/l"),
    ("ASAT",            "GOT",                 "Klinische Chemie", "U/l"),
    ("ALT",             "GPT",                 "Klinische Chemie", "U/l"),
    ("ALAT",            "GPT",                 "Klinische Chemie", "U/l"),
    ("Gamma-GT",        "GGT",                 "Klinische Chemie", "U/l"),
    ("γ-GT",            "GGT",                 "Klinische Chemie", "U/l"),
    ("Bilirubin gesamt","Gesamt-Bilirubin",    "Klinische Chemie", "mg/dl"),
    ("BILG",            "Gesamt-Bilirubin",    "Klinische Chemie", "mg/dl"),
    ("Glukose",         "Glucose",             "Klinische Chemie", "mg/dl"),
    ("Blutzucker",      "Glucose",             "Klinische Chemie", "mg/dl"),
    ("Crea",            "Creatinin",           "Klinische Chemie", "mg/dl"),
    ("Kreatinin",       "Creatinin",           "Klinische Chemie", "mg/dl"),
    ("CRP",             "C-reaktives Protein", "Klinische Chemie", "mg/l"),
    ("WBC",             "Leukozyten",          "Hämatologie",      "/nl"),
    ("RBC",             "Erythrozyten",        "Hämatologie",      "T/l"),
    ("Hb",              "Hämoglobin",          "Hämatologie",      "g/dl"),
    ("Hkt",             "Hämatokrit",          "Hämatologie",      "%"),
    ("Thrombos",        "Thrombozyten",        "Hämatologie",      "/nl"),
    # Kanonische Namen als Selbst-Mapping (damit Lookup auch bei korrekter Bezeichnung trifft)
    ("Natrium",             "Natrium",             "Klinische Chemie", "mmol/l"),
    ("Kalium",              "Kalium",              "Klinische Chemie", "mmol/l"),
    ("Glucose",             "Glucose",             "Klinische Chemie", "mg/dl"),
    ("Creatinin",           "Creatinin",           "Klinische Chemie", "mg/dl"),
    ("Gesamt-Bilirubin",    "Gesamt-Bilirubin",    "Klinische Chemie", "mg/dl"),
    ("GOT",                 "GOT",                 "Klinische Chemie", "U/l"),
    ("GPT",                 "GPT",                 "Klinische Chemie", "U/l"),
    ("GGT",                 "GGT",                 "Klinische Chemie", "U/l"),
    ("CK gesamt",           "CK gesamt",           "Klinische Chemie", "U/l"),
    ("Amylase",             "Amylase",             "Klinische Chemie", "U/l"),
    ("Lipase",              "Lipase",              "Klinische Chemie", "U/l"),
    ("C-reaktives Protein", "C-reaktives Protein", "Klinische Chemie", "mg/l"),
    ("Leukozyten",          "Leukozyten",          "Hämatologie",      "/nl"),
    ("Erythrozyten",        "Erythrozyten",        "Hämatologie",      "T/l"),
    ("Hämoglobin",          "Hämoglobin",          "Hämatologie",      "g/dl"),
    ("Hämatokrit",          "Hämatokrit",          "Hämatologie",      "%"),
    ("MCV",                 "MCV",                 "Hämatologie",      "fl"),
    ("MCH",                 "MCH",                 "Hämatologie",      "pg"),
    ("MCHC",                "MCHC",                "Hämatologie",      "g/dl"),
    ("Thrombozyten",        "Thrombozyten",        "Hämatologie",      "/nl"),
]


def run_seed(db: Session) -> None:
    for alias, canonical, category, default_unit in MAPPINGS:
        if not db.query(ParameterMapping).filter_by(alias=alias).first():
            db.add(ParameterMapping(
                alias=alias,
                canonical_name=canonical,
                category=category,
                default_unit=default_unit,
            ))
    db.commit()

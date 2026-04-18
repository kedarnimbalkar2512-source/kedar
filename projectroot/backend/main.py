from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .data import patients_db, cases_db, stats_db
from .models import LicenseVerifyRequest, SymptomAnalysisRequest

app = FastAPI(title="VitalID API", version="0.1.0")

# Allow the frontend (any origin during dev) to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── STATS ──────────────────────────────────────────────────────────────────────

@app.get("/api/stats")
def get_stats():
    """Returns the platform-wide impact numbers shown in the hero and impact section."""
    return stats_db


# ── PATIENT ────────────────────────────────────────────────────────────────────

@app.get("/api/patient/{vid}")
def get_patient(vid: str):
    """
    Returns basic (non-restricted) patient data by VitalID.
    This is what the patient dashboard and QR card display.
    """
    patient = patients_db.get(vid.upper())
    if not patient:
        raise HTTPException(
            status_code=404, detail=f"No patient found with VID: {vid}")
    # Strip the restricted zone — patients see this endpoint too
    safe = {k: v for k, v in patient.items() if k != "restricted"}
    return safe


# ── DOCTOR ─────────────────────────────────────────────────────────────────────

@app.post("/api/doctor/verify")
def verify_doctor(body: LicenseVerifyRequest):
    """
    Simulates license verification.
    In production this would call the NMC / MCI registry API.
    Returns the full patient record including the restricted zone.
    """
    license_no = body.license_no.strip()
    vid = body.vid.upper()

    # Basic validation (real version would call NMC API here)
    if len(license_no) < 4:
        raise HTTPException(
            status_code=400, detail="License number too short.")

    patient = patients_db.get(vid)
    if not patient:
        raise HTTPException(
            status_code=404, detail=f"No patient found with VID: {vid}")

    formatted_license = "MCI-" + license_no.upper().replace(" ",
                                                            "")[:8].ljust(8, "0")

    return {
        "verified": True,
        "doctor_license": formatted_license,
        "access_level": "full",
        "patient": patient,   # includes restricted zone
    }


# ── CASES ──────────────────────────────────────────────────────────────────────

@app.get("/api/cases")
def get_cases():
    """Returns all cases on the collaborative case board."""
    return cases_db


@app.get("/api/cases/{case_id}")
def get_case(case_id: str):
    """Returns a single case by ID."""
    case = next((c for c in cases_db if c["id"] == case_id.upper()), None)
    if not case:
        raise HTTPException(
            status_code=404, detail=f"Case {case_id} not found.")
    return case


# ── AI SYMPTOM ENGINE ──────────────────────────────────────────────────────────

@app.post("/api/ai/analyse")
def analyse_symptoms(body: SymptomAnalysisRequest):
    """
    Matches submitted symptoms against the case database.
    Currently uses simple keyword overlap scoring.
    Replace the scoring logic here later with a real ML model.
    """
    if not body.symptoms:
        raise HTTPException(status_code=400, detail="No symptoms provided.")

    symptoms_lower = [s.lower() for s in body.symptoms]

    # Simple keyword overlap score — placeholder for real ML
    AI_CASE_DB = [
        {
            "title": "Periodic Fever Syndrome (PFAPA)",
            "keywords": ["fever", "cyclic fever", "fatigue", "throat", "pharyngitis", "adenitis", "oral ulcers"],
            "base_score": 92,
            "desc": "Autoimmune-driven periodic fever with pharyngitis, adenitis — matches cyclical fever + fatigue pattern.",
            "differentials": ["TRAPS (TNF receptor-associated)", "Cyclic Neutropenia", "Adult-onset Stills Disease"],
        },
        {
            "title": "Systemic Lupus Erythematosus (SLE)",
            "keywords": ["joint pain", "fatigue", "rash", "fever", "neurological", "oral ulcers"],
            "base_score": 78,
            "desc": "Multi-system autoimmune condition matching joint pain, fatigue, and neurological involvement pattern.",
            "differentials": ["Mixed Connective Tissue Disease", "Fibromyalgia", "Reactive Arthritis"],
        },
        {
            "title": "Postural Tachycardia Syndrome (PoTS)",
            "keywords": ["dizziness", "palpitations", "fatigue", "syncope", "tachycardia"],
            "base_score": 64,
            "desc": "Dysautonomia variant — matches dizziness, fatigue, and palpitation symptom cluster post-viral.",
            "differentials": ["Orthostatic Hypotension", "Chronic Fatigue Syndrome", "Adrenal Insufficiency"],
        },
    ]

    results = []
    for case in AI_CASE_DB:
        matches = sum(1 for kw in case["keywords"] if any(
            kw in s for s in symptoms_lower))
        overlap_ratio = matches / len(case["keywords"])
        # Blend base score with overlap ratio for a variable result
        score = round(case["base_score"] * (0.4 + 0.6 * overlap_ratio))
        score = max(10, min(99, score))  # clamp between 10–99
        results.append({
            "title": case["title"],
            "score": score,
            "desc": case["desc"],
            "differentials": case["differentials"],
        })

    results.sort(key=lambda x: x["score"], reverse=True)

    return {
        "symptoms_analysed": body.symptoms,
        "patient_age": body.patient_age,
        "duration": body.duration,
        "matches": results,
        "disclaimer": "For clinical support only — not a diagnostic tool.",
    }


# ── HEALTH CHECK ───────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "VitalID API is running", "version": "0.1.0"}

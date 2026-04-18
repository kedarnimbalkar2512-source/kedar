# ── PLATFORM STATS ─────────────────────────────────────────────────────────────
stats_db = {
    "retrieval_time_seconds": 2.3,
    "rare_cases_solved": 47,
    "countries_active": 12,
    "cases_in_db": 4219,
}


# ── PATIENTS ───────────────────────────────────────────────────────────────────
# Keyed by VID (uppercase). Add more patients here later.
patients_db = {
    "VID-8842-KX": {
        "vid": "VID-8842-KX",
        "name": "Aryan Mehta",
        "dob": "14 Aug 2002",
        "gender": "Male",
        "age": 22,
        "blood_group": "B+",
        "height": "5ft 11in",
        "weight": "72 kg",
        "critical_allergies": [
            {
                "name": "Penicillin / Beta-lactam antibiotics",
                "reaction": "Urticaria, angioedema",
                "severity": "Critical",
            },
            {
                "name": "Sulfonamides",
                "reaction": "Rash, pruritis. Cross-reactive with Penicillin allergy.",
                "severity": "Severe",
            },
            {
                "name": "Latex",
                "reaction": "Contact dermatitis. Gloves must be latex-free.",
                "severity": "Moderate",
            },
        ],
        "active_conditions": [
            {"name": "Mild asthma", "status": "Managed"},
            {"name": "Myopia (-2.5 / -3.0)", "status": "Stable"},
        ],
        "vaccinations": [
            {"name": "COVID-19 (Covishield)", "status": "Done"},
            {"name": "Hepatitis B", "status": "Done"},
            {"name": "Typhoid", "status": "Done"},
        ],
        "prescriptions": {
            "current": [
                {
                    "name": "Budecort 200 Inhaler",
                    "dosage": "2 puffs twice daily",
                    "reason": "Asthma management",
                    "status": "Active",
                },
                {
                    "name": "Salbutamol 100mcg (Rescue)",
                    "dosage": "As needed",
                    "reason": "Acute bronchospasm",
                    "status": "PRN",
                },
            ],
            "past": [
                {
                    "name": "Amoxicillin 500mg",
                    "status": "Discontinued",
                    "note": "Allergic reaction",
                },
                {
                    "name": "Cetirizine 10mg",
                    "status": "Completed",
                    "note": "",
                },
            ],
        },
        "history": [
            {
                "event": "Asthma Diagnosis",
                "detail": "Diagnosed age 12 — Mild persistent. No hospitalizations.",
                "year": "2014",
            },
            {
                "event": "Allergic Reaction — Penicillin",
                "detail": "Urticaria and angioedema. Treated with antihistamines. Flagged as severe.",
                "year": "2018",
            },
            {
                "event": "Appendectomy",
                "detail": "Laparoscopic procedure. Ruby Hall Clinic, Pune. No complications.",
                "year": "2021",
            },
        ],
        "recent_visits": [
            {
                "description": "General Consultation — Dr. Sharma, Apollo Pune",
                "date": "14 Mar 2025",
            },
            {
                "description": "Pulmonology Follow-up — Chest X-ray clear",
                "date": "02 Jan 2025",
            },
            {
                "description": "Eye Checkup — Prescription renewed",
                "date": "18 Nov 2024",
            },
        ],
        # This key is stripped for patient-facing requests; only returned to verified doctors
        "restricted": {
            "diagnosis": "Generalised Anxiety Disorder (DSM-5)",
            "psychiatrist": "Dr. Rao, NIMHANS",
            "medication": "Escitalopram 10mg — ongoing",
            "notes": "Patient is aware of diagnosis. Stable on current medication.",
        },
    }
}


# ── CASES ──────────────────────────────────────────────────────────────────────
cases_db = [
    {
        "id": "CASE-2025-0142",
        "urgency": "Active",
        "category": "Autoimmune",
        "title": "Cyclical Fever, Fatigue, Oral Ulcers — Undiagnosed, 3 Months",
        "summary": "28F presenting with 5-day fever cycles every 3–4 weeks. ESR/CRP elevated during episodes, normal between. ANA negative. Rheumatology workup inconclusive.",
        "comments_count": 4,
        "hypotheses_count": 3,
        "comments": [
            {
                "author": "Dr. A. — Rheumatology, Mumbai",
                "initials": "RA",
                "text": "Consider PFAPA syndrome — periodic fever, aphthous stomatitis, pharyngitis, adenitis. Classic presentation in adults is rare but documented. Corticosteroid trial is both diagnostic and therapeutic.",
            },
            {
                "author": "Dr. K. — Immunology, Chennai",
                "initials": "KI",
                "text": "If PFAPA confirmed, colchicine has shown strong prophylactic effect in adult cases. Worth trying before considering tonsillectomy.",
            },
        ],
        "ai_suggestion": "3 similar cases matched — pattern consistent with PFAPA or TRAPS. Recommend IL-1 inhibitor trial if corticosteroid response is partial.",
    },
    {
        "id": "CASE-2025-0198",
        "urgency": "Urgent",
        "category": "Metabolic",
        "title": "Unexplained Hypoglycaemia, Non-Diabetic",
        "summary": "Recurrent hypoglycaemia unrelated to fasting or meals. Normal insulin, C-peptide. 34M. No medications. Normal CT pancreas.",
        "comments_count": 6,
        "hypotheses_count": 2,
        "comments": [
            {
                "author": "Dr. B. — Endocrinology, France",
                "initials": "LB",
                "text": "Consider IGF-2 secreting non-islet tumour (NICTH) — rare but fits. Check IGF-2 to IGF-1 ratio. A ratio greater than 10 is diagnostic.",
            },
        ],
        "ai_suggestion": "2 similar cases matched — both resolved as Non-islet cell tumor hypoglycemia (NICTH). Recommend IGF-2/IGF-1 ratio and full-body PET-CT.",
    },
]

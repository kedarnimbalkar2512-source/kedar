# VitalID Backend

Minimal FastAPI backend that serves data to the VitalID frontend.

## Setup

```bash
# 1. Create a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the server
uvicorn main:app --reload
```

The API will be live at http://127.0.0.1:8000

Auto-generated docs (Swagger UI) at http://127.0.0.1:8000/docs

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/stats` | Platform impact stats |
| GET | `/api/patient/{vid}` | Patient data (no restricted zone) |
| POST | `/api/doctor/verify` | Verify doctor license → returns full record |
| GET | `/api/cases` | All case board entries |
| GET | `/api/cases/{case_id}` | Single case |
| POST | `/api/ai/analyse` | Symptom analysis |

### Example requests

**Get patient:**
```
GET http://127.0.0.1:8000/api/patient/VID-8842-KX
```

**Verify doctor:**
```json
POST http://127.0.0.1:8000/api/doctor/verify
{
  "license_no": "ABC1234",
  "vid": "VID-8842-KX"
}
```

**Analyse symptoms:**
```json
POST http://127.0.0.1:8000/api/ai/analyse
{
  "symptoms": ["fatigue", "cyclic fever", "joint pain"],
  "patient_age": 28,
  "duration": "3 months"
}
```

---

## Connecting the frontend

Replace `script.js` in your frontend folder with the `script.js` in this folder.

Add `id` attributes to the HTML elements listed below so the JS can
populate them with API data:

**QR Card:**
- `qr-patient-name`, `qr-patient-vid`, `qr-patient-blood`, `qr-patient-allergy`

**Patient Dashboard:**
- `dash-patient-name`, `dash-sidebar-name`, `dash-sidebar-vid`, `dash-sidebar-blood`
- `dash-age`, `dash-height`, `dash-weight`

**Doctor Record View:**
- `dr-patient-name`, `dr-patient-meta`, `dr-blood-group`
- `dr-critical-allergy`, `dr-conditions`, `dr-medications`, `dr-surgeries`
- `dr-restricted-diagnosis`, `dr-restricted-psychiatrist`, `dr-restricted-medication`

---

## File structure

```
vitalid-backend/
├── main.py          ← FastAPI app, all route handlers
├── models.py        ← Pydantic request/response models
├── data.py          ← All hardcoded data (patients, cases, stats)
├── script.js        ← Updated frontend JS (replaces original)
├── requirements.txt
└── README.md
```

## What's next

- Swap `data.py` dictionaries for a real PostgreSQL database
- Add real MCI/NMC license verification API call in `verify_doctor()`
- Replace keyword scoring in `/api/ai/analyse` with a Bio_ClinicalBERT model
- Add JWT authentication so endpoints are protected
